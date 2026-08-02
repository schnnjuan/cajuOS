"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  type: string;
  slug: string;
  draft?: boolean;
};

export function DeleteButton({ type, slug, draft }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const label = draft ? "rascunho" : "conteúdo";
    if (!confirm(`Excluir ${label} "${slug}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/content?type=${type}&slug=${slug}${draft ? "&draft=1" : ""}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Falha ao excluir");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="text-sm text-red-600/80 transition-colors duration-150 ease-out hover:text-red-600 disabled:opacity-50 dark:text-red-400/80 dark:hover:text-red-400"
      >
        {busy ? "Excluindo…" : "Excluir"}
      </button>
    </span>
  );
}
