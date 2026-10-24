// Conversor pra figurinha do WhatsApp: recebe frames/fotos/gif e devolve
// webp 512×512 (≤100KB estático, ≤500KB animado — limites do WhatsApp).
import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegStatic from "ffmpeg-static";

export const runtime = "nodejs";
export const maxDuration = 60;

const FFmpeg = (ffmpegStatic ?? "ffmpeg") as string;
const SIZE = 512;
const TARGETS = { photo: 100_000, anim: 500_000 } as const;
const Q_LADDER = [80, 60, 45, 30, 18];

type Mode = "photo" | "anim" | "gif";

// Encode → arquivo temp (o muxer webp precisa de saída seekável pro
// tamanho RIFF; em pipe sai com size 0, webp inválido). Resolve Buffer ou null.
function encode(
  bufs: Buffer[],
  mode: Mode,
  fps: number,
  q: number,
  decimate: boolean
): Promise<{ buffer: Buffer }> {
  const single = mode === "photo";
  const inBufs = decimate && !single ? bufs.filter((_, i) => i % 2 === 0) : bufs;
  const inFps = decimate ? Math.max(1, Math.round(fps / 2)) : fps;

  const args: string[] = ["-hide_banner", "-nostats", "-loglevel", "error"];
  // gif cru pode passar de 10s — corta no limite das figurinhas animadas
  if (mode === "gif") args.push("-t", "10");
  if (single || mode === "gif") {
    args.push("-i", "pipe:0");
  } else {
    args.push("-f", "image2pipe", "-framerate", String(inFps), "-i", "pipe:0");
  }
  args.push(
    "-an",
    "-sn",
    "-c:v",
    "libwebp",
    "-lossless",
    "0",
    "-compression_level",
    "6",
    "-q:v",
    String(q),
    "-loop",
    "0",
    "-vf",
    `scale=${SIZE}:${SIZE}:force_original_aspect_ratio=increase,crop=${SIZE}:${SIZE}`,
    "-f",
    "webp"
  );

  return (async () => {
    const dir = await mkdtemp(join(tmpdir(), "cajuos-sticker-"));
    const outPath = join(dir, "out.webp");
    try {
      await new Promise<void>((resolve, reject) => {
        const p = spawn(FFmpeg, args.concat(outPath));
        let stderr = "";
        p.stderr.on("data", (c: Buffer) => {
          stderr = (stderr + c).slice(-500);
        });
        const kill = setTimeout(() => p.kill("SIGKILL"), 45_000);
        p.on("close", (code) => {
          clearTimeout(kill);
          if (code === 0) resolve();
          else reject(new Error(stderr || `ffmpeg saiu com código ${code}`));
        });
        p.on("error", reject);
        void (async () => {
          for (const b of inBufs) {
            if (!p.stdin.write(b)) await once(p.stdin, "drain");
          }
          p.stdin.end();
        })();
      });
      const buffer = await readFile(outPath);
      return { buffer };
    } finally {
      void rm(dir, { recursive: true, force: true });
    }
  })();
}

function clampFps(raw: FormDataEntryValue | null): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 15) : 12;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "body-ruim" }, { status: 400 });
  }

  const mode = String(form.get("mode") ?? "") as Mode;
  if (mode !== "photo" && mode !== "anim" && mode !== "gif") {
    return NextResponse.json({ error: "modo-inválido" }, { status: 400 });
  }

  const files = form.getAll("f").filter((f): f is File => f instanceof Blob);
  if (files.length === 0 || files.length > 300) {
    return NextResponse.json({ error: "sem-entrada" }, { status: 400 });
  }

  const bufs: Buffer[] = [];
  for (const f of files) {
    const ab = await f.arrayBuffer();
    bufs.push(Buffer.from(ab));
  }

  const fps = clampFps(form.get("fps"));
  const target = TARGETS[mode === "photo" ? "photo" : "anim"];
  let out: Buffer | null = null;
  try {
    for (const q of Q_LADDER) {
      out = (await encode(bufs, mode, fps, q, false)).buffer;
      if (out.length <= target) break;
    }
    // Última tentativa: decima metade dos frames (menos motion, menos bytes)
    if (out && out.length > target && mode === "anim") {
      try {
        out = (await encode(bufs, mode, fps, 18, true)).buffer;
      } catch {
        // mantém o melhor resultado anterior
      }
    }
  } catch (e) {
    return NextResponse.json(
      { error: "ffmpeg-falhou", message: (e as Error).message },
      { status: 500 }
    );
  }

  if (!out) {
    return NextResponse.json({ error: "ffmpeg-falhou" }, { status: 500 });
  }

  return NextResponse.json({
    webp: out.toString("base64"),
    bytes: out.length,
    anim: mode !== "photo",
    avisos: out.length > target ? ["nao-compactou-o-suficiente"] : [],
  });
}
