import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { contentSlugs, readMdx } from "@/lib/content";
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
  const raw = readMdx("docs", tool);
  if (!raw) notFound();

  const { content } = await compileMDX({ source: raw });

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-sm text-muted">{t.name}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Docs</h1>
      <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
        {content}
      </div>
    </div>
  );
}
