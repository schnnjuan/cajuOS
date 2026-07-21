"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cajuos:tool-usage";
const DAILY_KEY = "cajuos:tool-daily";

type UsageData = Record<string, number>;
type DailyData = Record<string, string>; // slug -> date string (YYYY-MM-DD)

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage cheio ou desabilitado
  }
}

export function ToolUsageCounter({ slug }: { slug: string }) {
  const [total, setTotal] = useState(0);
  const [daily, setDaily] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const usage = read<UsageData>(STORAGE_KEY, {});
    const dailyMap = read<DailyData>(DAILY_KEY, {});
    const today = new Date().toISOString().slice(0, 10);

    // Total: incrementa a cada visita
    const currentTotal = (usage[slug] ?? 0) + 1;
    setTotal(currentTotal);
    write(STORAGE_KEY, { ...usage, [slug]: currentTotal });

    // Daily: conta por dia
    const lastVisit = dailyMap[slug];
    if (lastVisit === today) {
      // Já visitou hoje — não incrementa daily de novo
      // (a menos que queiramos contar visitas múltiplas no mesmo dia)
      // Por simplicidade, conta daily como 1 se visitou hoje
      setDaily(1);
    } else {
      setDaily(1);
      write(DAILY_KEY, { ...dailyMap, [slug]: today });
    }

    setMounted(true);
  }, [slug]);

  if (!mounted) return null;

  if (total === 0) return null;

  return (
    <span className="text-xs text-muted tabular-nums">
      {daily > 0 && `${daily} hoje · `}
      {total} {total === 1 ? "uso" : "usos"} total
    </span>
  );
}
