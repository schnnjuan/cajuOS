import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { contentSlugs } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cajuos.dev";

  const staticPages = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/tools`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${base}/changelog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${base}/experiment`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
  ];

  const toolPages = tools.map((t) => ({
    url: `${base}/tools/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogPages = contentSlugs("blog").map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const docPages = contentSlugs("docs").map((slug) => ({
    url: `${base}/docs/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...toolPages, ...blogPages, ...docPages];
}
