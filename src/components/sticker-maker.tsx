"use client";

import { useCallback, useRef, useState } from "react";
import { strToU8, zipSync } from "fflate";

// Figurinha: webp 512×512 quadrado. Foto/vídeo ≤10s/gif → conversão server.
const SIZE = 512;
const ANIM_FPS = 12;
const MAX_FRAMES = 120; // 10s × 12fps
const MAX_INPUT_BYTES = 4 * 1024 * 1024; // limite de body do Vercel é 4.5MB

type Sticker = { blob: Blob; anim: boolean };

type Status = "idle" | "read" | "send" | "done" | "error";

const ERRORS: Record<string, string> = {
  "body-ruim": "O servidor não entendeu a entrada.",
  "modo-inválido": "O servidor não entendeu a entrada.",
  "sem-entrada": "O servidor não recebeu nada pra converter.",
  "ffmpeg-falhou": "A conversão falhou. Tenta outro arquivo.",
  "sem-frame": "Não consegui extrair nenhum frame.",
  "inoquear": "Arquivo grande demais. Limite: 4MB.",
  "codeco-quente": "Formato não suportado. Usa jpg, png, gif, mp4 ou webm.",
};

function humanError(code: string, fallback: string): string {
  return ERRORS[code] ?? fallback ?? "Falhou. Tenta de novo.";
}

// Desenha cover-crop quadrado em canvas novo
function squareCanvas(
  source: ImageBitmap | HTMLVideoElement | CanvasImageSource,
  sw: number,
  sh: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("sem-canvas");
  const side = Math.min(sw, sh);
  const sx = (sw - side) / 2;
  const sy = (sh - side) / 2;
  ctx.drawImage(
    source as CanvasImageSource,
    sx,
    sy,
    side,
    side,
    0,
    0,
    SIZE,
    SIZE
  );
  return canvas;
}

function canvasJpeg(canvas: HTMLCanvasElement, q: number): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", q)
  );
}

async function videoFrames(file: File) {
  const url = URL.createObjectURL(file);
  const v = document.createElement("video");
  v.muted = true;
  v.preload = "auto";
  v.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      v.onloadedmetadata = () => resolve();
      v.onerror = () => reject(new Error("inoquear"));
    });
    const dur = Math.min(v.duration, 10);
    if (!Number.isFinite(dur) || dur <= 0.1) throw new Error("inoquear");
    const total = Math.max(1, Math.min(Math.ceil(dur * ANIM_FPS), MAX_FRAMES));
    const frames: Blob[] = [];
    for (let i = 0; i < total; i++) {
      await new Promise<void>((resolve, reject) => {
        v.onseeked = () => resolve();
        v.onerror = () => reject(new Error("io-falha"));
        v.currentTime = Math.min(v.duration - 0.05, i / ANIM_FPS);
      });
      frames.push((await canvasJpeg(squareCanvas(v, v.videoWidth, v.videoHeight), 0.7)) as Blob);
    }
    return { frames, fps: ANIM_FPS, mode: "anim" as const };
  } finally {
    URL.revokeObjectURL(url);
    v.removeAttribute("src");
  }
}

async function gifFrames(file: File) {
  const dec = new ImageDecoder({ data: await file.arrayBuffer(), type: file.type });
  await dec.tracks.ready;
  const track = dec.tracks.selectedTrack;
  const count = Math.min(track?.frameCount ?? 1, MAX_FRAMES);
  if (!count) throw new Error("inoquear");
  const frames: Blob[] = [];
  for (let i = 0; i < count; i++) {
    const { image } = await dec.decode({ frameIndex: i });
    frames.push(
      (await canvasJpeg(squareCanvas(image, image.displayWidth, image.displayHeight), 0.7)) as Blob
    );
    image.close?.();
  }
    // shortcut: gif com delays variados perde timing (fps const 12);
    // usar timestamps reais do decoder se um dia importar
    return { frames, fps: 12, mode: "anim" as const };
}

async function photoFrame(file: File) {
  const bmp = await createImageBitmap(file);
  const blob = await canvasJpeg(squareCanvas(bmp, bmp.width, bmp.height), 0.85);
  bmp.close?.();
  if (!blob) throw new Error("inoquear");
  return { frames: [blob], fps: 12, mode: "photo" as const };
}

