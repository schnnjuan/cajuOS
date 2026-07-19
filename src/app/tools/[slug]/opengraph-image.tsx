import { tools } from "@/lib/tools";
import { ogImageResponse } from "@/lib/og-image";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) return new Response("Not found", { status: 404 });
  return ogImageResponse(tool.name, tool.tagline);
}
