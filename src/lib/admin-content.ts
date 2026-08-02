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
  tool?: string;
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

const GITHUB_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN!;
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };
}

async function githubList(dir: string): Promise<
  { name: string; sha: string }[]
> {
  const res = await fetch(`${GITHUB_API}/src/content/${dir}`, {
    headers: githubHeaders(),
  });
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { name: string; sha: string }[];
  return data.filter((f) => f.name.endsWith(".mdx"));
}

async function githubRead(path: string): Promise<string | null> {
  const res = await fetch(`${GITHUB_API}/${path}`, {
    headers: githubHeaders(),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { content: string };
  return Buffer.from(data.content, "base64").toString("utf8");
}

async function githubDelete(relativePath: string): Promise<boolean> {
  const url = `${GITHUB_API}/${relativePath}`;
  const res = await fetch(url, { headers: githubHeaders() });
  if (res.status === 404) return false;
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { sha: string };

  const del = await fetch(url, {
    method: "DELETE",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `chore: delete ${relativePath}`,
      sha: data.sha,
    }),
  });
  if (!del.ok) {
    throw new Error(`GitHub API ${del.status}: ${await del.text()}`);
  }
  return true;
}

/* Vercel serverless não carrega src/content via fs em runtime:
   lista/lê via GitHub API em produção, fs em dev. */
const githubMode = () => process.env.NODE_ENV === "production";

async function saveViaGithub(relativePath: string, content: string) {
  const url = `${GITHUB_API}/${relativePath}`;
  const headers = githubHeaders();

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

export async function listContentItems(type: string): Promise<ContentItem[]> {
  const items: ContentItem[] = [];

  if (githubMode()) {
    for (const dir of [type, `_drafts/${type}`]) {
      const files = await githubList(dir);
      for (const file of files) {
        const raw = await githubRead(`src/content/${dir}/${file.name}`);
        if (!raw) continue;
        const { frontmatter } = parseFrontmatter(raw);
        items.push({
          slug: file.name.replace(/\.mdx$/, ""),
          title: frontmatter.title || file.name.replace(/\.mdx$/, ""),
          description: frontmatter.description,
          date: frontmatter.date || "",
          draft: dir.startsWith("_drafts"),
          tool: frontmatter.tool,
        });
      }
    }
  } else {
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
          tool: frontmatter.tool,
        });
      }
    }
  }

  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export async function readContentItem(
  type: string,
  slug: string,
): Promise<ContentDetail | null> {
  let raw: string | null = null;

  if (githubMode()) {
    raw = await githubRead(`src/content/${type}/${slug}.mdx`);
    if (!raw) raw = await githubRead(`src/content/_drafts/${type}/${slug}.mdx`);
  } else {
    raw = readFile(type, slug);
  }
  if (!raw) return null;

  const { frontmatter, body } = parseFrontmatter(raw);

  return {
    slug,
    title: frontmatter.title || slug,
    description: frontmatter.description,
    date: frontmatter.date || "",
    draft: githubMode()
      ? (await githubRead(`src/content/_drafts/${type}/${slug}.mdx`)) !== null
      : isDraft(type, slug),
    tool: frontmatter.tool,
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
  tool?: string;
}): Promise<{ ok: boolean; slug: string }> {
  const dir = opts.draft ? `_drafts/${opts.type}` : opts.type;
  const filename = `${opts.slug}.mdx`;

  const fm: Record<string, string | boolean> = {
    title: opts.title,
    date: opts.date,
  };
  if (opts.description) fm.description = opts.description;
  if (opts.tool) fm.tool = opts.tool;

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
      await githubDelete(oldRel);
    } else {
      const oldAbs = path.join(process.cwd(), oldRel);
      if (fs.existsSync(oldAbs)) fs.unlinkSync(oldAbs);
    }
  }

  return { ok: true, slug: opts.slug };
}

export async function deleteContent(
  type: string,
  slug: string,
  draft: boolean,
): Promise<{ ok: boolean; notFound?: boolean }> {
  const dir = draft ? `_drafts/${type}` : type;
  const relativePath = `src/content/${dir}/${slug}.mdx`;

  if (process.env.GITHUB_TOKEN) {
    const deleted = await githubDelete(relativePath);
    if (!deleted) return { ok: false, notFound: true };
  } else {
    const absPath = path.join(process.cwd(), relativePath);
    if (!fs.existsSync(absPath)) return { ok: false, notFound: true };
    fs.unlinkSync(absPath);
  }

  return { ok: true };
}