async function extract(
  file: File
): Promise<{ frames: Blob[]; fps: number; mode: "photo" | "anim" | "gif" }> {
  if (file.size > MAX_INPUT_BYTES) throw new Error("inoquear");
  if (file.type === "image/gif") {
    if ("ImageDecoder" in window) return gifFrames(file);
    // Sem ImageDecoder: manda o gif cru pro server decodificar
    return { frames: [file], fps: 12, mode: "gif" as const };
  }
  if (file.type.startsWith("video/")) return videoFrames(file);
  if (file.type.startsWith("image/")) return photoFrame(file);
  throw new Error("codeco-quente");
}

async function convert(
  file: File
): Promise<{ blob: Blob; anim: boolean }> {
  const { frames, fps, mode } = await extract(file);
  if (frames.length === 0) throw new Error("sem-frame");
  const form = new FormData();
  form.set("mode", mode);
  form.set("fps", String(fps));
  for (const f of frames) form.append("f", f, "f.img");
  const resp = await fetch("/api/tools/sticker", { method: "POST", body: form });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.error ?? "server-erro");
  }
  const data = await resp.json();
  const bytes = Uint8Array.from(atob(data.webp), (c) => c.charCodeAt(0));
  return { blob: new Blob([bytes], { type: "image/webp" }), anim: data.anim };
}

function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// Web Share nível 2 (mobile) abre o WhatsApp com a figurinha.
// No desktop não existe — cai pra WhatsApp Web: copia e cola (estático)
// ou baixa e anexa (animado).
async function sendToWhatsapp(blob: Blob, anim: boolean, title: string): Promise<string> {
  const file = new File([blob], "figurinha.webp", { type: "image/webp" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title,
        text: "Figurinha feita no cajuOS",
      });
      return "Enviado pra escolher o contato 👍";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "";
    }
  }
  // Desktop + estático: ClipboardItem aceita png universalmente
  if (!anim && navigator.clipboard?.write && window.ClipboardItem) {
    try {
      const bmp = await createImageBitmap(blob);
      const c = document.createElement("canvas");
      c.width = SIZE;
      c.height = SIZE;
      c.getContext("2d")?.drawImage(bmp, 0, 0);
      bmp.close?.();
      const png = await new Promise<Blob | null>((resolve) =>
        c.toBlob(resolve, "image/png")
      );
      if (png) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
        window.open("https://web.whatsapp.com/", "_blank");
        return "Imagem copiada — abre (ou colou no) chat e cola com Ctrl+V";
      }
    } catch {
      // sem permissão/decoy — cai pro download
    }
  }
  download(blob, "figurinha.webp");
  window.open("https://web.whatsapp.com/", "_blank");
  return anim
    ? "Baixou — anexa o arquivo (webp) no chat do WhatsApp Web"
    : "Baixou e abriu o zap web — anexa o arquivo no chat";
}

// Pacote .wastickers = zip (STORE) com title.txt, author.txt, webps por
// timestamp e ícone png 96×96. Importável no Sticker Maker (Android e iOS).
async function buildPack(
  title: string,
  author: string,
  stickers: Sticker[]
): Promise<Blob> {
  const listAll = [...stickers];
  // Sticker Maker exige mínimo de 3 figurinhas — repete a última se faltar
  while (listAll.length < 3) listAll.push(listAll[listAll.length - 1]);

  const asU8 = async (b: Blob) =>
    new Uint8Array(await b.arrayBuffer());

  // Ícone de pacote: primeira figurinha em 96×96 png
  const trayBmp = await createImageBitmap(listAll[0].blob);
  const tray = document.createElement("canvas");
  tray.width = 96;
  tray.height = 96;
  tray.getContext("2d")?.drawImage(trayBmp, 0, 0, 96, 96);
  trayBmp.close?.();
  const trayPng = await new Promise<Blob | null>((resolve) =>
    tray.toBlob(resolve, "image/png")
  );

  const files: Record<string, [Uint8Array, { level: 0 }]> = {};
  const base = Math.floor(Date.now() / 1000);
  files["title.txt"] = [strToU8(title), { level: 0 }];
  files["author.txt"] = [strToU8(author), { level: 0 }];
  for (const [i, s] of listAll.entries()) {
    files[`${base + i}.webp`] = [await asU8(s.blob), { level: 0 }];
  }
  if (trayPng) files["cover.png"] = [await asU8(trayPng), { level: 0 }];

  return new Blob([zipSync(files)], { type: "application/octet-stream" });
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "figurinhas"
  );
}

interface PackItem extends Sticker {
  id: number;
  url: string;
}

