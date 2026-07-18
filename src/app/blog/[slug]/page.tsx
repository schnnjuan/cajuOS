import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { listContent, contentSlugs, readMdx } from "@/lib/content";

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
  const raw = readMdx("blog", slug);
  if (!raw) notFound();

  const { content } = await compileMDX({ source: raw });

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        {content}
      </div>
    </article>
  );
}
