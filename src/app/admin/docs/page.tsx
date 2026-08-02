import { listContentItems } from "@/lib/admin-content";
import { toolBySlug } from "@/lib/tools";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function AdminDocsPage() {
  const items = await listContentItems("docs");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Docs</h1>
          <p className="mt-1 text-sm text-muted">Documentação de uso das tools.</p>
        </div>
        <Link
          href="/admin/docs/new"
          className="shrink-0 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-[color,transform] duration-150 ease-out hover:opacity-90 active:scale-95"
        >
          Nova doc
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-border">
        {items.map((p) => {
          const tool = p.tool ? toolBySlug(p.tool) : null;
          return (
            <li key={p.slug} className="flex items-center justify-between py-4">
              <div>
                <Link
                  href={`/admin/docs/${p.slug}/edit`}
                  className="font-medium transition-colors duration-150 ease-out hover:text-muted"
                >
                  {p.title}
                </Link>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-muted">
                  <span>{p.date}</span>
                  {tool && (
                    <span className="rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent">
                      {tool.name}
                    </span>
                  )}
                  {p.draft && (
                    <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs text-yellow-600 dark:text-yellow-400">
                      Rascunho
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {!p.draft && (
                  <Link
                    href={`/docs/${p.slug}`}
                    target="_blank"
                    className="text-sm text-muted transition-colors duration-150 ease-out hover:text-foreground"
                  >
                    Abrir no site
                  </Link>
                )}
                <DeleteButton type="docs" slug={p.slug} draft={p.draft} />
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="py-10 text-center text-muted">Nenhuma doc ainda.</li>
        )}
      </ul>
    </div>
  );
}
