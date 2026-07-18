import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "src", "content");
const GITHUB_OWNER = "schnnjuan";
const GITHUB_REPO = "cajuOS";

export type ContentItem = {
  slug: string;
  title: string;
  description?: string;
  date: string;
  draft: boolean;
};

export type ContentDetail = ContentItem & { body: string };

/* ── frontmatter helpers ── */

function parseFrontmatter(raw: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: raw.trim() };

  const fm: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { frontmatter: fm, body: m[2].trim() };
}

function buildFrontmatter(fm: Record<string, string | boolean>): string {
  const lines = Object.entries(fm)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join("\n")}\n---\n\n`;
}

/* ── local FS helpers ── */

function readFile(type: string, slug: string): string | null {
  const published = path.join(CONTENT_DIR, type, `${slug}.mdx`);
  if (fs.existsSync(published)) return fs.readFileSync(published, "utf8");
  const draft = path.join(CONTENT_DIR, "_drafts", type, `${slug}.mdx`);
  if (fs.existsSync(draft)) return fs.readFileSync(draft, "utf8");
  return null;
}

function isDraft(type: string, slug: string): boolean {
  return fs.existsSync(path.join(CONTENT_DIR, "_drafts", type, `${slug}.mdx`));
}

/* ── GitHub API helpers ── */

async function saveViaGithub(relativePath: string, content: string) {
  const token = process.env.GITHUB_TOKEN!;
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${relativePath}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  // Get existing SHA if file exists
  let sha: string | undefined;
  try {
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = (await res.json()) as { sha?: string };
      sha = data.sha;
    }
  } catch {
    /* file doesn't exist */
  }

  const body: Record<string, string> = {
    message: sha ? `chore: update ${relativePath}` : `chore: create ${relativePath}`,
    content: Buffer.from(content, "utf8").toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
}

/* ── public API ── */

export function listContentItems(type: string): ContentItem[] {
  const items: ContentItem[] = [];

  for (const dir of [type, `_drafts/${type}`]) {
    const full = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(full)) continue;
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith(".mdx")) continue;
      const raw = fs.readFileSync(path.join(full, file), "utf8");
      const { frontmatter } = parseFrontmatter(raw);
      const slug = file.replace(/\.mdx$/, "");
      items.push({
        slug,
        title: frontmatter.title || slug,
        description: frontmatter.description,
        date: frontmatter.date || "",
        draft: dir.startsWith("_drafts"),
      });
    }
  }

  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export function readContentItem(type: string, slug: string): ContentDetail | null {
  const raw = readFile(type, slug);
  if (!raw) return null;

  const { frontmatter, body } = parseFrontmatter(raw);

  return {
    slug,
    title: frontmatter.title || slug,
    description: frontmatter.description,
    date: frontmatter.date || "",
    draft: isDraft(type, slug),
    body,
  };
}

export async function saveContent(opts: {
  type: string;
  slug: string;
  title: string;
  description?: string;
  date: string;
  body: string;
  draft: boolean;
  originalSlug?: string;
}): Promise<{ ok: boolean; slug: string }> {
  const dir = opts.draft ? `_drafts/${opts.type}` : opts.type;
  const filename = `${opts.slug}.mdx`;

  const fm: Record<string, string | boolean> = {
    title: opts.title,
    date: opts.date,
  };
  if (opts.description) fm.description = opts.description;

  const fileContent = buildFrontmatter(fm) + opts.body.trim();

  const relativePath = `src/content/${dir}/${filename}`;

  if (process.env.GITHUB_TOKEN) {
    await saveViaGithub(relativePath, fileContent);
  } else {
    const absPath = path.join(process.cwd(), relativePath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, fileContent, "utf8");
  }

  // If slug changed, remove old file
  if (opts.originalSlug && opts.originalSlug !== opts.slug) {
    const oldDir = opts.draft ? `_drafts/${opts.type}` : opts.type;
    const oldRel = `src/content/${oldDir}/${opts.originalSlug}.mdx`;
    if (process.env.GITHUB_TOKEN) {
      // GitHub delete requires SHA — skip for MVP
    } else {
      const oldAbs = path.join(process.cwd(), oldRel);
      if (fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs);
    }
  }

  return { ok: true, slug: opts.slug };
}
