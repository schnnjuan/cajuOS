"use client";

import { useRef, useState, useEffect, useCallback } from "react";

// ── Palettes ──────────────────────────────────────────
const PALETTES = [
  { id: "classic", name: "Classic", bg: "#ffffff", text: "#18181b", accent: "#18181b", watermark: "#a1a1aa" },
  { id: "slate",   name: "Slate",   bg: "#f4f4f5", text: "#18181b", accent: "#09090b", watermark: "#71717a" },
  { id: "warm",    name: "Warm",    bg: "#fefce8", text: "#292524", accent: "#d97706", watermark: "#a8a29e" },
  { id: "minimal", name: "Minimal", bg: "#18181b", text: "#fafafa", accent: "#fafafa", watermark: "#52525b" },
  { id: "deep",    name: "Deep",    bg: "#09090b", text: "#e4e4e7", accent: "#a78bfa", watermark: "#52525b" },
];

const W = 1200;
const H = 630;
const MAX_LINE_WIDTH = 980;

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
  while (size >= 28) {
    ctx.font = `700 ${size}px ${fontFamily}`;
    if (ctx.measureText(fitted).width <= maxWidth) break;
    // Try truncating if reducing size doesn't help enough
    if (size <= 32 && fitted.length > 10) {
      fitted = truncate(fitted, Math.max(10, fitted.length - 5));
    } else {
      size -= 4;
    }
  }
  return { size, fitted };
}

function drawOgImage(
  ctx: CanvasRenderingContext2D,
  title: string,
  subtitle: string,
  palette: (typeof PALETTES)[number],
  fontFamily: string,
) {
  const { bg, text, accent, watermark } = palette;

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Accent bar
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, accent + "20");
  grad.addColorStop(1, accent + "05");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 6);

  // ── Title ──
  const displayTitle = truncate(title || "Seu título aqui", 62);
  ctx.fillStyle = text;
  ctx.textBaseline = "middle";

  // Word wrap
  const words = displayTitle.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const test = currentLine ? currentLine + " " + word : word;
    ctx.font = `700 64px ${fontFamily}`;
    if (ctx.measureText(test).width > MAX_LINE_WIDTH && currentLine) {
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
    titleLines[1] = truncate(titleLines[1], 55);
  }

  // Measure longest line and scale font down if needed
  let fontSize = 64;
  for (const line of titleLines) {
    ctx.font = `700 64px ${fontFamily}`;
    if (ctx.measureText(line).width > MAX_LINE_WIDTH) {
      const result = measureAndFit(ctx, line, MAX_LINE_WIDTH, 64, fontFamily);
      fontSize = Math.min(fontSize, result.size);
    }
  }

  // Apply fitted font size
  ctx.font = `700 ${fontSize}px ${fontFamily}`;

  const titleY = titleLines.length > 1 ? 180 : 220;
  ctx.textAlign = "center";
  if (titleLines.length === 1) {
    ctx.fillText(titleLines[0], W / 2, titleY);
  } else {
    const lineHeight = Math.min(fontSize + 8, 72);
    ctx.fillText(titleLines[0], W / 2, titleY - lineHeight / 2);
    ctx.fillText(titleLines[1], W / 2, titleY + lineHeight / 2);
  }

  // ── Subtitle ──
  if (subtitle) {
    ctx.fillStyle = watermark;
    ctx.font = `400 28px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      truncate(subtitle, 90),
      W / 2,
      titleY + (titleLines.length > 1 ? 56 : 36) + fontSize * 0.3,
    );
  }

  // ── Watermark ──
  ctx.fillStyle = watermark;
  ctx.font = `500 16px ${fontFamily}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("cajuos.dev", W - 32, H - 24);
}

// ── Component ─────────────────────────────────────────
export default function OgImageGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [paletteId, setPaletteId] = useState("classic");
  const [fontFamily, setFontFamily] = useState("Inter, system-ui, sans-serif");
  const [downloading, setDownloading] = useState(false);

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
    drawOgImage(ctx, title, subtitle, palette, fontFamily);
  }, [title, subtitle, palette, fontFamily]);

  useEffect(() => {
    render();
  }, [render]);

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
      // Append to DOM for iOS Safari compatibility
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setTimeout(() => setDownloading(false), 1500);
    }, "image/png");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Preencha os campos abaixo para gerar sua imagem Open Graph.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="og-title" className="text-sm font-medium">
            Título
          </label>
          <input
            id="og-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Como gerar sua imagem OG"
            maxLength={65}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
          />
          <p className="mt-1 text-xs text-muted">{title.length}/65</p>
        </div>
        <div>
          <label htmlFor="og-subtitle" className="text-sm font-medium">
            Subtítulo
          </label>
          <input
            id="og-subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ex: Uma tool por semana"
            maxLength={95}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
          />
          <p className="mt-1 text-xs text-muted">{subtitle.length}/95</p>
        </div>
      </div>

      {/* Palette selector */}
      <div>
        <label className="text-sm font-medium">Paleta</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPaletteId(p.id)}
              className={`pressable flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                paletteId === p.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground"
              }`}
            >
              <span
                className="inline-block h-4 w-4 rounded border"
                style={{
                  backgroundColor: p.bg,
                  borderColor: paletteId === p.id ? p.bg : p.text + "30",
                }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preview + Download */}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full"
            style={{ aspectRatio: "1200/630", display: "block", maxWidth: `${W}px` }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`pressable rounded-md px-4 py-2 text-sm font-medium transition-[color,transform] duration-150 ease-out ${
              downloading
                ? "bg-muted text-background"
                : "bg-foreground text-background"
            }`}
          >
            {downloading ? "Baixando\u2026" : "Download PNG"}
          </button>
          {downloading && (
            <span className="text-sm text-muted animate-in">
              Pronto!
            </span>
          )}
        </div>
      </div>

      {/* Screen-reader status */}
      <p
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {downloading ? "Download iniciado" : "Pronto para download"}
      </p>
    </div>
  );
}
