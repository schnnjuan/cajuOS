export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Painel administrativo do CajuOS.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a
          href="/admin/blog"
          className="rounded-md border border-border px-5 py-8 text-center transition-[color,transform] duration-150 ease-out hover:text-muted active:scale-95"
        >
          <span className="text-sm font-medium">Blog</span>
        </a>
        <a
          href="/admin/tools"
          className="rounded-md border border-border px-5 py-8 text-center transition-[color,transform] duration-150 ease-out hover:text-muted active:scale-95"
        >
          <span className="text-sm font-medium">Tools</span>
        </a>
        <a
          href="/admin/changelog"
          className="rounded-md border border-border px-5 py-8 text-center transition-[color,transform] duration-150 ease-out hover:text-muted active:scale-95"
        >
          <span className="text-sm font-medium">Changelog</span>
        </a>
      </div>
    </div>
  );
}
