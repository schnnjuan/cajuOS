"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { ToolIcon } from "@/components/tool-icons";

type Props = {
  tools: Tool[];
};

export function ToolsBrowser({ tools }: Props) {
  const categories = useMemo(() => {
    const set = new Set(tools.map((t) => t.category));
    return ["Todas", ...Array.from(set)];
  }, [tools]);

  const [active, setActive] = useState("Todas");

  const filtered = useMemo(
    () => (active === "Todas" ? tools : tools.filter((t) => t.category === active)),
    [tools, active],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs de categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              active === cat
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted hover:border-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de tools */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="card-hover group flex items-start gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-muted dark:bg-zinc-800">
              <ToolIcon slug={tool.slug} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium tracking-tight text-sm">{tool.name}</h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted">{tool.tagline}</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted">Nenhuma tool nesta categoria.</p>
      )}
    </div>
  );
}