"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/tools", label: "Tools" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/changelog", label: "Changelog" },
  { href: "/about", label: "About" },
  { href: "https://games.cajuos.dev", label: "Jogos" },
];

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          caju<span className="text-accent">os</span>
          <span className="hidden sm:inline text-accent">.dev</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
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
      </div>
    </header>
  );
}
