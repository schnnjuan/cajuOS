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
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-8 text-sm text-muted sm:flex-row sm:items-start sm:justify-between">
        {/* Marca + progresso */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <span className="tabular-nums font-medium text-foreground">
            cajuos<span className="text-accent">.dev</span>
          </span>
          <span className="tabular-nums">{toolProgressLabel()}</span>
          <a
            href="https://x.com/schnnjuan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Perfil no X/Twitter"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <span>by schnnjuan</span>
            <XLogo />
          </a>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
          <a href="/experiment" className="transition-colors hover:text-foreground">
            Experimento
          </a>
          <a href="/changelog" className="transition-colors hover:text-foreground">
            Changelog
          </a>
          <a
            href="https://games.cajuos.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Jogos
          </a>
          <a
            href="https://github.com/schnnjuan/cajuOS"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a href="/feed.xml" type="application/rss+xml" className="transition-colors hover:text-foreground">
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
