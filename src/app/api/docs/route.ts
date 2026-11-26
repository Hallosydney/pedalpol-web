import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createDocItem, listDocItems } from "@/lib/store";
import { isSafeMediaUrl, isSameOriginRequest, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const docs = await listDocItems();
  return NextResponse.json({ docs });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const title = sanitizeText(body?.title, 120);
  const mediaUrl = sanitizeText(body?.mediaUrl, 1000);
  const posterUrl = body?.posterUrl ? sanitizeText(body.posterUrl, 1000) : undefined;

  if (!title || !mediaUrl) {
    return NextResponse.json(
      { error: "Judul dan URL/file media wajib diisi." },
      { status: 400 }
    );
  }
  if (!isSafeMediaUrl(mediaUrl) || (posterUrl && !isSafeMediaUrl(posterUrl))) {
    return NextResponse.json(
      { error: "URL media harus path lokal (/media/...) atau URL HTTPS yang valid." },
      { status: 400 }
    );
  }

  const item = await createDocItem({
    type: body.type === "video" ? "video" : "photo",
    mediaUrl,
    posterUrl,
    cat: body.cat || "street",
    location: sanitizeText(body.location, 80) || "JAKARTA",
    dateStamp: sanitizeText(body.dateStamp, 30) || "2026",
    title,
    caption: sanitizeText(body.caption, 400),
  });
  return NextResponse.json({ item }, { status: 201 });
}
