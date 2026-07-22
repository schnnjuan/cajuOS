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
type Format = "png" | "jpeg" | "webp";

interface TemplateConfig {
  title: string; subtitle: string; paletteId: string; sizeIdx: number;
  layout: LayoutMode; decorIcon: string; format: Format; overlay: number; proceduralSeed: number | null; textShadow: number; fontId: string; fontWeight: number; letterSpacing: number;
}
interface SavedTemplate {
  id: string; name: string; config: TemplateConfig; createdAt: string;
}

// ── Decor icons (SVG path data for canvas Path2D) ──────
interface DecorIconDef {
  id: string;
  path: string;
}

const DECOR_ICONS: DecorIconDef[] = [
  { id: "flame",  path: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" },
  { id: "target", path: "M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0M6 12a6 6 0 1 0 12 0a6 6 0 1 0-12 0M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0" },
  { id: "star",   path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { id: "bulb",   path: "M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" },
  { id: "rocket", path: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" },
  { id: "pin",    path: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM9 10a3 3 0 1 0 6 0a3 3 0 1 0-6 0" },
  { id: "palette",path: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.42-4.5-8-10-8zM13 6.5a.5.5 0 1 0 1 0a.5.5 0 1 0-1 0M17 10.5a.5.5 0 1 0 1 0a.5.5 0 1 0-1 0M8 7.5a.5.5 0 1 0 1 0a.5.5 0 1 0-1 0M6 12.5a.5.5 0 1 0 1 0a.5.5 0 1 0-1 0" },
  { id: "sparkle",path: "M12 3c.132 2.102.786 4.04 1.873 5.652C14.96 10.264 16.4 11.4 18 12c-1.6.6-3.04 1.736-4.127 3.348C12.786 16.96 12.132 18.898 12 21c-.132-2.102-.786-4.04-1.873-5.652C9.04 13.736 7.6 12.6 6 12c1.6-.6 3.04-1.736 4.127-3.348C11.214 7.04 11.868 5.102 12 3z" },
  { id: "diamond",path: "M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" },
  { id: "bolt",   path: "M13 2 3 14 12 14 11 22 21 10 12 10 13 2z" },
];

const DECOR_ICON_MAP = new Map(DECOR_ICONS.map((d) => [d.id, d]));

const SOCIAL_PRESETS: Record<string, { size: number; layout: "center" | "left"; palette: string; icon: string; label: string }> = {
  twitter:  { size: 0, layout: "center", palette: "classic", icon: "flame",  label: "Twitter" },
  linkedin: { size: 0, layout: "left",   palette: "slate",   icon: "pin",    label: "LinkedIn" },
  blog:     { size: 0, layout: "center", palette: "warm",    icon: "sparkle",label: "Blog" },
};

type TabId = "style" | "bg" | "export";

const TABS: { id: TabId; label: string }[] = [
  { id: "style",  label: "Aparência" },
  { id: "bg",     label: "Fundo" },
  { id: "export", label: "Exportar" },
];

const FONT_OPTIONS = [
  { id: "inter", name: "Inter", variable: "--font-inter" },
  { id: "dm-sans", name: "DM Sans", variable: "--font-dm-sans" },
  { id: "space-grotesk", name: "Space Grotesk", variable: "--font-space-grotesk" },
];

// Seeded PRNG (mulberry32)
function mulberry32(a: number): () => number {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    const t = Math.imul(a ^ (a >>> 15), 1 | a);
    const t2 = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Helpers ────────────────────────────────────────────
function emojiRegex(): RegExp {
  return /[\u{1F000}-\u{1FFFF}]|\u{FE0F}|\u{200D}|[\u{2600}-\u{27BF}]|[\u{2B50}]|[\u{2702}-\u{27B0}]|[\u{00A9}|\u{00AE}]/u;
}

function hasEmoji(s: string): boolean {
  return emojiRegex().test(s);
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + "\u2026";
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "og-image";
}

function measureAndFit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, baseSize: number, fontFamily: string, fontWeight: number = 700): { size: number; fitted: string } {
  let size = baseSize;
  let fitted = text;
  while (size >= Math.round(28 * (baseSize / 64))) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    if (ctx.measureText(fitted).width <= maxWidth) break;
    if (size <= 32 && fitted.length > 10) fitted = truncate(fitted, Math.max(10, fitted.length - 5));
    else size = Math.max(Math.round(28 * (baseSize / 64)), size - 4);
  }
  return { size, fitted };
}

function drawBgImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number, overlay: number) {
  const imgRatio = img.width / img.height;
  const cnvRatio = W / H;
  let sx, sy, sw, sh;
  if (imgRatio > cnvRatio) { sh = img.height; sw = sh * cnvRatio; sx = (img.width - sw) / 2; sy = 0; }
  else { sw = img.width; sh = sw / cnvRatio; sx = 0; sy = (img.height - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  if (overlay > 0) { ctx.fillStyle = `rgba(0,0,0,${overlay})`; ctx.fillRect(0, 0, W, H); }
}

// ── Procedural background ───────────────────
function drawProceduralBg(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
  const rng = mulberry32(seed); const s = W / 1200; const baseHue = rng() * 360;
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, `hsl(${baseHue}, ${40 + rng() * 20}%, ${12 + rng() * 8}%)`);
  grad.addColorStop(0.5, `hsl(${(baseHue + 30 + rng() * 40) % 360}, ${35 + rng() * 20}%, ${10 + rng() * 6}%)`);
  grad.addColorStop(1, `hsl(${(baseHue + 60 + rng() * 50) % 360}, ${30 + rng() * 20}%, ${7 + rng() * 5}%)`);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  const bx = 0.2 + rng() * 0.5; const by = 0.3 + rng() * 0.4; const br = (0.35 + rng() * 0.35) * Math.min(W, H);
  const bg = ctx.createRadialGradient(W * bx, H * by, 0, W * bx, H * by, br);
  bg.addColorStop(0, `hsla(${(baseHue + 60 + rng() * 80) % 360}, ${60 + rng() * 30}%, ${35 + rng() * 20}%, 0.35)`);
  bg.addColorStop(0.5, `hsla(${(baseHue + 80 + rng() * 80) % 360}, ${50 + rng() * 30}%, ${30 + rng() * 15}%, 0.15)`);
  bg.addColorStop(1, `hsla(${(baseHue + 100 + rng() * 80) % 360}, ${40 + rng() * 30}%, ${20 + rng() * 15}%, 0)`);
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(W * bx, H * by, br, 0, Math.PI * 2); ctx.fill();
  const dotSize = Math.round((2 + rng() * 2) * s); const spacing = Math.round((35 + rng() * 25) * s); const dotHue = (baseHue + 140 + rng() * 80) % 360;
  for (let gx = spacing; gx < W; gx += spacing) for (let gy = spacing; gy < H; gy += spacing) { const jx = gx + (rng() - 0.5) * spacing * 0.3; const jy = gy + (rng() - 0.5) * spacing * 0.3; ctx.beginPath(); ctx.arc(jx, jy, dotSize, 0, Math.PI * 2); ctx.fillStyle = `hsla(${dotHue}, 50%, ${60 + rng() * 20}%, ${0.12 + rng() * 0.12})`; ctx.fill(); }
  ctx.lineCap = "round";
  for (let i = 0; i < 4 + Math.round(rng() * 3); i++) { const off = rng() * (W + H) * 0.7; ctx.beginPath(); ctx.moveTo(-off, 0); ctx.lineTo(W - off, H); ctx.strokeStyle = `hsla(${baseHue}, 30%, ${55 + rng() * 20}%, ${0.04 + rng() * 0.04})`; ctx.lineWidth = (0.5 + rng() * 1.5) * s; ctx.stroke(); }
  for (let i = 0; i < 3 + Math.round(rng() * 3); i++) { const cx = rng() * W; const cy = rng() * H; const cr = (10 + rng() * 25) * s; const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr); cg.addColorStop(0, `hsla(${(baseHue + 120 + rng() * 100) % 360}, ${70 + rng() * 30}%, ${60 + rng() * 20}%, ${0.08 + rng() * 0.06})`); cg.addColorStop(1, `hsla(${(baseHue + 120 + rng() * 100) % 360}, ${70 + rng() * 30}%, ${60 + rng() * 20}%, 0)`); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill(); }
}

// ── Canvas drawing ─────────────────────────────────────
function drawOgImage(ctx: CanvasRenderingContext2D, W: number, H: number, title: string, subtitle: string, palette: (typeof PALETTES)[number], fontFamily: string, logoImg: HTMLImageElement | null, bgImg: HTMLImageElement | null, layout: LayoutMode, overlay: number, decorIconId: string, proceduralSeed: number | null, textShadow: number = 0, fontWeight: number = 700, letterSpacing: number = 0) {
  const { bg, text, accent, watermark } = palette; const s = W / 1200; const pad = Math.round(32 * s); const isSquare = W > H * 1.1;
  if (proceduralSeed !== null) drawProceduralBg(ctx, W, H, proceduralSeed);
  else if (bgImg) drawBgImage(ctx, bgImg, W, H, overlay);
  else { ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); }
  if (proceduralSeed === null) { const barH = Math.max(4, Math.round(6 * s)); const grad = ctx.createLinearGradient(0, 0, W, 0); grad.addColorStop(0, accent + "20"); grad.addColorStop(1, accent + "05"); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, barH); }
  let logoRight = 0; const logoMaxW = Math.round(80 * s);
  if (logoImg) { const scale = Math.min(1, logoMaxW / logoImg.width); const lw = logoImg.width * scale; const lh = logoImg.height * scale; ctx.drawImage(logoImg, pad, pad, lw, lh); logoRight = pad + lw + Math.round(16 * s); }
  const forceLeft = layout === "left" || logoRight > 0; const titleX = forceLeft && logoRight > 0 ? logoRight : forceLeft ? pad : W / 2; const textAlign: CanvasTextAlign = forceLeft ? "left" : "center";
  if (decorIconId) { const iconDef = DECOR_ICON_MAP.get(decorIconId); if (iconDef) { const iconSize = Math.round(52 * s * Math.min(1, H / 630)); const decorY = isSquare ? Math.round(H * 0.22) : Math.round(H * 0.14); const half = iconSize / 2; ctx.save(); ctx.translate(W / 2 - half, decorY - iconSize); ctx.scale(iconSize / 24, iconSize / 24); ctx.strokeStyle = text; ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(new Path2D(iconDef.path)); ctx.restore(); } }
  if (textShadow > 0) { ctx.shadowColor = textShadow === 1 ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.5)"; ctx.shadowBlur = textShadow === 1 ? Math.round(8 * s) : Math.round(16 * s); }
  if (letterSpacing > 0) ctx.letterSpacing = `${letterSpacing}px`;
  const maxTitleChars = Math.round(62 * Math.min(1, s)); const displayTitle = truncate(title || "Seu título aqui", maxTitleChars); ctx.fillStyle = text; ctx.textBaseline = "middle"; const baseFontSize = Math.round(64 * s * Math.min(1, H / 630)); const maxLineW = Math.round(980 * s);
  const words = displayTitle.split(" "); const lines: string[] = []; let currentLine = "";
  for (const word of words) { const test = currentLine ? currentLine + " " + word : word; ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`; if (ctx.measureText(test).width > maxLineW && currentLine) { lines.push(currentLine); currentLine = word; } else currentLine = test; }
  if (currentLine) lines.push(currentLine);
  let titleLines = lines; if (lines.length > 2) { titleLines = [lines[0], lines.slice(1).join(" ")]; titleLines[1] = truncate(titleLines[1], maxTitleChars); }
  let fontSize = baseFontSize; for (const line of titleLines) { ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`; if (ctx.measureText(line).width > maxLineW) { const result = measureAndFit(ctx, line, maxLineW, baseFontSize, fontFamily, fontWeight); fontSize = Math.min(fontSize, result.size); } }
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`; const titleY = isSquare ? Math.round(H * 0.42) : titleLines.length > 1 ? Math.round(H * 0.28) : Math.round(H * 0.35);
  ctx.textAlign = textAlign;
  if (titleLines.length === 1) ctx.fillText(titleLines[0], titleX, titleY);
  else { const lineH = Math.min(fontSize + Math.round(8 * s), Math.round(72 * s)); ctx.fillText(titleLines[0], titleX, titleY - lineH / 2); ctx.fillText(titleLines[1], titleX, titleY + lineH / 2); }
  ctx.letterSpacing = "0px";
  if (subtitle) { const subSize = Math.round(28 * s); ctx.fillStyle = watermark; ctx.font = `400 ${subSize}px ${fontFamily}`; ctx.textAlign = textAlign; ctx.textBaseline = "top"; ctx.fillText(truncate(subtitle, Math.round(90 * Math.min(1, s))), titleX, titleY + (titleLines.length > 1 ? Math.round(56 * s) : Math.round(36 * s)) + fontSize * 0.3); }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  const wmSize = Math.round(16 * s); ctx.fillStyle = watermark; ctx.font = `500 ${wmSize}px ${fontFamily}`; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText("cajuos.dev", W - pad, H - Math.round(24 * s));
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
  const [fontId, setFontId] = useState("inter");
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [overlay, setOverlay] = useState(0.35);
  const [decorIcon, setDecorIcon] = useState("");
  const [format, setFormat] = useState<Format>("png");
  const [proceduralSeed, setProceduralSeed] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("style");
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [usageToday, setUsageToday] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [textShadow, setTextShadow] = useState(0);
  const [fontWeight, setFontWeight] = useState(700);
  const [letterSpacing, setLetterSpacing] = useState(0);

  const sizePreset = SIZE_PRESETS[sizeIdx];
  const W = sizePreset.w; const H = sizePreset.h;
  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];
  const showEmojiWarning = hasEmoji(title) || hasEmoji(subtitle);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("title"); const st = params.get("subtitle"); const p = params.get("palette");
    const sz = params.get("size"); const l = params.get("layout"); const ic = params.get("icon");
    if (t) setTitle(t); if (st) setSubtitle(st);
    if (p && PALETTES.some((pal) => pal.id === p)) setPaletteId(p);
    if (sz === "square") setSizeIdx(1); else if (sz === "instagram") setSizeIdx(2); else if (sz === "og") setSizeIdx(0);
    if (l === "left" || l === "center") setLayout(l);
    if (ic) setDecorIcon(ic);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("cajuos:og-presets");
    if (saved) try { setTemplates(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("cajuos:og-presets", JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    const raw = localStorage.getItem("cajuos:og-usage");
    if (raw) try { const d = JSON.parse(raw); if (d.date === new Date().toDateString()) setUsageToday(d.count); } catch {}
  }, []);

  const trackUsage = () => {
    const today = new Date().toDateString();
    const raw = localStorage.getItem("cajuos:og-usage");
    let count = 1;
    if (raw) try { const d = JSON.parse(raw); if (d.date === today) count = d.count + 1; } catch {}
    localStorage.setItem("cajuos:og-usage", JSON.stringify({ date: today, count }));
    setUsageToday(count);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.target instanceof HTMLInputElement) (document.querySelector<HTMLButtonElement>('[data-action="download"]'))?.click();
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !e.target || e.target instanceof HTMLInputElement) (document.querySelector<HTMLButtonElement>('[data-action="copy"]'))?.click();
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, []);

  const rafRef = useRef(0);
  const [shimmer, setShimmer] = useState(true);

  const render = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return;
    const fontVar = FONT_OPTIONS.find(f => f.id === fontId)?.variable ?? "--font-inter";
    const ff = getComputedStyle(document.documentElement).getPropertyValue(fontVar).trim() || "Inter, sans-serif";
    drawOgImage(ctx, W, H, title, subtitle, palette, ff, logoImg, bgImg, layout, overlay, decorIcon, proceduralSeed, textShadow, fontWeight, letterSpacing);
    setShimmer(false);
  }, [W, H, title, subtitle, palette, fontId, logoImg, bgImg, layout, overlay, decorIcon, proceduralSeed, textShadow, fontWeight, letterSpacing]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handleDownload = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const ext = format === "jpeg" ? "jpg" : format;
    canvas.toBlob((blob) => {
      if (!blob) return; trackUsage(); setDownloading(true); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${slugify(title)}-og-image.${ext}`; a.style.display = "none"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); setTimeout(() => setDownloading(false), 1500);
    }, mime, 0.92);
  };

  const handleCopy = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); trackUsage(); setCopying(true); setTimeout(() => setCopying(false), 1500); }
      catch { setCopyError(true); setTimeout(() => setCopyError(false), 2000); }
    }, "image/png");
  };

  const readImage = (file: File, onLoad: (img: HTMLImageElement) => void) => {
    const reader = new FileReader();
    reader.onload = (ev) => { const img = new Image(); img.onload = () => onLoad(img); img.src = ev.target?.result as string; };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    readImage(file, (img) => { setLogoImg(img); if (logoInputRef.current) logoInputRef.current.value = ""; });
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    readImage(file, (img) => { setBgImg(img); setProceduralSeed(null); if (bgInputRef.current) bgInputRef.current.value = ""; });
  };

  const removeLogo = () => setLogoImg(null);
  const removeBg = () => { setBgImg(null); setProceduralSeed(null); };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files[0]; if (!file || !file.type.startsWith("image/")) return;
    readImage(file, (img) => {
      const isSquare = img.width < 200 && img.height < 200;
      if (isSquare) setLogoImg(img); else { setBgImg(img); setProceduralSeed(null); }
    });
  };

  const applySocialPreset = (key: string) => {
    const p = SOCIAL_PRESETS[key]; if (!p) return;
    setSizeIdx(p.size); setLayout(p.layout); setPaletteId(p.palette); setDecorIcon(p.icon);
  };

  const generateProcedural = () => { setBgImg(null); setProceduralSeed(Math.floor(Math.random() * 2147483647)); };

  const saveTemplate = (name: string) => {
    if (!name.trim()) return;
    const config: TemplateConfig = { title, subtitle, paletteId, sizeIdx, layout, decorIcon, format, overlay, proceduralSeed, textShadow, fontId, fontWeight, letterSpacing };
    setTemplates(prev => [{ id: Date.now().toString(), name: name.trim(), config, createdAt: new Date().toISOString() }, ...prev]);
    setShowSaveInput(false); setTemplateName("");
  };

  const loadTemplate = (t: SavedTemplate) => {
    setTitle(t.config.title); setSubtitle(t.config.subtitle); setPaletteId(t.config.paletteId);
    setSizeIdx(t.config.sizeIdx); setLayout(t.config.layout); setDecorIcon(t.config.decorIcon);
    setFormat(t.config.format); setOverlay(t.config.overlay); setProceduralSeed(t.config.proceduralSeed); setTextShadow(t.config.textShadow ?? 0); setFontId(t.config.fontId ?? "inter"); setFontWeight(t.config.fontWeight ?? 700); setLetterSpacing(t.config.letterSpacing ?? 0);
  };

  const deleteTemplate = (id: string) => setTemplates(prev => prev.filter(t => t.id !== id));

  const iconSvgForPreview = (d: DecorIconDef): string =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d.path}"/></svg>`;

  const activeBtn = "border-b-2 border-foreground text-foreground";
  const inactiveBtn = "border-b-2 border-transparent text-muted hover:text-foreground hover:border-border";

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Preencha os campos abaixo para gerar sua imagem Open Graph.</p>

      <div className="flex items-center justify-between">
        {usageToday > 0 && <p className="text-xs text-muted">Você gerou {usageToday} {usageToday === 1 ? "imagem" : "imagens"} hoje</p>}
        <span className="text-xs text-muted">Enter baixa · Ctrl+C copia</span>
      </div>

      {/* Templates */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <span className="text-xs font-medium text-muted">Templates</span>
        <button onClick={() => setShowSaveInput(true)}
          className="pressable rounded-md border border-border px-2 py-1 text-xs hover:border-foreground"
        >+ Salvar</button>
        {showSaveInput && (
          <div className="flex items-center gap-1">
            <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)}
              placeholder="Nome" maxLength={24} autoFocus
              className="w-28 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-foreground"
            />
            <button onClick={() => saveTemplate(templateName)}
              className="pressable rounded-md bg-foreground px-2 py-1 text-xs text-background"
            >OK</button>
            <button onClick={() => { setShowSaveInput(false); setTemplateName(""); }}
              className="pressable text-xs text-muted hover:text-foreground"
            >Cancelar</button>
          </div>
        )}
        {templates.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {templates.map(t => (
              <div key={t.id} className="flex items-center gap-1 rounded-md border border-border px-2 py-1">
                <button onClick={() => loadTemplate(t)} className="pressable text-xs hover:text-foreground">{t.name}</button>
                <button onClick={() => deleteTemplate(t.id)} className="pressable text-muted hover:text-red-500 text-xs" aria-label={`Remover ${t.name}`}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Social presets */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SOCIAL_PRESETS).map(([key, val]) => (
          <button key={key} onClick={() => applySocialPreset(key)}
            className="pressable rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:border-foreground"
          >{val.label}</button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="og-title" className="text-xs font-medium">Título</label>
          <input id="og-title" type="text" value={title}
            onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Como gerar sua imagem OG" maxLength={65}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-muted">{title.length}/65</span>
            {showEmojiWarning && <span className="text-xs text-amber-600 dark:text-amber-400">Emoji pode não renderizar</span>}
          </div>
        </div>
        <div>
          <label htmlFor="og-subtitle" className="text-xs font-medium">Subtítulo</label>
          <input id="og-subtitle" type="text" value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)} placeholder="Ex: Uma tool por semana" maxLength={95}
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
          />
          <p className="mt-1 text-xs text-muted">{subtitle.length}/95</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-4 border-b border-border text-sm">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`pressable pb-1.5 text-sm font-medium transition-colors ${activeTab === tab.id ? activeBtn : inactiveBtn}`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Tab: Aparência */}
      {activeTab === "style" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium">Paleta</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {PALETTES.map((p) => (
                <button key={p.id} onClick={() => setPaletteId(p.id)}
                  className={`pressable flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${paletteId === p.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                >
                  <span className="inline-block h-3.5 w-3.5 rounded border" style={{ backgroundColor: p.bg, borderColor: paletteId === p.id ? p.bg : p.text + "30" }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Fonte</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {FONT_OPTIONS.map((f) => (
                <button key={f.id} onClick={() => setFontId(f.id)}
                  className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${fontId === f.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                >{f.name}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Peso</label>
              <div className="mt-1 flex gap-1.5">
                {[500, 600, 700, 800].map((w) => (
                  <button key={w} onClick={() => setFontWeight(w)}
                    className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${fontWeight === w ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                  >{w}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Espaçamento</label>
              <div className="mt-1 flex gap-1.5">
                {[{ label: "Normal", value: 0 }, { label: "0.5px", value: 0.5 }, { label: "1px", value: 1 }, { label: "2px", value: 2 }].map((o) => (
                  <button key={o.value} onClick={() => setLetterSpacing(o.value)}
                    className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${letterSpacing === o.value ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                  >{o.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Layout</label>
              <div className="mt-1 flex gap-1.5">
                {(["center", "left"] as const).map((m) => (
                  <button key={m} onClick={() => setLayout(m)}
                    className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${layout === m ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                  >{m === "center" ? "Centro" : "Esquerda"}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Tamanho</label>
              <div className="mt-1 flex gap-1.5">
                {SIZE_PRESETS.map((p, i) => (
                  <button key={p.label} onClick={() => setSizeIdx(i)}
                    className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${sizeIdx === i ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                  >{p.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Ícone decorativo</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <button onClick={() => setDecorIcon("")}
                className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${!decorIcon ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
              >Sem ícone</button>
              {DECOR_ICONS.map((d) => (
                <button key={d.id} onClick={() => setDecorIcon(d.id)}
                  className={`pressable flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs ${decorIcon === d.id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                >
                  <span className="inline-block h-3.5 w-3.5" dangerouslySetInnerHTML={{ __html: iconSvgForPreview(d) }} />
                  {d.id.charAt(0).toUpperCase() + d.id.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Sombra do texto</label>
            <div className="mt-1 flex gap-1.5">
              {[{ label: "Nenhum", value: 0 }, { label: "Sutil", value: 1 }, { label: "Forte", value: 2 }].map((o) => (
                <button key={o.label} onClick={() => setTextShadow(o.value)}
                  className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${textShadow === o.value ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                >{o.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Fundo */}
      {activeTab === "bg" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoChange} className="hidden" />
            <div>
              <label className="text-xs font-medium">Logo</label>
              <div className="mt-1">
                {logoImg
                  ? <button onClick={removeLogo} className="pressable rounded-md border border-border px-2.5 py-1.5 text-xs hover:border-foreground">Remover logo</button>
                  : <button onClick={() => logoInputRef.current?.click()} className="pressable rounded-md border border-border px-2.5 py-1.5 text-xs hover:border-foreground">+ Logo</button>
                }
              </div>
            </div>
            <input ref={bgInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleBgChange} className="hidden" />
            <div>
              <label className="text-xs font-medium">Fundo</label>
              <div className="mt-1 flex gap-1.5">
                {bgImg
                  ? <button onClick={removeBg} className="pressable rounded-md border border-border px-2.5 py-1.5 text-xs hover:border-foreground">Remover fundo</button>
                  : <button onClick={() => bgInputRef.current?.click()} className="pressable rounded-md border border-border px-2.5 py-1.5 text-xs hover:border-foreground">+ Imagem</button>
                }
                <button onClick={generateProcedural}
                  className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${proceduralSeed !== null ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                >✦ Gerar procedural</button>
              </div>
            </div>
          </div>
          {bgImg && (
            <div>
              <label className="text-xs font-medium">Escurecimento</label>
              <div className="mt-1 flex gap-1.5">
                {[{ label: "Nenhum", value: 0 }, { label: "Leve", value: 0.2 }, { label: "Médio", value: 0.35 }, { label: "Forte", value: 0.5 }].map((o) => (
                  <button key={o.label} onClick={() => setOverlay(o.value)}
                    className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${overlay === o.value ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                  >{o.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Exportar */}
      {activeTab === "export" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium">Formato</label>
            <div className="mt-1 flex gap-1.5">
              {(["png", "jpeg", "webp"] as const).map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`pressable rounded-md border px-2.5 py-1.5 text-xs ${format === f ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}
                >{f.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button data-action="download" onClick={handleDownload} disabled={downloading}
              className={`pressable rounded-md px-4 py-2 text-sm font-medium ${downloading ? "bg-muted text-background" : "bg-foreground text-background"}`}
            >{downloading ? "Baixando\u2026" : `Download ${format.toUpperCase()}`}</button>
            {downloading && <span className="text-sm text-muted">Pronto!</span>}
            <button data-action="copy" onClick={handleCopy} disabled={copying}
              className={`pressable rounded-md border px-4 py-2 text-sm font-medium ${copyError ? "border-red-500 text-red-500" : copying ? "border-muted text-muted" : "border-border text-foreground hover:border-foreground"}`}
            >{copyError ? "Erro ao copiar" : copying ? "Copiado!" : "Copiar PNG"}</button>
            <a href="https://x.com/intent/tweet?text=Acabei%20de%20gerar%20uma%20imagem%20OG%20com%20%40schnnjuan%20no%20CajuOS%20%F0%9F%93%B1&url=https%3A%2F%2Fcajuos.dev%2Ftools%2Fog-image" target="_blank" rel="noopener noreferrer"
              className="pressable rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-foreground"
            >Tweetar essa OG</a>
          </div>
        </div>
      )}

      {/* Preview (always visible) */}
      <div
        onDragOver={handleDragOver} onDragEnter={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className={`relative overflow-hidden rounded-xl border bg-card transition-colors ${isDragging ? "border-foreground bg-foreground/5" : "border-border"}`}
      >
        <span className="absolute left-2 top-2 z-10 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium text-muted backdrop-blur-sm">{SIZE_PRESETS[sizeIdx].label} {W}×{H}</span>
        <canvas ref={canvasRef} width={W} height={H} className={`w-full ${shimmer ? "invisible" : ""}`} style={{ aspectRatio: `${W}/${H}`, display: "block", maxWidth: `${W}px` }} />
        {shimmer && <div className="absolute inset-0 animate-pulse rounded-xl bg-muted" />}
        {isDragging && <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 text-sm font-medium text-foreground backdrop-blur-sm">Solte a imagem aqui</div>}
      </div>

      {/* Gallery */}
      <details className="group rounded-xl border border-border">
        <summary className="pressable flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/30">
          <span>Inspiração</span>
          <span className="text-xs text-muted group-open:hidden">Mostrar exemplos</span>
          <span className="hidden text-xs text-muted group-open:inline">Fechar</span>
        </summary>
        <div className="grid grid-cols-2 gap-3 border-t border-border p-4 sm:grid-cols-3">
          {[
            { name: "Twitter", palette: "classic", icon: "flame", layout: "center" as const, fontId: "inter", fontWeight: 700, letterSpacing: 0, textShadow: 0, title: "Como gerar sua imagem OG em 10 segundos", subtitle: "cajuos.dev" },
            { name: "LinkedIn", palette: "slate", icon: "pin", layout: "left" as const, fontId: "dm-sans", fontWeight: 600, letterSpacing: 0.5, textShadow: 1, title: "Tool #1 está no ar", subtitle: "OG Image Generator" },
            { name: "Blog", palette: "warm", icon: "sparkle", layout: "center" as const, fontId: "space-grotesk", fontWeight: 800, letterSpacing: 0, textShadow: 0, title: "O que aprendi construindo uma tool por semana", subtitle: "Post-mortem" },
            { name: "Produto", palette: "deep", icon: "diamond", layout: "left" as const, fontId: "inter", fontWeight: 700, letterSpacing: 1, textShadow: 2, title: "CajuOS — Ferramentas que resolvem", subtitle: "Uma tool por semana" },
            { name: "Minimal", palette: "minimal", icon: "star", layout: "center" as const, fontId: "space-grotesk", fontWeight: 500, letterSpacing: 0, textShadow: 0, title: "Design com propósito", subtitle: "Menos é mais" },
            { name: "Devlog", palette: "slate", icon: "bolt", layout: "left" as const, fontId: "dm-sans", fontWeight: 800, letterSpacing: 0.5, textShadow: 1, title: "Dia 7: deploy as 23h47", subtitle: "O Safari quase me venceu" },
          ].map((ex, i) => (
            <button key={i} onClick={() => { setTitle(ex.title); setSubtitle(ex.subtitle); setPaletteId(ex.palette); setLayout(ex.layout); setDecorIcon(ex.icon); setFontId(ex.fontId); setFontWeight(ex.fontWeight); setLetterSpacing(ex.letterSpacing); setTextShadow(ex.textShadow); setSizeIdx(0); }}
              className="pressable rounded-lg border border-border bg-card p-3 text-left text-xs hover:border-foreground"
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: PALETTES.find(p => p.id === ex.palette)?.bg }} />
                <span className="font-medium text-foreground">{ex.name}</span>
              </div>
              <p className="truncate text-muted">{ex.title}</p>
              <span className="mt-1 inline-block text-foreground/70">Usar este estilo →</span>
            </button>
          ))}
        </div>
      </details>

      <p role="status" aria-live="polite" className="sr-only">
        {downloading ? "Download iniciado" : copying ? "Imagem copiada" : copyError ? "Erro ao copiar" : "Pronto para uso"}
      </p>
    </div>
  );
}
