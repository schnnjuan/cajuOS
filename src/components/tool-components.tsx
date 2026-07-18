import type { ComponentType } from "react";
import dynamic from "next/dynamic";

// Mapa: slug → componente da tool (lazy loaded).
// Adicione aqui cada nova tool interativa.
const toolComponents: Record<string, ComponentType> = {
  "og-image": dynamic(() => import("./og-image-generator")),
};

export function getToolComponent(slug: string): ComponentType | null {
  return toolComponents[slug] ?? null;
}
