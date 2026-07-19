import { contentSlugs, readMdxMeta } from "@/lib/content";
import { ogImageResponse } from "@/lib/og-image";

export function generateStaticParams() {
  return contentSlugs("blog").map((slug) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = readMdxMeta("blog", slug);
  if (!meta) return new Response("Not found", { status: 404 });
  return ogImageResponse(meta.title, meta.description || "");
}
