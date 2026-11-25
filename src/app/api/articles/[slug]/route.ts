import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteArticle, getArticleBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ article });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await context.params;
  const ok = await deleteArticle(slug);
  if (!ok) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
