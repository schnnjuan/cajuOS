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
