import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { ToolIcon } from "@/components/tool-icons";

export function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="card-hover animate-in group flex items-start gap-4 rounded-xl border border-border bg-card p-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <ToolIcon slug={tool.slug} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium tracking-tight">{tool.name}</h3>
          <span className="text-xs text-accent">#{index + 1}</span>
        </div>
        <p className="mt-1 text-sm text-muted">{tool.tagline}</p>
        {tool.hasApi && (
          <p className="mt-1 text-xs text-muted">API disponível</p>
        )}
      </div>
    </Link>
  );
}
