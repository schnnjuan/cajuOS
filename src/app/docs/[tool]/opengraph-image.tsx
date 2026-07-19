import { tools } from "@/lib/tools";
import { ogImageResponse } from "@/lib/og-image";

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const t = tools.find((t) => t.slug === tool);
  if (!t) return new Response("Not found", { status: 404 });
  return ogImageResponse(t.name, `Documentação — ${t.tagline}`);
}
