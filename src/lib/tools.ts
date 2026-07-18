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
export const tools: Tool[] = [];

// Alvo simbólico: infinito (desafio contínuo, não fecha em 52).
export const TOTAL_PLANNED = "∞";

// Texto "Tool #N de ∞" — dinâmico conforme quantas tools foram adicionadas.
export function toolProgressLabel(): string {
  return `Tool #${tools.length} de ${TOTAL_PLANNED}`;
}

export function toolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function toolIndex(slug: string): number {
  return tools.findIndex((t) => t.slug === slug);
}
