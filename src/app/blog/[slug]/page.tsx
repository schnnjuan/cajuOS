import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { contentSlugs, listContent } from "@/lib/content";

export function generateStaticParams() {
  return contentSlugs("blog").map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = listContent("blog").find((p) => p.slug === slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!contentSlugs("blog").includes(slug)) notFound();

  const { default: Post } = await import(`@/content/blog/${slug}.mdx`);

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <Post />
      </div>
    </article>
  );
}