export default function StickerMaker() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Sticker | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [pack, setPack] = useState<PackItem[]>([]);
  const [title, setTitle] = useState("Minhas figurinhas");
  const [author, setAuthor] = useState("cajuOS");
  const [packing, setPacking] = useState(false);
  const [zapMsg, setZapMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("read");
    setError("");
    setResult(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    try {
      const { blob, anim } = await convert(file);
      setResult({ blob, anim });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch (e) {
      setStatus("error");
      setError(humanError((e as Error).message, "Falhou. Verifica o formato."));
    }
  }

  const addPack = useCallback(() => {
    if (!result) return;
    setPack((prev) => [
      ...prev,
      { ...result, id: Date.now() + Math.random(), url: URL.createObjectURL(result.blob) },
    ]);
  }, [result]);

  const packDownload = useCallback(async () => {
    if (pack.length === 0) return;
    setPacking(true);
    try {
      const zip = await buildPack(title.trim() || "Minhas figurinhas", author.trim() || "cajuOS", pack);
      download(zip, `${slugify(title)}.wastickers`);
    } catch {
      setError("Não consegui montar o pacote.");
      setStatus("error");
    } finally {
      setPacking(false);
    }
  }, [pack, title, author]);

  const busy = status === "read" || status === "send";

  return (
    <div className="space-y-10">
      {/* Conversor */}
      <section className="rounded-xl border border-border bg-card p-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/gif,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="pressable w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {busy ? "Convertendo…" : "Escolher foto, gif ou vídeo (≤10s)"}
        </button>
        <p className="mt-2 text-xs text-muted">
          Vira webp 512×512, quadrado perfeito. Animado sai ≤500KB, estático ≤100KB (limites do WhatsApp).
        </p>

        {busy && (
          <div className="mt-4 flex h-32 items-center justify-center rounded-md border border-border text-xs text-muted">
            {status === "read" ? "Extraindo…" : "Codificando no server…"}
          </div>
        )}

        {status === "error" && <p className="mt-4 text-sm text-red-500">{error}</p>}

        {status === "done" && result && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resultUrl}
              alt="Figurinha gerada"
              className="mx-auto w-40 rounded-md"
            />
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <button
                onClick={() =>
                  void sendToWhatsapp(result.blob, result.anim, title).then(setZapMsg)
                }
                className="pressable rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
              >
                Mandar no zap
              </button>
              <button
                onClick={() => download(result.blob, "figurinha.webp")}
                className="pressable rounded-md border border-border px-3 py-2 text-sm hover:border-foreground"
              >
                Baixar
              </button>
              <button
                onClick={addPack}
                className="pressable rounded-md border border-border px-3 py-2 text-sm hover:border-foreground"
              >
                + Pacote ({pack.length})
              </button>
              <button
                onClick={() => inputRef.current?.click()}
                className="pressable rounded-md border border-border px-3 py-2 text-sm hover:border-foreground"
              >
                Outra
              </button>
            </div>
            {zapMsg && (
              <p className="mt-2 text-center text-xs text-muted">{zapMsg}</p>
            )}
          </div>
        )}
      </section>

      {/* Pacote */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">Pacote 📦</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs font-medium">Nome do pacote</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={128}
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium">Autor</span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={128}
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
            />
          </label>
        </div>

        {pack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {pack.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.id}
                src={s.url}
                alt=""
                className="h-14 w-14 cursor-pointer rounded-md border border-border"
                onClick={() =>
                  setPack((prev) => prev.filter((p) => p.id !== s.id))
                }
              />
            ))}
          </div>
        )}

        <button
          onClick={() => void packDownload()}
          disabled={pack.length === 0 || packing}
          className="pressable mt-4 w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {packing ? "Empacotando…" : "Baixar pacote .wastickers"}
        </button>
        {pack.length > 0 && pack.length < 3 && (
          <p className="mt-2 text-xs text-muted">
            O Sticker Maker pede 3+ figurinhas — faltam {3 - pack.length}. Faltando menos, a última volta repetida.
          </p>
        )}
        <p className="mt-3 text-xs text-muted">
          «Mandar no zap»: no celular abre o WhatsApp com a figurinha direto; no
          desktop copia e abre o WhatsApp Web pra colar (Ctrl+V). Pra virar
          figurinha de verdade, baixa o pacote e importa no Sticker Maker
          (Android e iOS).
        </p>
      </section>
    </div>
  );
}
