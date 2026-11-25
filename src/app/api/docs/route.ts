import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createDocItem, listDocItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const docs = await listDocItems();
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.mediaUrl) {
    return NextResponse.json(
      { error: "Judul dan URL/file media wajib diisi." },
      { status: 400 }
    );
  }
  const item = await createDocItem({
    type: body.type === "video" ? "video" : "photo",
    mediaUrl: String(body.mediaUrl),
    posterUrl: body.posterUrl ? String(body.posterUrl) : undefined,
    cat: body.cat || "street",
    location: String(body.location || "JAKARTA"),
    dateStamp: String(body.dateStamp || "2026"),
    title: String(body.title),
    caption: String(body.caption || ""),
  });
  return NextResponse.json({ item }, { status: 201 });
}
