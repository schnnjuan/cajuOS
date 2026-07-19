import { listContent } from "@/lib/content";

export const dynamic = "force-static";

export function GET() {
  const posts = listContent("blog");
  const base = "https://cajuos.dev";
  const items = posts
    .map(
      (p) => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${base}/blog/${p.slug}</link>
      <guid>${base}/blog/${p.slug}</guid>
      ${p.date ? `<pubDate>${new Date(p.date).toUTCString()}</pubDate>` : ""}
      ${p.description ? `<description>${escapeXml(p.description)}</description>` : ""}
    </item>`
    )
    .join("");

  const lastPubDate = posts.length > 0 && posts[0].date
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CajuOS</title>
    <link>${base}</link>
    <description>Uma tool por semana.</description>
    <language>pt-BR</language>
    <lastBuildDate>${lastPubDate}</lastBuildDate>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${base}/favicon.png</url>
      <title>CajuOS</title>
      <link>${base}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
