import { extract, slugify, UA, type ExtractResult } from "./extract";
import { downloadMp4 } from "./download-mp4";
import { downloadHls } from "./download-hls";

interface Env {
  ALLOWED_ORIGIN?: string;
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
  cors: Headers
): Promise<Response> {
  const page = assertPublicHttp(url.searchParams.get("page"));
  const format = (url.searchParams.get("format") ?? "json") as
    | "json"
    | "curl"
    | "aria2";
  const result = await extract(page);
  if (!result.ok) {
    return Response.json(result, { status: 404, headers: cors });
  }
  if (format === "curl" || format === "aria2") {
    const text = buildCommand(result, format, new URL(request.url).origin);
    const headers = new Headers(cors);
    headers.set("Content-Type", "text/plain; charset=utf-8");
    return new Response(text, { headers });
  }
  return Response.json(result, { headers: cors });
}

async function handleGo(
  request: Request,
  url: URL,
  cors: Headers
): Promise<Response> {
  const page = assertPublicHttp(url.searchParams.get("page"));
  const q = url.searchParams.get("q");
  const result = await extract(page);
  if (!result.ok) {
    return Response.json(result, { status: 404, headers: cors });
  }
  let source = result.sources[0];
  if (q) source = result.sources.find((s) => s.quality === q) ?? source;
  const origin = new URL(request.url).origin;
  const name = slugify(result.title);
  const dl = `${origin}/${result.type === "hls" ? "dl/hls" : "dl/mp4"}?url=${encodeURIComponent(source.url)}&ref=${encodeURIComponent(result.page)}&name=${name}`;
  return Response.redirect(dl, 302);
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
      if (path === "/extract") return await handleExtract(request, url, cors);
      if (path === "/go") return await handleGo(request, url, cors);
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
