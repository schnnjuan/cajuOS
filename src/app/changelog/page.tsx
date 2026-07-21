import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import { listContent, readMdx, stripFrontmatter } from "@/lib/content";
import { toolBySlug } from "@/lib/tools";
import { mdxComponents } from "@/components/mdx";

export const metadata = {
  title: "Changelog",
  description: "Acompanhe toda evolução das tools CajuOS.",
  openGraph: {
    title: "Changelog",
    description: "Acompanhe toda evolução das tools CajuOS.",
    url: "https://cajuos.dev/changelog",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image.png"],
    title: "Changelog",
    description: "Acompanhe toda evolução das tools CajuOS.",
  },
  alternates: {
    canonical: "https://cajuos.dev/changelog",
  },
};

export default async function ChangelogPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool: filterTool } = await searchParams;
  const filteredTool = filterTool ? toolBySlug(filterTool) : null;

  let entries = listContent("changelog");
  if (filteredTool) {
    entries = entries.filter((e) => e.tool === filteredTool.slug);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
      <p className="mt-2 text-muted">
        {filteredTool
          ? `Atualizações da ${filteredTool.name}.`
          : "Histórico de lançamentos e atualizações."}
      </p>

      {filteredTool && (
        <Link
          href="/changelog"
          className="mt-3 inline-flex text-sm text-accent underline underline-offset-4 transition-colors hover:text-foreground"
        >
          ← Ver todas as tools
        </Link>
      )}

      <div className="mt-10 space-y-10">
        {entries.map((e) => {
          const raw = readMdx("changelog", e.slug);
          if (!raw) return null;
          const entryTool = e.tool ? toolBySlug(e.tool) : null;
          return (
            <section key={e.slug} id={e.slug}>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium tracking-tight text-balance">
                  {e.title}
                </h2>
                {entryTool && (
                  <Link
                    href={`/changelog?tool=${entryTool.slug}`}
                    className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent transition-colors hover:bg-accent/20"
                  >
                    {entryTool.name}
                  </Link>
                )}
              </div>
              <ChangelogBody source={raw} />
            </section>
          );
        })}
        {entries.length === 0 && <p className="animate-in text-muted">Nada ainda.</p>}
      </div>
    </div>
  );
}

async function ChangelogBody({ source }: { source: string }) {
  const { content } = await compileMDX({
    source: stripFrontmatter(source),
    components: mdxComponents,
  });
  return (
    <div className="prose prose-zinc mt-3 max-w-none text-sm dark:prose-invert">
      {content}
    </div>
  );
}
