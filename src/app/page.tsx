import Link from "next/link";
import { tools, TOTAL_PLANNED } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <section className="flex flex-col gap-6">
        <p className="text-sm text-muted">
          Tool #{tools.length} de {TOTAL_PLANNED}
        </p>
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
            className="text-sm font-medium underline underline-offset-4 hover:text-muted"
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
    </div>
  );
}
