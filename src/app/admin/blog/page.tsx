import { listContentItems } from "@/lib/admin-content";
import Link from "next/link";

export default function AdminBlogPage() {
  const items = listContentItems("blog");

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-[color,transform] duration-150 ease-out hover:opacity-90 active:scale-95"
        >
          Novo post
        </Link>
      </div>

      <ul className="mt-10 divide-y divide-border">
        {items.map((p) => (
          <li key={p.slug} className="flex items-center justify-between py-4">
            <div>
              <Link
                href={`/admin/blog/${p.slug}/edit`}
                className="font-medium transition-colors duration-150 ease-out hover:text-muted"
              >
                {p.title}
              </Link>
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
          <li className="py-10 text-center text-muted">Nenhum post ainda.</li>
        )}
      </ul>
    </div>
  );
}
