"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Tool } from "@/lib/tools";
import { ToolIcon } from "@/components/tool-icons";
import { springs } from "@/lib/motion-config";

export function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ ...springs.gentle, delay: index * 0.08 }}
    >
      <Link
        href={`/tools/${tool.slug}`}
        className="card-hover group flex items-start gap-4 rounded-xl border border-border bg-card p-5"
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
    </motion.div>
  );
}
