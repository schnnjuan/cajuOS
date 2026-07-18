export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>cajuos.dev — uma tool por semana.</span>
        <div className="flex gap-4">
          <a href="/changelog" className="hover:text-foreground">
            Changelog
          </a>
          <a
            href="https://github.com/cajuos/cajuos"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <a href="/feed.xml" className="hover:text-foreground">
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
