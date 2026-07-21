export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  hasApi: boolean;
  launchedAt: string;
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
