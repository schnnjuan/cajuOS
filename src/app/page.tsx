import Link from "next/link";
import type { Metadata } from "next";
import { tools, toolProgressLabel } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";

export const metadata: Metadata = {
  openGraph: {
    title: "CajuOS",
    description:
      "Uma tool por semana. Pequenas ferramentas úteis, open source, feitas para durar.",
    url: "https://cajuos.dev",
  },
  twitter: {
    title: "CajuOS",
    description:
      "Uma tool por semana. Pequenas ferramentas úteis, open source, feitas para durar.",
  },
  alternates: {
    canonical: "https://cajuos.dev",
  },
};

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <section className="flex flex-col gap-6">
        <p className="text-sm text-muted">{toolProgressLabel()}</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Pequenas ferramentas úteis.
          <br />
          Uma por semana.
        </h1>
        <p className="max-w-xl text-lg text-muted">
          CajuOS é uma coleção de tools open source. Cada uma resolve um
          problema real, roda no browser e tem código aberto.
        </p>
        <div>
          <Link
            href="/tools"
            className="text-sm font-medium underline underline-offset-4 transition-[color,transform] duration-150 ease-out hover:text-muted active:scale-95"
          >
            Ver todas as tools →
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-muted">
          Tools
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tools.map((tool, i) => (
            <ToolCard key={tool.slug} tool={tool} index={i} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-muted">
          Jogos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>
      </section>
    </div>
  );
}
