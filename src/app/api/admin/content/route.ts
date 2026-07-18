import { NextResponse } from "next/server";
import { listContentItems, readContentItem, saveContent } from "@/lib/admin-content";

type Body = {
  type: string;
  slug?: string;
  originalSlug?: string;
  title?: string;
  description?: string;
  date?: string;
  body?: string;
  draft?: boolean;
};

/* GET /api/admin/content?type=blog[&slug=hello] */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");

  if (!type) {
    return NextResponse.json({ error: "Missing type param" }, { status: 400 });
  }

  if (slug) {
    const item = readContentItem(type, slug);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  }

  const items = listContentItems(type);
  return NextResponse.json({ items });
}

/* POST /api/admin/content  —  save (create or update) */
export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  if (!body.type || !body.slug || !body.title || body.body === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: type, slug, title, body" },
      { status: 400 },
    );
  }

  try {
    const result = await saveContent({
      type: body.type,
      slug: body.slug,
      title: body.title,
      description: body.description,
      date: body.date ?? new Date().toISOString().split("T")[0],
      body: body.body,
      draft: body.draft ?? false,
      originalSlug: body.originalSlug,
    });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
