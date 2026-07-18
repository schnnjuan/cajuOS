"use client";

import { use, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { tools } from "@/lib/tools";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data, error: loadErr, isLoading } = useSWR(
    `/api/admin/content?type=blog&slug=${slug}`,
    fetcher,
  );

  const [title, setTitle] = useState("");
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [description, setDescription] = useState("");
  const [toolSlug, setToolSlug] = useState("");
  const [date, setDate] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Fill form when data arrives
  if (data && !loaded) {
    setTitle(data.title ?? slug);
    setCurrentSlug(data.slug ?? slug);
    setDescription(data.description ?? "");
    setToolSlug(data.tool ?? "");
    setDate(data.date ?? "");
    setBody(data.body ?? "");
    setLoaded(true);
  }

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugEdited) setCurrentSlug(slugify(v));
  }

  async function save(draft: boolean) {
    if (!title.trim() || !body.trim()) {
      setError("Título e conteúdo são obrigatórios.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "blog",
          slug: currentSlug || slugify(title),
          originalSlug: currentSlug !== slug ? slug : undefined,
          title: title.trim(),
          description: description.trim() || undefined,
          date,
          body,
          draft,
          tool: toolSlug || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erro ao salvar");
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-muted">Carregando…</p>
      </div>
    );
  }

  if (loadErr || !data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-red-500">Erro ao carregar post.</p>
        <a href="/admin/blog" className="mt-4 block text-sm text-muted underline">
          ← Voltar
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Editar post</h1>

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          save(false);
        }}
        className="mt-8 flex flex-col gap-5"
      >
        <div>
          <label className="mb-1 block text-sm text-muted">Título *</label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">Slug</label>
          <input
            value={currentSlug}
            onChange={(e) => {
              setCurrentSlug(e.target.value);
              setSlugEdited(true);
            }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-muted outline-none focus:border-foreground"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">Descrição</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">Tool relacionada</label>
          <select
            value={toolSlug}
            onChange={(e) => setToolSlug(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          >
            <option value="">Nenhuma</option>
            {tools.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">
            Conteúdo (MDX) *
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={18}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-foreground"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="rounded-md border border-border px-4 py-2 text-sm transition-[color,transform] duration-150 ease-out hover:text-muted active:scale-95 disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar rascunho"}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-[color,transform] duration-150 ease-out hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {saving ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
