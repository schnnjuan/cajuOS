import Link from "next/link";
import { listContent } from "@/lib/content";
import { toolBySlug } from "@/lib/tools";

export const metadata = {
  title: "Blog",
  description: "Tutoriais e casos de uso de cada tool CajuOS.",
};

export default function BlogIndex() {
  const posts = listContent("blog");

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-2 text-muted">
        Tutoriais e casos de uso de cada tool CajuOS.
      </p>

      <div className="mt-10 space-y-5">
        {posts.map((p) => {
          const tool = p.tool ? toolBySlug(p.tool) : null;
          return (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block rounded-xl border border-border bg-card p-6 transition-[color,transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 text-sm text-muted">
                {p.date && <time>{p.date}</time>}
                {tool && (
                  <span className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                    {tool.name}
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-lg font-medium tracking-tight group-hover:text-accent transition-colors duration-150 ease-out">
                {p.title}
              </h2>
              {p.description && (
                <p className="mt-1 text-sm text-muted text-pretty">{p.description}</p>
              )}
            </Link>
          );
        })}
        {posts.length === 0 && (
          <p className="py-10 text-center text-muted">Nenhum post ainda.</p>
        )}
      </div>
    </div>
  );
}
