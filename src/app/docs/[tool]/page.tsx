import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { contentSlugs, readMdx, stripFrontmatter } from "@/lib/content";
import { toolBySlug } from "@/lib/tools";
import { mdxComponents } from "@/components/mdx";

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
    openGraph: {
      title: `Docs · ${t.name}`,
      description: `Documentação da API ${t.name}.`,
      url: `https://cajuos.dev/docs/${tool}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(t.name)}&subtitle=${encodeURIComponent("Documentação — " + t.tagline)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      title: `Docs · ${t.name}`,
      description: `Documentação da API ${t.name}.`,
      images: [
        `/api/og?title=${encodeURIComponent(t.name)}&subtitle=${encodeURIComponent("Documentação — " + t.tagline)}`,
      ],
    },
    alternates: {
      canonical: `https://cajuos.dev/docs/${tool}`,
    },
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="text-xs text-muted sm:text-sm">{t.name}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Docs</h1>
      {raw ? (
        <DocsContent source={raw} />
      ) : (
        <div className="animate-in mt-8 rounded-xl border border-border bg-card p-6 text-center sm:p-8">
          <p className="text-sm text-muted">
            Documentação em breve.
          </p>
        </div>
      )}
    </div>
  );
}

async function DocsContent({ source }: { source: string }) {
  const { content } = await compileMDX({
    source: stripFrontmatter(source),
    components: mdxComponents,
  });
  return (
    <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
      {content}
    </div>
  );
}
