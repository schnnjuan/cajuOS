import { extract, slugify, UA, type ExtractResult } from "./extract";
import { downloadMp4 } from "./download-mp4";
import { downloadHls } from "./download-hls";

interface Env {
  ALLOWED_ORIGIN?: string;
  VIDEO_DL_CACHE?: KVNamespace;
}

const CACHE_TTL = 600;

/* Rate limit simples via KV (não atômico — race aceitável). */
const RATE_LIMITS: Record<string, { perMinute: number }> = {
  extract: { perMinute: 30 },
  go: { perMinute: 30 },
  dl: { perMinute: 10 },
};

async function rateLimited(
  env: Env,
  ip: string,
  bucket: keyof typeof RATE_LIMITS
): Promise<boolean> {
  const cache = env.VIDEO_DL_CACHE;
  if (!cache || !ip) return false;
  const limit = RATE_LIMITS[bucket].perMinute;
  const minute = Math.floor(Date.now() / 60_000);
  const key = `rl:${bucket}:${ip}:${minute}`;
  try {
    const current = Number((await cache.get(key)) ?? "0");
    if (current >= limit) return true;
    await cache.put(key, String(current + 1), { expirationTtl: 120 });
  } catch {
    // sem KV, sem limit
  }
  return false;
}

async function cachedExtract(
  page: string,
  env: Env
): Promise<{ result: ExtractResult; cached: boolean }> {
  const cache = env.VIDEO_DL_CACHE;
  const key = `v1:${page}`;
  if (cache) {
    try {
      const hit = await cache.get(key, "json");
      if (hit) return { result: hit as ExtractResult, cached: true };
    } catch {
      // cache indisponível — segue sem
    }
  }
  const result = await extract(page);
  if (result.ok && cache) {
    try {
      await cache.put(key, JSON.stringify(result), { expirationTtl: CACHE_TTL });
    } catch {
      // falha de cache não derruba a resposta
    }
  }
  return { result, cached: false };
}

function allowedOrigins(env: Env): Set<string> {
  const set = new Set([
    "https://cajuos.dev",
    "https://www.cajuos.dev",
    "http://localhost:3000",
  ]);
  if (env.ALLOWED_ORIGIN) set.add(env.ALLOWED_ORIGIN);
  return set;
}

function corsHeaders(origin: string | null, allowed: Set<string>): Headers {
  const h = new Headers();
  if (origin && allowed.has(origin)) {
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Vary", "Origin");
    h.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    h.set("Access-Control-Allow-Headers", "Content-Type, Range");
    h.set("Access-Control-Max-Age", "86400");
  }
  return h;
}

function isPrivateHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname.endsWith(".local")) return true;
  if (hostname === "::1" || hostname === "0.0.0.0") return true;
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

function assertPublicHttp(raw: string | null): string {
  if (!raw) throw new Error("missing-url");
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("invalid-url");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("invalid-scheme");
  }
  if (isPrivateHost(u.hostname)) throw new Error("private-url");
  return u.href;
}

function buildCommand(
  result: ExtractResult,
  format: "curl" | "aria2",
  origin: string
): string {
  const lines: string[] = [`# ${result.title}`];
  for (const s of result.sources.slice(0, 5)) {
    const out = `${slugify(result.title)}_${s.quality}.${result.type === "hls" ? "ts" : s.ext}`;
    if (result.type === "hls") {
      lines.push(
        format === "curl"
          ? `curl -L '${origin}/go?page=${encodeURIComponent(result.page)}&q=${encodeURIComponent(s.quality)}' -o '${out}'`
          : `# hls: use the curl command (aria2 cannot concat .ts segments)`
      );
    } else if (format === "curl") {
      lines.push(`curl -L -A '${UA}' -e '${result.page}' -o '${out}' '${s.url}'`);
    } else {
      lines.push(`aria2c -x16 -s16 --referer='${result.page}' -o '${out}' '${s.url}'`);
    }
  }
  return lines.join("\n");
}

