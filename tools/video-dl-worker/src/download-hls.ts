import { UA, resolveUrl } from "./extract";

export interface HlsParams {
  url: string;
  referer: string;
  name: string;
}

interface SegmentPlan {
  segments: string[];
  mediaType: string;
}

async function fetchWith(
  url: string,
  referer: string
): Promise<Response> {
  return fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: {
      "User-Agent": UA,
      ...(referer ? { Referer: referer } : {}),
    },
  });
}

async function planSegments(manifestUrl: string, referer: string): Promise<SegmentPlan> {
  const resp = await fetchWith(manifestUrl, referer);
  if (!resp.ok) throw new Error(resp.status === 403 || resp.status === 401 ? "blocked" : "manifest-failed");
  const text = await resp.text();

  const encrypted = text
    .split("\n")
    .some((l) => l.startsWith("#EXT-X-KEY:") && !/METHOD=NONE/.test(l));
  if (encrypted) {
    throw new Error("encrypted-unsupported");
  }

  const hasEndlist = text.includes("#EXT-X-ENDLIST");
  if (!hasEndlist) throw new Error("live-stream");

  const mediaType = text.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/) ? "sequence" : "static";

  const segments: string[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    segments.push(resolveUrl(manifestUrl, trimmed));
  }

  if (segments.length === 0) throw new Error("no-segments");
  return { segments, mediaType };
}

export async function downloadHls(p: HlsParams): Promise<Response> {
  let plan: SegmentPlan;
  try {
    plan = await planSegments(p.url, p.referer);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return Response.json({ ok: false, error: msg }, { status: msg === "live-stream" ? 400 : 502 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const segUrl of plan.segments) {
        let resp: Response;
        try {
          resp = await fetchWith(segUrl, p.referer);
        } catch {
          controller.error(new Error("segment-failed"));
          return;
        }
        if (!resp.ok || !resp.body) {
          controller.error(new Error("segment-failed"));
          return;
        }
        const reader = resp.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch {
          controller.error(new Error("segment-failed"));
          return;
        }
      }
      controller.close();
    },
  });

  const headers = new Headers();
  headers.set("Content-Type", "video/mp2t");
  headers.set("Content-Disposition", `attachment; filename="${p.name}.ts"`);
  headers.set("Accept-Ranges", "bytes");
  return new Response(stream, { status: 200, headers });
}
