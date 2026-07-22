"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { tools } from "@/lib/tools";

// Primary: sempre visível. Secondary: no dropdown "More" no desktop.
const primaryNav = [
  { href: "/experiment", label: "Experimento" },
  { href: "/tools", label: "Tools" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
];

const secondaryNav = [
  { href: "/changelog", label: "Changelog" },
  { href: "/about", label: "About" },
  { href: "https://games.cajuos.dev", label: "Jogos" },
];

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="h-4 w-4">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="h-4 w-4">
      <line x1="3" y1="3" x2="13" y2="13" />
      <line x1="13" y1="3" x2="3" y2="13" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Fecha mobile menu ao clicar fora
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Fecha dropdown "More" ao clicar fora
  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  // Fecha menus no Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMoreOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3" ref={menuRef}>
        <Link href="/" className="text-base font-semibold tracking-tight">
          caju<span className="text-accent">os</span>
          <span className="hidden sm:inline text-accent">.dev</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 text-sm text-muted">
          {primaryNav.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-2.5 py-1.5 transition-colors duration-150 ${
                  active
                    ? "text-foreground bg-zinc-100 dark:bg-zinc-800"
                    : "hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                {n.label}
              </Link>
            );
          })}

          {/* Dropdown "More" para links secundários */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="rounded-md px-2.5 py-1.5 transition-colors duration-150 hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              aria-label="Mais links"
            >
              More
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-border bg-card p-1.5 shadow-sm">
                {secondaryNav.map((n) => {
                  const ext = n.href.startsWith("http");
                  const active = isActive(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        active
                          ? "text-foreground bg-zinc-100 dark:bg-zinc-800"
                          : "text-muted hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      }`}
                      onClick={() => setMoreOpen(false)}
                      {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {n.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <ThemeToggle />
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex h-7 w-7 items-center justify-center rounded-md border border-border transition-[color,background-color] duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden absolute top-full right-6 mt-1 w-56 rounded-xl border border-border bg-card p-1.5 shadow-sm animate-in">
            {[...primaryNav, ...secondaryNav].map((n, i) => {
              const ext = n.href.startsWith("http");
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                    active
                      ? "text-foreground bg-zinc-100 dark:bg-zinc-800"
                      : "text-muted hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                  onClick={() => setMenuOpen(false)}
                  {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {n.label}
                </Link>
              );
            })}
            <div className="border-t border-border mt-1 pt-1.5 px-3 pb-1.5">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