async function handleExtract(
  request: Request,
  url: URL,
  cors: Headers,
  env: Env
): Promise<Response> {
  const page = assertPublicHttp(url.searchParams.get("page"));
  const format = (url.searchParams.get("format") ?? "json") as
    | "json"
    | "curl"
    | "aria2";
  const result = await cachedExtract(page, env);
  if (!result.result.ok) {
    return Response.json(result.result, { status: 404, headers: cors });
  }
  if (format === "curl" || format === "aria2") {
    const text = buildCommand(result.result, format, new URL(request.url).origin);
    const headers = new Headers(cors);
    headers.set("Content-Type", "text/plain; charset=utf-8");
    headers.set("X-Cache", result.cached ? "HIT" : "MISS");
    return new Response(text, { headers });
  }
  const headers = new Headers(cors);
  headers.set("X-Cache", result.cached ? "HIT" : "MISS");
  return Response.json(result.result, { headers });
}

async function handleGo(
  request: Request,
  url: URL,
  cors: Headers,
  env: Env
): Promise<Response> {
  const page = assertPublicHttp(url.searchParams.get("page"));
  const q = url.searchParams.get("q");
  const result = await cachedExtract(page, env);
  if (!result.result.ok) {
    return Response.json(result.result, { status: 404, headers: cors });
  }
  let source = result.result.sources[0];
  if (q) source = result.result.sources.find((s) => s.quality === q) ?? source;
  const origin = new URL(request.url).origin;
  const name = slugify(result.result.title);
  const dl = `${origin}/${result.result.type === "hls" ? "dl/hls" : "dl/mp4"}?url=${encodeURIComponent(source.url)}&ref=${encodeURIComponent(result.result.page)}&name=${name}`;
  const headers = new Headers({ Location: dl });
  headers.set("X-Cache", result.cached ? "HIT" : "MISS");
  return new Response(null, { status: 302, headers });
}

async function handleDl(
  request: Request,
  url: URL,
  cors: Headers
): Promise<Response> {
  const isHls = url.pathname.endsWith("/hls");
  const target = assertPublicHttp(url.searchParams.get("url"));
  const ref = url.searchParams.get("ref") ?? "";
  if (ref) assertPublicHttp(ref);
  const name = slugify(url.searchParams.get("name") ?? "video");

  const resp = isHls
    ? await downloadHls({ url: target, referer: ref, name })
    : await downloadMp4(request, { url: target, referer: ref, name });

  cors.forEach((v, k) => resp.headers.set(k, v));
  return resp;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, allowedOrigins(env));

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "GET") {
      return Response.json({ ok: false, error: "method-not-allowed" }, { status: 405, headers: cors });
    }

    try {
      const path = url.pathname;
      const ip = request.headers.get("CF-Connecting-IP") ?? "";
      let bucket: keyof typeof RATE_LIMITS | null = null;
      if (path === "/extract") bucket = "extract";
      else if (path === "/go") bucket = "go";
      else if (path === "/dl/mp4" || path === "/dl/hls") bucket = "dl";

      if (bucket && (await rateLimited(env, ip, bucket))) {
        const resp = Response.json(
          { ok: false, error: "rate-limited" },
          { status: 429, headers: cors }
        );
        resp.headers.set("Retry-After", "60");
        return resp;
      }

      if (path === "/extract") return await handleExtract(request, url, cors, env);
      if (path === "/go") return await handleGo(request, url, cors, env);
      if (path === "/dl/mp4" || path === "/dl/hls") {
        return await handleDl(request, url, cors);
      }
      return Response.json({ ok: false, error: "not-found" }, { status: 404, headers: cors });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      const bad = ["missing-url", "invalid-url", "invalid-scheme", "private-url"];
      return Response.json(
        { ok: false, error: msg },
        { status: bad.includes(msg) ? 400 : 500, headers: cors }
      );
    }
  },
} satisfies ExportedHandler<Env>;
