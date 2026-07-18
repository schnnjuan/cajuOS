"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="rounded-md border border-border px-2 py-1 text-sm transition-[color,background-color,transform] duration-150 ease-out hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95"
    >
      {mounted ? (
        <span aria-hidden="true">{dark ? "☀" : "☾"}</span>
      ) : (
        <span className="invisible">·</span>
      )}
    </button>
  );
}
