import type { ComponentType } from "react";
import dynamic from "next/dynamic";

// Mapa: slug → componente da tool (lazy loaded).
// Adicione aqui cada nova tool interativa.
const toolComponents: Record<string, ComponentType> = {
  "og-image": dynamic(() => import("./og-image-generator")),
  "video-dl": dynamic(() => import("./video-dl-generator")),
  churrasco: dynamic(() => import("./churrasco-calculator")),
  "json-formatter": dynamic(() => import("./json-formatter")),
  "json-validator": dynamic(() => import("./json-validator")),
  base64: dynamic(() => import("./base64")),
  "jwt-decoder": dynamic(() => import("./jwt-decoder")),
  "uuid-generator": dynamic(() => import("./uuid-generator")),
  "password-generator": dynamic(() => import("./password-generator")),
  "hash-generator": dynamic(() => import("./hash-generator")),
  "url-encoder": dynamic(() => import("./url-encoder")),
};

export function getToolComponent(slug: string): ComponentType | null {
  return toolComponents[slug] ?? null;
}
