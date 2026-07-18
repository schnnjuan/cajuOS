import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

export type ContentMeta = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
};

function readMeta(dir: string, file: string): ContentMeta | null {
  const full = path.join(CONTENT_DIR, dir, file);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  const slug = file.replace(/\.mdx?$/, "");
  const titleMatch = raw.match(/^title:\s*(.+)$/m);
  const descMatch = raw.match(/^description:\s*(.+)$/m);
  const dateMatch = raw.match(/^date:\s*(.+)$/m);
  return {
    slug,
    title: titleMatch ? titleMatch[1].trim() : slug,
    description: descMatch ? descMatch[1].trim() : undefined,
    date: dateMatch ? dateMatch[1].trim() : undefined,
  };
}

export function listContent(dir: string): ContentMeta[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => readMeta(dir, f))
    .filter((m): m is ContentMeta => m !== null)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function contentSlugs(dir: string): string[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

export function readMdx(dir: string, slug: string): string | null {
  const full = path.join(CONTENT_DIR, dir, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf8");
}
