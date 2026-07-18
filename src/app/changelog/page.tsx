import { compileMDX } from "next-mdx-remote/rsc";
import { listContent, readMdx } from "@/lib/content";

export const metadata = {
  title: "Changelog",
  description: "O que mudou em cada tool CajuOS.",
};

export default async function ChangelogPage() {
  const entries = listContent("changelog");

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
      <p className="mt-2 text-muted">
        Toda mudança das tools, em um só lugar.
      </p>

      <div className="mt-10 space-y-10">
        {entries.map((e) => {
          const raw = readMdx("changelog", e.slug);
          if (!raw) return null;
          return (
            <section key={e.slug} id={e.slug}>
              <h2 className="text-lg font-medium tracking-tight">
                {e.title}
              </h2>
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
  const { content } = await compileMDX({ source });
  return (
    <div className="prose prose-zinc mt-3 max-w-none text-sm dark:prose-invert">
      {content}
    </div>
  );
}
