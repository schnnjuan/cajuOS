import Link from "next/link";
import { listContent } from "@/lib/content";

export const metadata = {
  title: "Blog",
  description: "Posts curtos: como usar X pra resolver Y.",
};

export default function BlogIndex() {
  const posts = listContent("blog");

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-2 text-muted">
        Casos curtos de uso das tools CajuOS.
      </p>

      <ul className="mt-10 divide-y divide-border">
        {posts.map((p) => (
          <li key={p.slug} className="py-5">
            <Link href={`/blog/${p.slug}`} className="block transition-[color,transform] duration-150 ease-out hover:text-muted active:scale-95">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-medium tracking-tight">
                  {p.title}
                </h2>
                {p.date && (
                  <span className="shrink-0 text-sm text-muted">{p.date}</span>
                )}
              </div>
              {p.description && (
                <p className="mt-1 text-sm text-muted">{p.description}</p>
              )}
            </Link>
          </li>
        ))}
        {posts.length === 0 && (
          <li className="animate-in py-5 text-muted">Nenhum post ainda.</li>
        )}
      </ul>
    </div>
  );
}
