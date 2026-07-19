import type { ComponentProps, ReactNode } from "react";

/* ── Callout ── */

type CalloutType = "info" | "tip" | "warn";

const calloutStyles: Record<CalloutType, { bg: string; iconBg: string; icon: string }> = {
  info: {
    bg: "bg-blue-500/8",
    iconBg: "text-blue-600 dark:text-blue-400",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  },
  tip: {
    bg: "bg-emerald-500/8",
    iconBg: "text-emerald-600 dark:text-emerald-400",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  },
  warn: {
    bg: "bg-amber-500/8",
    iconBg: "text-amber-600 dark:text-amber-400",
    icon: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  },
};

export function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType;
  children: ReactNode;
}) {
  const s = calloutStyles[type];
  return (
    <div className={`my-6 flex gap-4 rounded-xl ${s.bg} p-5`}>
      <svg
        viewBox="0 0 24 24"
        className={`mt-0.5 h-5 w-5 shrink-0 fill-current ${s.iconBg}`}
        aria-hidden="true"
      >
        <path d={s.icon} />
      </svg>
      <div className="text-sm">{children}</div>
    </div>
  );
}

/* ── Command (terminal) ── */

export function Command({ children }: { children: ReactNode }) {
  return (
    <div className="my-5 overflow-x-auto rounded-lg border border-border bg-zinc-900 px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm dark:border-border dark:bg-black">
      <div className="flex items-center gap-2 font-mono">
        <span className="shrink-0 text-emerald-500">$</span>
        <span className="text-zinc-100">{children}</span>
      </div>
    </div>
  );
}

/* ── Inline code ── */

export function Code({ children, ...props }: ComponentProps<"code">) {
  return (
    <code
      className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
      {...props}
    >
      {children}
    </code>
  );
}

/* ── Pre (code block) ── */

export function Pre({ children, ...props }: ComponentProps<"pre">) {
  return (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-border bg-zinc-950 p-4 text-sm text-zinc-100 dark:bg-zinc-900"
      {...props}
    >
      {children}
    </pre>
  );
}

/* ── PaletteGrid ── */

const palettes = [
  { name: "Classic", bg: "#ffffff", text: "#000000", label: "Clean, uso geral" },
  { name: "Slate", bg: "#e2e8f0", text: "#000000", label: "Conteúdo tech" },
  { name: "Warm", bg: "#fef3c7", text: "#5c3e1b", label: "Criativo, casual" },
  { name: "Minimal", bg: "#000000", text: "#ffffff", label: "Alto contraste" },
  { name: "Deep", bg: "#000000", text: "#a78bfa", label: "Visual moderno" },
];

export function PaletteGrid() {
  return (
    <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {palettes.map((p) => (
        <div
          key={p.name}
          className="flex flex-col overflow-hidden rounded-xl border border-border"
        >
          <div
            className="flex h-20 items-center justify-center px-3 text-center text-sm font-semibold"
            style={{ backgroundColor: p.bg, color: p.text }}
          >
            {p.name}
          </div>
          <div className="flex flex-col gap-0.5 px-3 py-2 text-xs text-muted">
            <span>{p.bg}</span>
            <span>{p.text}</span>
            <span className="mt-1 text-foreground">{p.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Shared components object for compileMDX ── */

export const mdxComponents = {
  Callout,
  Command,
  PaletteGrid,
  code: Code,
  pre: Pre,
};
