import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { listContent, contentSlugs, readMdx, stripFrontmatter } from "@/lib/content";
import { toolBySlug } from "@/lib/tools";
import { mdxComponents } from "@/components/mdx";
import { articleSchema, breadcrumbSchema, jsonLd } from "@/lib/schema";

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
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://cajuos.dev/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      images: ["/opengraph-image.png"],
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://cajuos.dev/blog/${slug}`,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = listContent("blog");
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const raw = readMdx("blog", slug);
  if (!raw) notFound();

  const { content } = await compileMDX({
    source: stripFrontmatter(raw),
    components: mdxComponents,
  });
  const tool = post.tool ? toolBySlug(post.tool) : null;

  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <Link
        href="/blog"
        className="transition-[color,transform] duration-150 ease-out text-sm text-muted hover:text-foreground active:scale-95"
      >
        ← Blog
      </Link>

      <header className="mt-8">
        <div className="flex items-center gap-3 text-sm text-muted">
          {post.date && <time>{post.date}</time>}
          {tool && (
            <span className="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
              {tool.name}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-2 text-lg text-muted text-pretty">{post.description}</p>
        )}
      </header>

      <div className="prose prose-zinc mt-10 max-w-none dark:prose-invert">
        {content}
      </div>

      {jsonLd(articleSchema({
        headline: post.title,
        description: post.description || "",
        datePublished: post.date,
      }))}
      {jsonLd(breadcrumbSchema([
        { name: "Blog", href: "/blog" },
        { name: post.title, href: `/blog/${slug}` },
      ]))}
    </article>
  );
}
