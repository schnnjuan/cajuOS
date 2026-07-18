"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ── Constants ──────────────────────────────────────────
const PALETTES = [
  { id: "classic", name: "Classic", bg: "#ffffff", text: "#18181b", accent: "#18181b", watermark: "#a1a1aa" },
  { id: "slate",   name: "Slate",   bg: "#f4f4f5", text: "#18181b", accent: "#09090b", watermark: "#71717a" },
  { id: "warm",    name: "Warm",    bg: "#fefce8", text: "#292524", accent: "#d97706", watermark: "#a8a29e" },
  { id: "minimal", name: "Minimal", bg: "#18181b", text: "#fafafa", accent: "#fafafa", watermark: "#52525b" },
  { id: "deep",    name: "Deep",    bg: "#09090b", text: "#e4e4e7", accent: "#a78bfa", watermark: "#52525b" },
];

const SIZE_PRESETS = [
  { w: 1200, h: 630,  label: "OG" },
  { w: 1080, h: 1080, label: "Square" },
  { w: 1200, h: 1200, label: "Instagram" },
] as const;

type LayoutMode = "center" | "left";

// ── Helpers ────────────────────────────────────────────
function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + "\u2026";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "og-image";
}

function measureAndFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseSize: number,
  fontFamily: string,
): { size: number; fitted: string } {
  let size = baseSize;
  let fitted = text;
  while (size >= Math.round(28 * (baseSize / 64))) {
    ctx.font = `700 ${size}px ${fontFamily}`;
    if (ctx.measureText(fitted).width <= maxWidth) break;
    if (size <= 32 && fitted.length > 10) {
      fitted = truncate(fitted, Math.max(10, fitted.length - 5));
    } else {
      size = Math.max(Math.round(28 * (baseSize / 64)), size - 4);
    }
  }
  return { size, fitted };
}

function drawBgImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number, overlay: number) {
  const imgRatio = img.width / img.height;
  const cnvRatio = W / H;
  let sx, sy, sw, sh;
  if (imgRatio > cnvRatio) {
    sh = img.height;
    sw = sh * cnvRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / cnvRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  if (overlay > 0) {
    ctx.fillStyle = `rgba(0,0,0,${overlay})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function drawOgImage(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  title: string,
  subtitle: string,
  palette: (typeof PALETTES)[number],
  fontFamily: string,
  logoImg: HTMLImageElement | null,
  bgImg: HTMLImageElement | null,
  layout: LayoutMode,
  overlay: number,
) {
  const { bg, text, accent, watermark } = palette;
  const s = W / 1200; // scale factor

  // Background
  if (bgImg) {
    drawBgImage(ctx, bgImg, W, H, overlay);
  } else {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  // Accent bar
  const barH = Math.max(4, Math.round(6 * s));
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, accent + "20");
  grad.addColorStop(1, accent + "05");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, barH);

  // ── Logo ──
  let logoRight = 0;
  const pad = Math.round(32 * s);
  const logoMaxW = Math.round(80 * s);

  if (logoImg) {
    const scale = Math.min(1, logoMaxW / logoImg.width);
    const lw = logoImg.width * scale;
    const lh = logoImg.height * scale;
    ctx.drawImage(logoImg, pad, pad, lw, lh);
    logoRight = pad + lw + Math.round(16 * s);
  }

  const forceLeft = layout === "left" || logoRight > 0;
  const titleX = forceLeft && logoRight > 0 ? logoRight : forceLeft ? pad : W / 2;
  const textAlign: CanvasTextAlign = forceLeft ? "left" : "center";

  // ── Title ──
  const maxTitleChars = Math.round(62 * Math.min(1, s));
  const displayTitle = truncate(title || "Seu título aqui", maxTitleChars);
  ctx.fillStyle = text;
  ctx.textBaseline = "middle";

  const baseFontSize = Math.round(64 * s * Math.min(1, H / 630));
  const maxLineW = Math.round(980 * s);

  const words = displayTitle.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const test = currentLine ? currentLine + " " + word : word;
    ctx.font = `700 ${baseFontSize}px ${fontFamily}`;
    if (ctx.measureText(test).width > maxLineW && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);

  let titleLines = lines;
  if (lines.length > 2) {
    titleLines = [lines[0], lines.slice(1).join(" ")];
    titleLines[1] = truncate(titleLines[1], maxTitleChars);
  }

  let fontSize = baseFontSize;
  for (const line of titleLines) {
    ctx.font = `700 ${baseFontSize}px ${fontFamily}`;
    if (ctx.measureText(line).width > maxLineW) {
      const result = measureAndFit(ctx, line, maxLineW, baseFontSize, fontFamily);
      fontSize = Math.min(fontSize, result.size);
    }
  }

  ctx.font = `700 ${fontSize}px ${fontFamily}`;

  const isSquare = W > H * 1.1;
  const titleY = isSquare
    ? Math.round(H * 0.38)
    : titleLines.length > 1
      ? Math.round(H * 0.28)
      : Math.round(H * 0.35);

  ctx.textAlign = textAlign;
  if (titleLines.length === 1) {
    ctx.fillText(titleLines[0], titleX, titleY);
  } else {
    const lineH = Math.min(fontSize + Math.round(8 * s), Math.round(72 * s));
    ctx.fillText(titleLines[0], titleX, titleY - lineH / 2);
    ctx.fillText(titleLines[1], titleX, titleY + lineH / 2);
  }

  // ── Subtitle ──
  if (subtitle) {
    const subSize = Math.round(28 * s);
    ctx.fillStyle = watermark;
    ctx.font = `400 ${subSize}px ${fontFamily}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "top";
    ctx.fillText(
      truncate(subtitle, Math.round(90 * Math.min(1, s))),
      titleX,
      titleY + (titleLines.length > 1 ? Math.round(56 * s) : Math.round(36 * s)) + fontSize * 0.3,
    );
  }

  // ── Watermark ──
  const wmSize = Math.round(16 * s);
  ctx.fillStyle = watermark;
  ctx.font = `500 ${wmSize}px ${fontFamily}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("cajuos.dev", W - pad, H - Math.round(24 * s));
}

// ── Component ─────────────────────────────────────────
export default function OgImageGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [paletteId, setPaletteId] = useState("classic");
  const [sizeIdx, setSizeIdx] = useState(0);
  const [layout, setLayout] = useState<LayoutMode>("center");
  const [fontFamily, setFontFamily] = useState("Inter, system-ui, sans-serif");
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [overlay, setOverlay] = useState(0.35);

  const sizePreset = SIZE_PRESETS[sizeIdx];
  const W = sizePreset.w;
  const H = sizePreset.h;
  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];

  // Resolve font-family do CSS variable --font-geist-sans
  useEffect(() => {
    const cssFont = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-geist-sans")
      .trim();
    if (cssFont) {
      setFontFamily(`${cssFont}, Inter, system-ui, sans-serif`);
    }
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawOgImage(ctx, W, H, title, subtitle, palette, fontFamily, logoImg, bgImg, layout, overlay);
  }, [W, H, title, subtitle, palette, fontFamily, logoImg, bgImg, layout, overlay]);

  useEffect(() => {
    render();
  }, [render]);

  // ── Download ──
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      setDownloading(true);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(title)}-og-image.png`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setTimeout(() => setDownloading(false), 1500);
    }, "image/png");
  };

  // ── Copy to clipboard ──
  const handleCopy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          // eslint-disable-next-line @typescript-eslint/no-deprecated
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopying(true);
        setTimeout(() => setCopying(false), 1500);
      } catch {
        setCopyError(true);
        setTimeout(() => setCopyError(false), 2000);
      }
    }, "image/png");
  };

  // ── Image upload helper ──
  const readImage = (file: File, onLoad: (img: HTMLImageElement) => void) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => onLoad(img);
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImage(file, (img) => {
      setLogoImg(img);
      if (logoInputRef.current) logoInputRef.current.value = "";
    });
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImage(file, (img) => {
      setBgImg(img);
      if (bgInputRef.current) bgInputRef.current.value = "";
    });
  };

  const removeLogo = () => setLogoImg(null);
  const removeBg = () => setBgImg(null);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Preencha os campos abaixo para gerar sua imagem Open Graph.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="og-title" className="text-sm font-medium">Título</label>
          <input
            id="og-title" type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Como gerar sua imagem OG"
            maxLength={65}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
          />
          <p className="mt-1 text-xs text-muted">{title.length}/65</p>
        </div>
        <div>
          <label htmlFor="og-subtitle" className="text-sm font-medium">Subtítulo</label>
          <input
            id="og-subtitle" type="text" value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ex: Uma tool por semana"
            maxLength={95}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
          />
          <p className="mt-1 text-xs text-muted">{subtitle.length}/95</p>
        </div>
      </div>

      {/* Palette */}
      <div>
        <label className="text-sm font-medium">Paleta</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {PALETTES.map((p) => (
            <button key={p.id} onClick={() => setPaletteId(p.id)}
              className={`pressable flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                paletteId === p.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground"
              }`}
            >
              <span className="inline-block h-4 w-4 rounded border"
                style={{ backgroundColor: p.bg, borderColor: paletteId === p.id ? p.bg : p.text + "30" }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Layout + Size */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Layout</label>
          <div className="mt-1 flex gap-2">
            {(["center", "left"] as const).map((m) => (
              <button key={m} onClick={() => setLayout(m)}
                className={`pressable rounded-md border px-3 py-1.5 text-sm ${
                  layout === m
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground"
                }`}
              >
                {m === "center" ? "Centralizado" : "Alinhado à esquerda"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Tamanho</label>
          <div className="mt-1 flex gap-2">
            {SIZE_PRESETS.map((p, i) => (
              <button key={p.label} onClick={() => setSizeIdx(i)}
                className={`pressable rounded-md border px-3 py-1.5 text-sm ${
                  sizeIdx === i
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logo + Background */}
      <div className="flex flex-wrap gap-4">
        <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleLogoChange} className="hidden" />
        <div>
          <label className="text-sm font-medium">Logo</label>
          <div className="mt-1">
            {logoImg ? (
              <button onClick={removeLogo}
                className="pressable rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground">
                Remover logo
              </button>
            ) : (
              <button onClick={() => logoInputRef.current?.click()}
                className="pressable rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground">
                + Logo
              </button>
            )}
          </div>
        </div>
        <input ref={bgInputRef} type="file" accept="image/png,image/jpeg,image/webp"
          onChange={handleBgChange} className="hidden" />
        <div>
          <label className="text-sm font-medium">Fundo</label>
          <div className="mt-1">
            {bgImg ? (
              <button onClick={removeBg}
                className="pressable rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground">
                Remover fundo
              </button>
            ) : (
              <button onClick={() => bgInputRef.current?.click()}
                className="pressable rounded-md border border-border px-3 py-1.5 text-sm hover:border-foreground">
                + Fundo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay (só relevante com fundo) */}
      {bgImg && (
        <div>
          <label className="text-sm font-medium">Escurecimento do fundo</label>
          <div className="mt-1 flex gap-2">
            {[
              { label: "Nenhum", value: 0 },
              { label: "Leve", value: 0.2 },
              { label: "Médio", value: 0.35 },
              { label: "Forte", value: 0.5 },
            ].map((o) => (
              <button key={o.label} onClick={() => setOverlay(o.value)}
                className={`pressable rounded-md border px-3 py-1.5 text-sm ${
                  overlay === o.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview + Actions */}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <canvas
            ref={canvasRef}
            width={W} height={H}
            className="w-full"
            style={{ aspectRatio: `${W}/${H}`, display: "block", maxWidth: `${W}px` }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleDownload} disabled={downloading}
            className={`pressable rounded-md px-4 py-2 text-sm font-medium transition-[color,transform] duration-150 ease-out ${
              downloading ? "bg-muted text-background" : "bg-foreground text-background"
            }`}
          >
            {downloading ? "Baixando\u2026" : "Download PNG"}
          </button>
          {downloading && <span className="text-sm text-muted animate-in">Pronto!</span>}

          <button onClick={handleCopy} disabled={copying}
            className={`pressable rounded-md border px-4 py-2 text-sm font-medium transition-[color,transform] duration-150 ease-out ${
              copyError ? "border-red-500 text-red-500"
                : copying ? "border-muted text-muted"
                : "border-border text-foreground hover:border-foreground"
            }`}
          >
            {copyError ? "Erro ao copiar" : copying ? "Copiado!" : "Copiar PNG"}
          </button>
        </div>
      </div>

      {/* Screen-reader */}
      <p role="status" aria-live="polite" className="sr-only">
        {downloading ? "Download iniciado"
          : copying ? "Imagem copiada"
          : copyError ? "Erro ao copiar"
          : "Pronto para uso"}
      </p>
    </div>
  );
}
