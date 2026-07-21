import Link from "next/link";
import type { Metadata } from "next";
import { tools, toolProgressLabel, currentWeek } from "@/lib/tools";
import { ToolIcon } from "@/components/tool-icons";

export const metadata: Metadata = {
  openGraph: {
    title: "CajuOS",
    description:
      "Uma tool por semana. Ferramentas úteis que rodam no navegador.",
    url: "https://cajuos.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "CajuOS",
    description:
      "Uma tool por semana. Ferramentas úteis que rodam no navegador.",
    images: ["/opengraph-image.png"],
  },
  alternates: {
    canonical: "https://cajuos.dev",
  },
};

export default function Home() {
  const week = currentWeek();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <section className="flex flex-col gap-6">
        <p className="text-sm text-muted tabular-nums">{toolProgressLabel()} · Semana {week}</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Pequenas ferramentas úteis.
          <br />
          Uma por semana.
        </h1>
        <p className="max-w-xl text-lg text-muted text-pretty">
          Tools que resolvem problemas de verdade. Tudo open source, tudo
          roda no navegador.
        </p>
        <div className="flex gap-4">
          <Link
            href="/tools"
            className="inline-flex items-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-[color,transform] duration-150 active:scale-95 hover:opacity-90"
          >
            Explorar tools
          </Link>
          <Link
            href="/experiment"
            className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground"
          >
            Sobre o experimento
          </Link>
        </div>
      </section>

      {/* Timeline de tools */}
      <section className="mt-20">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted mb-6">
          Lançamentos
        </h2>
        <div className="pl-1">
          {tools.length > 0 ? (
            tools.map((tool, i) => (
              <div key={tool.slug} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <span className="flex h-3 w-3 shrink-0 rounded-full bg-accent" />
                  {i < tools.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className={i < tools.length - 1 ? "pb-8 flex-1" : "flex-1"}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-card sm:p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <ToolIcon slug={tool.slug} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium tracking-tight">{tool.name}</h3>
                        <span className="text-xs text-accent tabular-nums">#{i + 1}</span>
                      </div>
                      <p className="text-sm text-muted mt-0.5">{tool.tagline}</p>
                    </div>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">Nenhuma tool lançada ainda. Esta semana sai a primeira.</p>
          )}

          {/* Placeholder próxima tool */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent/30" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
              </span>
            </div>
            <div className="flex-1 py-3 sm:py-4">
              <p className="text-sm text-muted">Próxima tool essa semana</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted mb-6">
          Jogos
        </h2>
        <a
          href="https://games.cajuos.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="card-hover animate-in group flex items-start gap-4 rounded-xl border border-border bg-card p-5"
          style={{ animationDelay: "0ms" }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true" className="text-muted">
              <line x1="6" y1="12" x2="10" y2="12" />
              <line x1="8" y1="10" x2="8" y2="14" />
              <line x1="15" y1="13" x2="15.01" y2="13" />
              <line x1="18" y1="11" x2="18.01" y2="11" />
              <rect x="2" y="6" width="20" height="12" rx="2" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium tracking-tight">Caça-palavras</h3>
            <p className="mt-1 text-sm text-muted">
              Jogue em tempo real com amigos. Modo cooperativo ou competitivo.
            </p>
          </div>
        </a>
      </section>
    </div>
  );
}
