import Link from "next/link";
import type { Metadata } from "next";
import { tools, toolProgressLabel, currentWeek } from "@/lib/tools";
import { ToolsBrowser } from "@/components/tools-browser";

export const metadata: Metadata = {
  openGraph: {
    title: "CajuOS",
    description:
      "Ferramentas úteis que rodam no navegador. Uma por semana.",
    url: "https://cajuos.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "CajuOS",
    description:
      "Ferramentas úteis que rodam no navegador. Uma por semana.",
    images: ["/opengraph-image.png"],
  },
  alternates: {
    canonical: "https://cajuos.dev",
  },
};

export default function Home() {
  const week = currentWeek();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      {/* Hero */}
      <section className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          caju<span className="text-accent">os</span>
        </h1>
        <p className="text-lg text-muted">
          Seu toolkit de desenvolvimento online
        </p>
        <p className="text-sm text-muted tabular-nums">
          {tools.length} ferramentas úteis · {toolProgressLabel()} · Semana {week}
        </p>
      </section>

      {/* Tools */}
      <section className="mt-10">
        <ToolsBrowser tools={tools} />
      </section>

      {/* Experimento */}
      <section className="mt-20">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted mb-4">
          Experimento
        </h2>
        <Link
          href="/experiment"
          className="card-hover group flex items-start gap-4 rounded-xl border border-border bg-card p-5"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-medium tracking-tight">Uma tool por semana</h3>
            <p className="mt-1 text-sm text-muted">
              Tudo open source, tudo roda no navegador. Sem cadastro, sem instalação.
            </p>
          </div>
        </Link>
      </section>

      {/* Jogos */}
      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted mb-4">
          Jogos
        </h2>
        <a
          href="https://games.cajuos.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="card-hover group flex items-start gap-4 rounded-xl border border-border bg-card p-5"
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

      {/* Blog */}
      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted mb-4">
          Blog
        </h2>
        <Link
          href="/blog"
          className="card-hover group flex items-start gap-4 rounded-xl border border-border bg-card p-5"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-medium tracking-tight">Notas e bastidores</h3>
            <p className="mt-1 text-sm text-muted">
              Acompanhe o experimento e as decisões de produto.
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}