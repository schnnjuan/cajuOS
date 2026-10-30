export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  hasApi: boolean;
  launchedAt: string;
  category: string;
};

// Ordem = ordem de lançamento. "Tool #N de ∞" usa o índice.
// Adicione tools aqui conforme forem lançadas.
export const tools: Tool[] = [
  {
    slug: "og-image",
    name: "OG Image Generator",
    tagline: "Gera imagens Open Graph 1200×630 a partir de título e subtítulo. Roda no navegador.",
    icon: "🎨",
    hasApi: false,
    launchedAt: "2026-07-24",
    category: "Mídia",
  },
  {
    slug: "video-dl",
    name: "Video Downloader",
    tagline: "Baixa o vídeo pela fonte exata a partir do link. Detecta mp4 e HLS, gera comando curl pronto.",
    icon: "🎬",
    hasApi: true,
    launchedAt: "2026-08-01",
    category: "Mídia",
  },
  {
    slug: "churrasco",
    name: "Calculadora de Churrasco",
    tagline: "Quantas pessoas, quantas horas — e a lista de compras pronta pra mandar no WhatsApp.",
    icon: "🥩",
    hasApi: false,
    launchedAt: "2026-10-01",
    category: "Geral",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    tagline: "Formata JSON com indentação legível. Roda no navegador.",
    icon: "{}",
    hasApi: false,
    launchedAt: "2026-10-30",
    category: "Código",
  },
  {
    slug: "json-validator",
    name: "JSON Validator",
    tagline: "Valida JSON e mostra erros de sintaxe. Roda no navegador.",
    icon: "✓",
    hasApi: false,
    launchedAt: "2026-10-30",
    category: "Código",
  },
  {
    slug: "base64",
    name: "Base64 Encoder/Decoder",
    tagline: "Codifica e decodifica Base64 (texto e arquivo). Roda no navegador.",
    icon: "B64",
    hasApi: false,
    launchedAt: "2026-10-30",
    category: "Segurança",
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    tagline: "Decodifica e inspeciona tokens JWT. Roda no navegador.",
    icon: "JWT",
    hasApi: false,
    launchedAt: "2026-10-30",
    category: "Segurança",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    tagline: "Gera UUIDs v4 em lote. Roda no navegador.",
    icon: "ID",
    hasApi: false,
    launchedAt: "2026-10-30",
    category: "Segurança",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    tagline: "Gera senhas seguras com opções. Roda no navegador.",
    icon: "PW",
    hasApi: false,
    launchedAt: "2026-10-30",
    category: "Segurança",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    tagline: "Gera MD5, SHA-1, SHA-256 e SHA-512. Roda no navegador.",
    icon: "#",
    hasApi: false,
    launchedAt: "2026-10-30",
    category: "Segurança",
  },
  {
    slug: "url-encoder",
    name: "URL Encoder/Decoder",
    tagline: "Codifica e decodifica URLs. Roda no navegador.",
    icon: "%",
    hasApi: false,
    launchedAt: "2026-10-30",
    category: "Web",
  },
];

// Data de início simbólica do experimento (semana 1)
export const EXPERIMENT_START = "2026-07-14";
// Alvo simbólico: infinito (desafio contínuo, não fecha em 52).
export const TOTAL_PLANNED = "∞";

// Texto "Tool #N de ∞" — dinâmico conforme quantas tools foram adicionadas.
export function toolProgressLabel(): string {
  if (tools.length === 0) return "Em breve…";
  return `Tool #${tools.length} de ${TOTAL_PLANNED}`;
}

export function toolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function toolIndex(slug: string): number {
  return tools.findIndex((t) => t.slug === slug);
}

// Semana atual do experimento (1-based)
export function currentWeek(): number {
  const start = new Date(EXPERIMENT_START);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const weeks = Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1);
  return weeks;
}

// Tools lançadas na semana atual
export function toolsThisWeek(): number {
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  // Segunda como início da semana
  const monday = new Date(startOfWeek);
  monday.setDate(startOfWeek.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return tools.filter((t) => {
    const launched = new Date(t.launchedAt);
    return launched >= monday;
  }).length;
}

// Percentual de semanas com tool lançada
export function streakPercent(): number {
  if (tools.length === 0) return 0;
  const weeks = currentWeek();
  if (weeks <= 0) return 0;
  return Math.min(100, Math.round((tools.length / weeks) * 100));
}
