import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createArticle, listArticles } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await listArticles();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.author || !body?.paragraphs) {
    return NextResponse.json(
      { error: "Judul, penulis, dan isi artikel wajib diisi." },
      { status: 400 }
    );
  }
  const paragraphs = Array.isArray(body.paragraphs)
    ? body.paragraphs.map(String).filter(Boolean)
    : String(body.paragraphs)
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);

  const article = await createArticle({
    title: String(body.title),
    subtitle: body.subtitle ? String(body.subtitle) : undefined,
    author: String(body.author),
    cat: body.cat || "cerita",
    location: body.location ? String(body.location) : undefined,
    distance: body.distance ? String(body.distance) : undefined,
    bikeTag: body.bikeTag ? String(body.bikeTag) : undefined,
    quote: body.quote ? String(body.quote) : undefined,
    coverImageUrl: body.coverImageUrl ? String(body.coverImageUrl) : undefined,
    paragraphs,
  });
  return NextResponse.json({ article }, { status: 201 });
}
