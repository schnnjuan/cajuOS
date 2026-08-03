"use client";

import { useCallback, useEffect, useState } from "react";

const WORKER =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8787"
    : "https://video-dl.cajuos.dev";

interface Source {
  url: string;
  quality: string;
  size: number | null;
  ext: string;
}

interface ExtractResult {
  ok: boolean;
  title: string;
  type: "mp4" | "hls";
  page: string;
  sources: Source[];
  error?: string;
}

type Status = "idle" | "extracting" | "done" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  "missing-url": "Cole uma URL primeiro.",
  "invalid-url": "URL inválida. Use http:// ou https://.",
  "private-url": "URL privada (localhost/IP interno) não é permitida.",
  "no-source":
    "Nenhum vídeo encontrado nesta página. Ela precisa expor um arquivo mp4/webm/mov ou um manifest m3u8 no HTML.",
  blocked: "O site bloqueou a leitura (403). Alguns hosts exigem cookies de sessão — tente a aba API com o curl direto.",
  "page-failed": "Não foi possível carregar a página.",
  "manifest-failed": "O manifest HLS falhou ao carregar.",
  "live-stream": "Stream ao vivo não é suportado — só vídeos sob demanda.",
  "encrypted-unsupported": "Stream cifrado (AES-128) ainda não é suportado.",
  "segment-failed": "Falha ao baixar segmentos do HLS.",
  "source-failed": "O servidor do arquivo recusou o download.",
};

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "video"
  );
}

interface HistoryEntry {
  url: string;
  title: string;
}

