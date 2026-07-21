"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cajuos:tool-usage";

type UsageData = Record<string, number>;

function read(): UsageData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function write(data: UsageData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage cheio ou desabilitado
  }
}

export function ToolUsageCounter({ slug }: { slug: string }) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = read();
    const current = data[slug] ?? 0;
    // Incrementa a cada visita
    const updated = current + 1;
    setCount(updated);
    write({ ...data, [slug]: updated });
    setMounted(true);
  }, [slug]);

  if (!mounted) return null;

  return (
    <p className="text-xs text-muted">
      Usada {count} {count === 1 ? "vez" : "vezes"}
    </p>
  );
}
