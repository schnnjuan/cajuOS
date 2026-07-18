import { listContent, contentSlugs } from "@/lib/content";

export const metadata = {
  title: "Changelog",
  description: "O que mudou em cada tool CajuOS.",
};

export function generateStaticParams() {
  return contentSlugs("changelog").map((slug) => ({ slug }));
}

export default function ChangelogPage() {
  const entries = listContent("changelog");

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
      <p className="mt-2 text-muted">
        Toda mudança das tools, em um só lugar.
      </p>

      <div className="mt-10 space-y-10">
        {entries.map((e) => (
          <section key={e.slug}>
            <h2 className="text-lg font-medium tracking-tight">
              {e.title}
            </h2>
            <ChangelogBody slug={e.slug} />
          </section>
        ))}
        {entries.length === 0 && (
          <p className="text-muted">Nada ainda.</p>
        )}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";

function ChangelogBody({ slug }: { slug: string }) {
  if (!contentSlugs("changelog").includes(slug)) return null;
  // renderiza via import dinâmico no componente pai
  return <ChangelogMDX slug={slug} />;
}

async function ChangelogMDX({ slug }: { slug: string }) {
  const { default: Body } = await import(`@/content/changelog/${slug}.mdx`);
  return (
    <div className="prose prose-zinc mt-3 max-w-none text-sm dark:prose-invert">
      <Body />
    </div>
  );
}
