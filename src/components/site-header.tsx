"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/experiment", label: "Experimento" },
  { href: "/tools", label: "Tools" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
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

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4" ref={menuRef}>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          caju<span className="text-accent">os</span>
          <span className="hidden sm:inline text-accent">.dev</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-5 text-sm text-muted">
          {nav.map((n) => {
            const ext = n.href.startsWith("http");
            return (
              <Link
                key={n.href}
                href={n.href}
                className="hover-link"
                {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {n.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex h-7 w-7 items-center justify-center rounded-md border border-border transition-colors duration-150 ease-out hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden absolute top-full right-6 mt-1 w-56 rounded-xl border border-border bg-card p-1.5 shadow-sm animate-in">
            {nav.map((n, i) => {
              const ext = n.href.startsWith("http");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors duration-150 ease-out hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
                  style={{ animationDelay: `${i * 40}ms` }}
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
