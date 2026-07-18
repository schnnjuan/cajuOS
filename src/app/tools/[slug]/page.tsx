import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, toolBySlug, toolIndex } from "@/lib/tools";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) return {};
  return { title: tool.name, description: tool.tagline };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  const index = toolIndex(slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/tools"
        className="text-sm text-muted hover:text-foreground"
      >
        ← Tools
      </Link>
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Tool #{index + 1}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {tool.name}
          </h1>
          <p className="mt-2 text-muted">{tool.tagline}</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 font-mono dark:bg-zinc-800">
          {tool.icon}
        </span>
      </div>

      <section className="mt-10 rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          Demo
        </h2>
        <p className="mt-3 text-muted">
          Demo interativa em breve. Enquanto isso, leia os docs ou o changelog.
        </p>
      </section>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link
          href={`/docs/${tool.slug}`}
          className="underline underline-offset-4 hover:text-muted"
        >
          Documentação →
        </Link>
        <Link
          href="/changelog"
          className="underline underline-offset-4 hover:text-muted"
        >
          Changelog →
        </Link>
        {tool.hasApi && (
          <span className="text-muted">API: em breve</span>
        )}
      </div>
    </div>
  );
}
