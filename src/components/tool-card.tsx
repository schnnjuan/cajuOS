import Link from "next/link";
import type { Tool } from "@/lib/tools";

export function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/30"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 font-mono text-sm dark:bg-zinc-800">
          {tool.icon}
        </span>
        <span className="text-xs text-muted">#{index + 1}</span>
      </div>
      <div>
        <h3 className="font-medium tracking-tight">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted">{tool.tagline}</p>
      </div>
      {tool.hasApi && (
        <span className="text-xs text-muted">API disponível</span>
      )}
    </Link>
  );
}
