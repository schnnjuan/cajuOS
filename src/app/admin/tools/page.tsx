import { tools } from "@/lib/tools";

export default function AdminToolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
          <p className="mt-1 text-sm text-muted">
            {tools.length} de ∞ tools lançadas.
          </p>
        </div>
      </div>

      {tools.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          Nenhuma tool cadastrada. Adicione em{" "}
          <code className="rounded bg-border px-1.5 py-0.5 text-xs">
            src/lib/tools.ts
          </code>
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border">
          {tools.map((t) => (
            <li key={t.slug} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">{t.icon}</span>
                <div>
                  <span className="font-medium">{t.name}</span>
                  <p className="mt-0.5 text-sm text-muted">{t.tagline}</p>
                </div>
              </div>
              <span className="text-xs text-muted">{t.slug}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
