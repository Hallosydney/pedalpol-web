import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createArticle, listArticles } from "@/lib/store";
import { isSafeMediaUrl, isSameOriginRequest, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await listArticles();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const title = sanitizeText(body?.title, 160);
  const author = sanitizeText(body?.author, 80);

  if (!title || !author || !body?.paragraphs) {
    return NextResponse.json(
      { error: "Judul, penulis, dan isi artikel wajib diisi." },
      { status: 400 }
    );
  }

  const coverImageUrl = body.coverImageUrl
    ? sanitizeText(body.coverImageUrl, 1000)
    : undefined;
  if (coverImageUrl && !isSafeMediaUrl(coverImageUrl)) {
    return NextResponse.json(
      { error: "URL gambar sampul harus path lokal atau HTTPS yang valid." },
      { status: 400 }
    );
  }

  const paragraphs = Array.isArray(body.paragraphs)
    ? body.paragraphs.map((p: unknown) => sanitizeText(p, 3000)).filter(Boolean)
    : sanitizeText(body.paragraphs, 15000)
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);

  if (!paragraphs.length) {
    return NextResponse.json(
      { error: "Isi artikel tidak boleh kosong." },
      { status: 400 }
    );
  }

  const article = await createArticle({
    title,
    subtitle: body.subtitle ? sanitizeText(body.subtitle, 300) : undefined,
    author,
    cat: body.cat || "cerita",
    location: body.location ? sanitizeText(body.location, 100) : undefined,
    distance: body.distance ? sanitizeText(body.distance, 60) : undefined,
    bikeTag: body.bikeTag ? sanitizeText(body.bikeTag, 80) : undefined,
    quote: body.quote ? sanitizeText(body.quote, 300) : undefined,
    coverImageUrl,
    paragraphs,
  });
  return NextResponse.json({ article }, { status: 201 });
}
