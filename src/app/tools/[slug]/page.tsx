import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, toolBySlug, toolIndex } from "@/lib/tools";
import { getToolComponent } from "@/components/tool-components";
import { readMdx, readMdxMeta, contentByTool } from "@/lib/content";
import { ToolIcon } from "@/components/tool-icons";

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

  const docMeta = readMdxMeta("docs", slug);
  const changelogEntries = contentByTool("changelog", slug);
  const blogPosts = contentByTool("blog", slug);

  let docExcerpt = "";
  if (docMeta) {
    const raw = readMdx("docs", slug);
    if (raw) {
      const body = raw.replace(/^---[\s\S]*?---\n?/, "").trim();
      docExcerpt = body.split("\n\n")[0]?.replace(/^##?\s*/, "").slice(0, 120).trim() || "";
    }
  }

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
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <ToolIcon slug={tool.slug} size={24} />
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

      {/* Related docs */}
      {docMeta && (
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Documentação
          </h2>
          <div className="mt-3 rounded-xl border border-border bg-card p-5">
            <h3 className="font-medium">{docMeta.title}</h3>
            {docExcerpt && (
              <p className="mt-1 text-sm text-muted">{docExcerpt}…</p>
            )}
            <Link
              href={`/docs/${slug}`}
              className="mt-2 inline-flex text-sm text-accent underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Docs completos →
            </Link>
          </div>
        </section>
      )}

      {/* Related changelog */}
      {changelogEntries.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Changelog
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {changelogEntries.map((e) => (
              <li key={e.slug} className="py-3">
                <Link
                  href={`/changelog?tool=${slug}`}
                  className="block text-sm transition-colors hover:text-muted"
                >
                  <span className="font-medium">{e.title}</span>
                  {e.date && <span className="ml-2 text-muted">{e.date}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Changelog
          </h2>
          <p className="mt-3 text-sm text-muted">Nada ainda.</p>
        </section>
      )}

      {/* Related blog */}
      {blogPosts.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Blog
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {blogPosts.map((p) => (
              <li key={p.slug} className="py-3">
                <Link
                  href={`/blog/${p.slug}`}
                  className="block text-sm transition-colors hover:text-muted"
                >
                  <span className="font-medium">{p.title}</span>
                  {p.date && <span className="ml-2 text-muted">{p.date}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Blog
          </h2>
          <p className="mt-3 text-sm text-muted">Nada ainda.</p>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link
          href={`/docs/${tool.slug}`}
          className="transition-[color,transform] duration-150 ease-out underline underline-offset-4 hover:text-muted active:scale-95"
        >
          Documentação →
        </Link>
        <Link
          href={`/changelog?tool=${tool.slug}`}
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
