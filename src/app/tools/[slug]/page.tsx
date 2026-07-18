import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, toolBySlug, toolIndex } from "@/lib/tools";
import { getToolComponent } from "@/components/tool-components";

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

  const ToolComponent = getToolComponent(slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/tools"
        className="transition-[color,transform] duration-150 ease-out text-sm text-muted hover:text-foreground active:scale-95"
      >
        ← Tools
      </Link>
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Tool <span className="text-accent">#{index + 1}</span></p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {tool.name}
          </h1>
          <p className="mt-2 text-muted">{tool.tagline}</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 font-mono dark:bg-zinc-800">
          {tool.icon}
        </span>
      </div>

      {ToolComponent ? (
        <section className="mt-10">
          <ToolComponent />
        </section>
      ) : (
        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            O que faz
          </h2>
          <p className="mt-3">{tool.tagline}</p>
          <p className="mt-2 text-muted">
            Tool #{index + 1} da coleção CajuOS. Open source, roda no browser.
          </p>
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link
          href={`/docs/${tool.slug}`}
          className="transition-[color,transform] duration-150 ease-out underline underline-offset-4 hover:text-muted active:scale-95"
        >
          Documentação →
        </Link>
        <Link
          href={`/changelog#${tool.slug}`}
          className="transition-[color,transform] duration-150 ease-out underline underline-offset-4 hover:text-muted active:scale-95"
        >
          Changelog →
        </Link>
        {tool.hasApi && (
          <Link
            href={`/docs/${tool.slug}`}
            className="transition-[color,transform] duration-150 ease-out text-muted underline underline-offset-4 hover:text-foreground active:scale-95"
          >
            API disponível
          </Link>
        )}
      </div>
    </div>
  );
}
