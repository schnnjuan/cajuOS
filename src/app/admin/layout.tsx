"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/changelog", label: "Changelog" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't wrap login page with admin nav
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-semibold tracking-tight"
            >
              caju<span className="text-muted">os</span>
              <span className="ml-1.5 text-xs text-muted">admin</span>
            </Link>
            <div className="flex gap-4 text-sm text-muted">
              {links.map((l) => {
                const active =
                  l.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`transition-colors duration-150 ease-out hover:text-foreground ${
                      active ? "text-foreground font-medium" : ""
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-muted transition-colors duration-150 ease-out hover:text-foreground"
            >
              Site
            </Link>
            <a
              href="/admin/logout"
              className="text-muted transition-colors duration-150 ease-out hover:text-red-500"
            >
              Sair
            </a>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
