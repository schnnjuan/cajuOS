import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { contentSlugs } from "@/lib/content";
import { toolBySlug } from "@/lib/tools";

export function generateStaticParams() {
  return contentSlugs("docs").map((tool) => ({ tool }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const t = toolBySlug(tool);
  if (!t) return {};
  return {
    title: `Docs · ${t.name}`,
    description: `Documentação da API ${t.name}.`,
  };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const t = toolBySlug(tool);
  if (!t) notFound();
  if (!contentSlugs("docs").includes(tool)) notFound();

  const { default: Doc } = await import(`@/content/docs/${tool}.mdx`);

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-sm text-muted">{t.name}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Docs</h1>
      <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
        <Doc />
      </div>
    </div>
  );
}
