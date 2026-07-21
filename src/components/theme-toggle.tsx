"use client";

import { useEffect, useState } from "react";

const TOGGLE_KEY = "cajuos:theme-toggles";
const EASTER_EGGS = [
  "Cansado de trocar? Vou deixar no escuro por hoje.",
  "Você sabia que o CajuOS começou como um experimento de uma tool por semana?",
  "Toda vez que você troca o tema, um dev front-end chora. Ou sorri. Depende do tema.",
  "Já tentou usar as tools? Elas funcionam nos dois temas.",
  "7 trocas seguidas. Você está testando minha paciência? Brincadeira. Continue.",
  "Sabia que o OG Image Generator foi ferramenta #1? Lançada em julho de 2026.",
];

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [eggs, setEggs] = useState(0);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
    try {
      const c = parseInt(localStorage.getItem(TOGGLE_KEY) ?? "0", 10);
      setEggs(c);
    } catch {}
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
      // Easter egg: mensagem a cada 5 toggles
      const c = (parseInt(localStorage.getItem(TOGGLE_KEY) ?? "0", 10) || 0) + 1;
      localStorage.setItem(TOGGLE_KEY, String(c));
      if (c > 0 && c % 5 === 0) {
        const idx = Math.min(Math.floor(c / 5) - 1, EASTER_EGGS.length - 1);
        alert(EASTER_EGGS[idx]);
      }
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="flex h-7 w-7 items-center justify-center rounded-md border border-border transition-[color,background-color] duration-150 ease-out hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95"
    >
      {mounted ? (
        dark ? <SunIcon /> : <MoonIcon />
      ) : (
        <span className="invisible">
          <SunIcon />
        </span>
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="2.5" />
      <line x1="8" y1="0.5" x2="8" y2="3" />
      <line x1="8" y1="13" x2="8" y2="15.5" />
      <line x1="0.5" y1="8" x2="3" y2="8" />
      <line x1="13" y1="8" x2="15.5" y2="8" />
      <line x1="2.1" y1="2.1" x2="4" y2="4" />
      <line x1="12" y1="12" x2="13.9" y2="13.9" />
      <line x1="13.9" y1="2.1" x2="12" y2="4" />
      <line x1="4" y1="12" x2="2.1" y2="13.9" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5 6 6 0 1 0 13.5 9.5Z" />
    </svg>
  );
}
