import { listContentItems } from "@/lib/admin-content";
import Link from "next/link";

export default function AdminChangelogPage() {
  const items = listContentItems("changelog");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Changelog</h1>
          <p className="mt-1 text-sm text-muted">
            Registro de alterações das tools.
          </p>
        </div>
        <Link
          href="/admin/changelog/new"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-[color,transform] duration-150 ease-out hover:opacity-90 active:scale-95"
        >
          Nova entrada
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-border">
        {items.map((p) => (
          <li key={p.slug} className="flex items-center justify-between py-4">
            <div>
              <span className="font-medium">{p.title}</span>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-muted">
                <span>{p.date}</span>
                {p.draft && (
                  <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs text-yellow-600 dark:text-yellow-400">
                    Rascunho
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-10 text-center text-muted">
            Nenhuma entrada ainda.
          </li>
        )}
      </ul>
    </div>
  );
}
