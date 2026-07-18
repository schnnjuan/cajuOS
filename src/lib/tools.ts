export type Tool = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  hasApi: boolean;
  launchedAt: string;
};

// Ordem = ordem de lançamento. "Tool #N de 52" usa o índice.
export const tools: Tool[] = [
  {
    slug: "json-prettify",
    name: "JSON Prettify",
    tagline: "Formata e valida JSON colado na hora.",
    icon: "{}",
    hasApi: false,
    launchedAt: "2026-01-05",
  },
  {
    slug: "slugify",
    name: "Slugify",
    tagline: "Texto legível vira slug de URL limpo.",
    icon: "#",
    hasApi: false,
    launchedAt: "2026-01-12",
  },
  {
    slug: "epoch-now",
    name: "Epoch Now",
    tagline: "Converte timestamp <-> data, com fuso.",
    icon: "⏱",
    hasApi: true,
    launchedAt: "2026-01-19",
  },
];

export const TOTAL_PLANNED = 52;

export function toolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function toolIndex(slug: string): number {
  return tools.findIndex((t) => t.slug === slug);
}