export default function VideoDlGenerator() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [quality, setQuality] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("cajuos:dl-history");
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [copied, setCopied] = useState("");
  const [tab, setTab] = useState<"extract" | "api">("extract");
  const [canPaste, setCanPaste] = useState(false);

  useEffect(() => {
    setCanPaste(typeof navigator !== "undefined" && !!navigator.clipboard?.readText);
  }, []);

  const saveHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev.filter((h) => h.url !== entry.url)].slice(0, 10);
      try {
        localStorage.setItem("cajuos:dl-history", JSON.stringify(next));
      } catch {
        // storage indisponível
      }
      return next;
    });
  }, []);

  const handleExtract = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setStatus("error");
      setError(ERROR_MESSAGES["missing-url"]);
      return;
    }
    setStatus("extracting");
    setError("");
    setResult(null);
    setTab("extract");
    try {
      const resp = await fetch(`${WORKER}/extract?page=${encodeURIComponent(trimmed)}`);
      const data: ExtractResult = await resp.json();
      if (!data.ok) {
        setStatus("error");
        setError(ERROR_MESSAGES[data.error ?? ""] ?? "Falha desconhecida.");
        return;
      }
      setResult(data);
      setQuality(data.sources[0]?.quality ?? "");
      setStatus("done");
      saveHistory({ url: trimmed, title: data.title });
    } catch {
      setStatus("error");
      setError("Falha de rede ao falar com o worker de download.");
    }
  }, [url, saveHistory]);

  const selected =
    result?.sources.find((s) => s.quality === quality) ?? result?.sources[0];

  const dlUrl = useCallback(
    (name: string): string => {
      if (!selected || !result) return "";
      const kind = result.type === "hls" ? "dl/hls" : "dl/mp4";
      return `${WORKER}/${kind}?url=${encodeURIComponent(selected.url)}&ref=${encodeURIComponent(result.page)}&name=${encodeURIComponent(name)}`;
    },
    [selected, result]
  );

  const download = useCallback(async () => {
    if (!selected || !result) return;
    setDownloading(true);
    setProgress(null);
    const ext = result.type === "hls" ? "ts" : selected.ext;
    const baseName = slugify(result.title);
    const fileUrl = dlUrl(baseName);

    const saveBlob = (blob: Blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${baseName}_${quality}.${ext}`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    };

    try {
      const resp = await fetch(fileUrl);
      if (!resp.ok) throw new Error("download-failed");
      const total =
        Number(resp.headers.get("Content-Length")) ||
        Number(resp.headers.get("X-Estimated-Length")) ||
        null;

      const picker = (window as unknown as {
        showSaveFilePicker?: (opts: {
          suggestedName: string;
        }) => Promise<{ createWritable: () => Promise<{
          write: (chunk: Uint8Array) => Promise<void>;
          close: () => Promise<void>;
        }> }>;
      }).showSaveFilePicker;

      if (picker && resp.body) {
        const handle = await picker({
          suggestedName: `${baseName}_${quality}.${ext}`,
        });
        const writable = await handle.createWritable();
        const reader = resp.body.getReader();
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.length;
          await writable.write(value);
          if (total) setProgress(received / total);
        }
        await writable.close();
      } else if (resp.body) {
        const reader = resp.body.getReader();
        const chunks: BlobPart[] = [];
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          if (total) setProgress(received / total);
        }
        saveBlob(new Blob(chunks));
      } else {
        saveBlob(await resp.blob());
      }
    } catch {
      window.open(fileUrl, "_blank");
    } finally {
      setDownloading(false);
      setTimeout(() => setProgress(null), 800);
    }
  }, [selected, result, quality, dlUrl]);

  const copy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      // clipboard indisponível
    }
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      // permissão/clipboard indisponível
    }
  }, []);

  const commandCurl = (): string => {
    if (!result || !selected) return "";
    if (result.type === "hls") {
      return `curl -L '${WORKER}/go?page=${encodeURIComponent(result.page)}&q=${encodeURIComponent(selected.quality)}' -o '${slugify(result.title)}_${quality}.ts'`;
    }
    return `curl -L -A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36' -e '${result.page}' -o '${slugify(result.title)}_${quality}.${selected.ext}' '${selected.url}'`;
  };

  const commandAria2 = (): string => {
    if (!result || !selected) return "";
    if (result.type === "hls") {
      return `# HLS: aria2 não concatena .ts — use o comando curl acima`;
    }
    return `aria2c -x16 -s16 --referer='${result.page}' -o '${slugify(result.title)}_${quality}.${selected.ext}' '${selected.url}'`;
  };

  const commandFfmpeg = (): string => {
    if (!result || !selected || result.type !== "hls") return "";
    return `ffmpeg -y -i '${selected.url}' -c copy '${slugify(result.title)}_${quality}.mp4'`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 border-b border-border text-sm">
        <button
          type="button"
          onClick={() => setTab("extract")}
          className={`pressable pb-2 ${tab === "extract" ? "border-b-2 border-foreground font-medium text-foreground" : "text-muted"}`}
        >
          Extrair
        </button>
        <button
          type="button"
          onClick={() => setTab("api")}
          className={`pressable pb-2 ${tab === "api" ? "border-b-2 border-foreground font-medium text-foreground" : "text-muted"}`}
        >
          API
        </button>
      </div>

      {tab === "extract" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="dl-url">
              URL do vídeo
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="dl-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                placeholder="https://exemplo.com/pagina-do-video"
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-foreground"
              />
              {canPaste && (
                <button
                  type="button"
                  onClick={pasteFromClipboard}
                  title="Colar URL da área de transferência"
                  className="pressable shrink-0 rounded-md border border-border px-3 py-2 text-sm text-muted hover:border-foreground"
                >
                  Colar
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleExtract}
            disabled={status === "extracting" || downloading}
            className="pressable rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {status === "extracting" ? "Procurando fonte…" : "Encontrar fonte"}
          </button>

          {status === "extracting" && (
            <div className="relative h-24 overflow-hidden rounded-xl border border-border">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-muted" />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-foreground backdrop-blur-sm">
                Lendo página e caçando a fonte…
              </div>
            </div>
          )}

          {status === "error" && (
            <p className="rounded-md border border-border bg-card px-3 py-2 text-xs text-muted">
              {error}
            </p>
          )}

          {status === "done" && result && selected && (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{result.title}</span>
                <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                  {result.type === "hls" ? "HLS" : "MP4 direto"}
                </span>
              </div>

              {result.sources.length > 1 && (
                <div>
                  <span className="text-xs text-muted">Qualidade</span>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-foreground"
                  >
                    {result.sources.map((s) => (
                      <option key={s.url} value={s.quality}>
                        {s.quality}
                        {s.size != null ? ` · ${formatBytes(s.size)}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {result.type === "hls" && (
                <p className="text-xs text-muted">
                  HLS é baixado como <span className="font-medium text-foreground">.ts</span> (sem
                  re-encode, velocidade máxima). Reproduz em VLC/ffplay; editores grandes ainda não
                  abrem.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={download}
                  disabled={downloading}
                  className="pressable rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50"
                >
                  {downloading ? "Baixando…" : `Baixar .${result.type === "hls" ? "ts" : selected.ext}`}
                </button>
                <button
                  type="button"
                  onClick={() => copy(selected.url, "source")}
                  className="pressable rounded-md border border-border px-2.5 py-1.5 text-xs hover:border-foreground"
                >
                  {copied === "source" ? "Copiado ✓" : "Copiar link da fonte"}
                </button>
                <button
                  type="button"
                  onClick={() => copy(commandCurl(), "curl")}
                  className="pressable rounded-md border border-border px-2.5 py-1.5 text-xs hover:border-foreground"
                >
                  {copied === "curl" ? "Copiado ✓" : "Copiar comando curl"}
                </button>
                <a
                  href={result.page}
                  target="_blank"
                  rel="noreferrer"
                  className="pressable rounded-md border border-border px-2.5 py-1.5 text-xs text-muted hover:border-foreground"
                >
                  Abrir página fonte
                </a>
              </div>

              {downloading && (
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full bg-foreground transition-[width] duration-150 ${progress == null ? "w-1/3 animate-pulse" : ""}`}
                      style={progress != null ? { width: `${Math.round(progress * 100)}%` } : undefined}
                    />
                  </div>
                  <span className="text-[10px] text-muted">
                    {progress != null
                      ? `${Math.round(progress * 100)}%`
                      : "Tamanho desconhecido — aguarde"}
                  </span>
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">Recentes</span>
              {history.map((h) => (
                <button
                  key={h.url}
                  type="button"
                  onClick={() => setUrl(h.url)}
                  className="pressable rounded-md border border-border px-2.5 py-1.5 text-left text-xs hover:border-foreground"
                >
                  <span className="block truncate text-foreground">{h.title}</span>
                  <span className="block truncate text-muted">{h.url}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "api" && (
        <div className="flex flex-col gap-3">
          {result && selected ? (
            <>
              <p className="text-xs text-muted">
                Comandos prontos pro terminal — úteis pra arquivos grandes ou automação. O curl usa
                User-Agent + Referer, então passa onde o curl puro toma 403.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">curl</span>
                  <button
                    type="button"
                    onClick={() => copy(commandCurl(), "api-curl")}
                    className="pressable rounded-md border border-border px-2 py-1 text-[10px] text-muted hover:border-foreground"
                  >
                    {copied === "api-curl" ? "Copiado ✓" : "Copiar"}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-md border border-border bg-background px-3 py-2 text-[10px] leading-relaxed text-muted">
                  {commandCurl()}
                </pre>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">aria2c</span>
                  <button
                    type="button"
                    onClick={() => copy(commandAria2(), "api-aria2")}
                    className="pressable rounded-md border border-border px-2 py-1 text-[10px] text-muted hover:border-foreground"
                  >
                    {copied === "api-aria2" ? "Copiado ✓" : "Copiar"}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-md border border-border bg-background px-3 py-2 text-[10px] leading-relaxed text-muted">
                  {commandAria2()}
                </pre>
              </div>
              {result.type === "hls" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">ffmpeg (remux p/ mp4)</span>
                    <button
                      type="button"
                      onClick={() => copy(commandFfmpeg(), "api-ffmpeg")}
                      className="pressable rounded-md border border-border px-2 py-1 text-[10px] text-muted hover:border-foreground"
                    >
                      {copied === "api-ffmpeg" ? "Copiado ✓" : "Copiar"}
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-md border border-border bg-background px-3 py-2 text-[10px] leading-relaxed text-muted">
                    {commandFfmpeg()}
                  </pre>
                  <p className="text-xs text-muted">
                    Sem re-encode, só remux — rápido e sem perda. O ffmpeg resolve segmentos e
                    criptografia sozinho.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-muted">
                A tool é um worker Cloudflare público em{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-[10px]">video-dl.cajuos.dev</code>.
                Dá pra usar direto do terminal:
              </p>
              <pre className="overflow-x-auto rounded-md border border-border bg-background px-3 py-2 text-[10px] leading-relaxed text-muted">
{`# acha a fonte e lista qualidades
curl 'https://video-dl.cajuos.dev/extract?page=URL'

# baixa a melhor qualidade (ou a escolhida com &q=1080p)
curl -L 'https://video-dl.cajuos.dev/go?page=URL' -o video.mp4`}
              </pre>
              <p className="text-xs text-muted">
                Extraia uma fonte pra ver o comando exato do vídeo pronto pra copiar.
              </p>
              <button
                type="button"
                onClick={() => setTab("extract")}
                className="pressable rounded-md border border-border px-2.5 py-1.5 text-xs hover:border-foreground"
              >
                Ir pra Extrair
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
