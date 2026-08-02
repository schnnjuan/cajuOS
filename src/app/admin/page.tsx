import Link from "next/link";
import { listContentItems } from "@/lib/admin-content";
import {
  tools,
  currentWeek,
  toolsThisWeek,
  streakPercent,
  toolProgressLabel,
  TOTAL_PLANNED,
} from "@/lib/tools";

export const dynamic = "force-dynamic";

const WORKER = process.env.NODE_ENV === "production"
  ? "https://video-dl.cajuos.dev"
  : "http://localhost:8787";

type Card = { href: string; label: string; count: number; hint: string };

async function workerStatus(): Promise<{ ok: boolean; ms: number; detail: string }> {
  const start = Date.now();
  try {
    const res = await fetch(`${WORKER}/extract?page=w3schools.com`, {
      signal: AbortSignal.timeout(4000),
    });
    const ms = Date.now() - start;
    if (!res.ok) return { ok: false, ms, detail: `HTTP ${res.status}` };
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    if (data?.error) return { ok: false, ms, detail: data.error };
    return { ok: true, ms, detail: "Extrai vídeo normalmente" };
  } catch {
    return { ok: false, ms: Date.now() - start, detail: "Sem resposta (offline?)" };
  }
}

export default async function AdminDashboardPage() {
  const [blog, changelog, docs] = await Promise.all([
    listContentItems("blog"),
    listContentItems("changelog"),
    listContentItems("docs"),
  ]);

  const recents = [
    ...blog.map((i) => ({ ...i, type: "blog" as const })),
    ...changelog.map((i) => ({ ...i, type: "changelog" as const })),
    ...docs.map((i) => ({ ...i, type: "docs" as const })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const typeMeta: Record<string, { label: string; href: (slug: string) => string }> = {
    blog: { label: "Post", href: (s) => `/blog/${s}` },
    changelog: { label: "Entrada", href: () => "/changelog" },
    docs: { label: "Doc", href: (s) => `/docs/${s}` },
  };

  const cards: Card[] = [
    { href: "/admin/blog", label: "Blog", count: blog.length, hint: "posts" },
    { href: "/admin/changelog", label: "Changelog", count: changelog.length, hint: "entradas" },
    { href: "/admin/docs", label: "Docs", count: docs.length, hint: "documentos" },
    { href: "/admin/tools", label: "Tools", count: tools.length, hint: "ferramentas" },
  ];

  const worker = await workerStatus();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Painel administrativo do CajuOS.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-[color,transform] duration-150 ease-out hover:opacity-90 active:scale-95"
        >
          Novo post
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-md border border-border px-4 py-5 transition-[color,transform] duration-150 ease-out hover:text-muted active:scale-95"
          >
            <span className="text-2xl font-semibold tracking-tight">{c.count}</span>
            <span className="ml-2 text-sm text-muted">{c.label}</span>
            <span className="mt-1 block text-xs text-muted/70">{c.hint}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">Recentes</h2>
            <Link href="/admin/blog" className="text-xs text-muted hover:text-foreground">
              Ver tudo
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border rounded-md border border-border">
            {recents.map((p) => {
              const meta = typeMeta[p.type as string];
              return (
                <li key={`${p.type}-${p.slug}`} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                      <span>{p.date}</span>
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">
                        {meta?.label ?? p.type}
                      </span>
                      {p.draft && (
                        <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-yellow-600 dark:text-yellow-400">
                          Rascunho
                        </span>
                      )}
                    </div>
                  </div>
                  {meta && !p.draft && (
                    <Link
                      href={meta.href(p.slug)}
                      target="_blank"
                      className="shrink-0 text-xs text-muted hover:text-foreground"
                    >
                      Abrir
                    </Link>
                  )}
                </li>
              );
            })}
            {recents.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted">
                Nada publicado ainda.
              </li>
            )}
          </ul>
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-md border border-border p-4">
            <h2 className="text-sm font-medium text-muted">Experimento</h2>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                Semana {currentWeek()}
              </span>
              <span className="text-sm text-muted">de {TOTAL_PLANNED}</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {toolsThisWeek()} tools essa semana · {streakPercent()}% de consistência
            </p>
            <p className="mt-1 text-sm">{toolProgressLabel()}</p>
          </section>

          <section className="rounded-md border border-border p-4">
            <h2 className="text-sm font-medium text-muted">Worker · Video Downloader</h2>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  worker.ok ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm">
                {worker.ok ? "No ar" : "Fora do ar"}
                {worker.ok && worker.ms < 1000 ? ` · ${worker.ms}ms` : ""}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{worker.detail}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
