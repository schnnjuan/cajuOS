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
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            className="shrink-0 text-sm font-semibold tracking-tight"
          >
            caju<span className="text-muted">os</span>
            <span className="ml-1 text-xs text-muted">admin</span>
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {links.map((l) => {
              const active =
                l.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`py-1 transition-colors duration-150 ease-out hover:text-foreground ${
                    active ? "font-medium text-foreground" : ""
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="py-1 text-muted transition-colors duration-150 ease-out hover:text-foreground"
            >
              Site
            </Link>
            <a
              href="/admin/logout"
              className="py-1 text-muted transition-colors duration-150 ease-out hover:text-red-500"
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
