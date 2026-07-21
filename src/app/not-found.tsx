import Link from "next/link";
import { tools } from "@/lib/tools";

function getRandomTool() {
  if (tools.length === 0) return null;
  return tools[Math.floor(Math.random() * tools.length)];
}

export default function NotFound() {
  const randomTool = getRandomTool();

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-sm text-accent tabular-nums">erro 404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Buraco de minhoca detectado
      </h1>
      <p className="mt-3 text-lg text-muted text-pretty">
        A página que você procurou não existe. Ou nunca existiu. Ou existe numa
        timeline alternativa onde a tool da semana é um gerador de currículos.
      </p>

      {randomTool && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <p className="text-xs text-muted uppercase tracking-wide">
            Enquanto isso, aqui vai uma tool que ninguém usou hoje:
          </p>
          <Link
            href={`/tools/${randomTool.slug}`}
            className="mt-3 block group"
          >
            <h2 className="text-lg font-semibold tracking-tight group-hover:underline underline-offset-4">
              {randomTool.name}
            </h2>
            <p className="text-sm text-muted mt-1">{randomTool.tagline}</p>
          </Link>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-[color,transform] duration-150 active:scale-95 hover:opacity-90"
        >
          Voltar ao início
        </Link>
        <Link
          href="/tools"
          className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground"
        >
          Ver tools
        </Link>
      </div>
    </div>
  );
}
