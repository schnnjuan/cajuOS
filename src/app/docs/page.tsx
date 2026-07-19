import Link from "next/link";
import { contentSlugs } from "@/lib/content";
import { toolBySlug } from "@/lib/tools";

export const metadata = {
  title: "Documentação",
  description: "Documentação de todas as tools CajuOS.",
  openGraph: {
    title: "Documentação",
    description: "Documentação de todas as tools CajuOS.",
    url: "https://cajuos.dev/docs",
  },
  twitter: {
    title: "Documentação",
    description: "Documentação de todas as tools CajuOS.",
  },
  alternates: {
    canonical: "https://cajuos.dev/docs",
  },
};

export default function DocsIndex() {
  const slugs = contentSlugs("docs");
  const tools = slugs
    .map((s) => ({ slug: s, tool: toolBySlug(s) }))
    .filter((t) => t.tool);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Documentação</h1>
      <p className="mt-2 text-muted">
        Como usar cada tool CajuOS.
      </p>

      <ul className="mt-10 divide-y divide-border">
        {tools.map((t) => (
          <li key={t.slug} className="py-5">
            <Link
              href={`/docs/${t.slug}`}
              className="block transition-[color,transform] duration-150 ease-out hover:text-muted active:scale-95"
            >
              <h2 className="font-medium tracking-tight">{t.tool!.name}</h2>
              <p className="mt-1 text-sm text-muted">{t.tool!.tagline}</p>
            </Link>
          </li>
        ))}
        {tools.length === 0 && (
          <li className="py-10 text-center text-muted">
            Nenhuma documentação publicada ainda.
          </li>
        )}
      </ul>
    </div>
  );
}
