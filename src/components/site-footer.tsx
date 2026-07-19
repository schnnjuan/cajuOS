"use client";

import { usePathname } from "next/navigation";
import { toolProgressLabel } from "@/lib/tools";

function XLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-8 text-sm text-muted sm:flex-row sm:justify-between">
        <span>cajuos<span className="text-accent">.dev</span> — uma tool por semana.</span>

        <div className="flex flex-col items-center gap-1">
          <span>{toolProgressLabel()}</span>
          <a
            href="https://x.com/schnnjuan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Perfil no X/Twitter"
            className="hover-link flex items-center gap-1.5"
          >
            <span>by schnnjuan with ☕</span>
            <XLogo />
          </a>
        </div>

        <div className="flex gap-4">
          <a
            href="https://games.cajuos.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover-link"
          >
            Jogos
          </a>
          <a href="/changelog" className="hover-link">
            Changelog
          </a>
          <a
            href="https://github.com/schnnjuan/cajuOS"
            className="hover-link"
          >
            GitHub
          </a>
          <a href="/feed.xml" type="application/rss+xml" className="hover-link">
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
