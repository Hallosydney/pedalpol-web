import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createMerchItem, listMerchItems } from "@/lib/store";
import { isSafeMediaUrl, isSameOriginRequest, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const merch = await listMerchItems();
  return NextResponse.json({ merch });
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
  const price = sanitizeText(body?.price, 40);

  if (!title || !price) {
    return NextResponse.json(
      { error: "Nama produk dan harga wajib diisi." },
      { status: 400 }
    );
  }

  const imageUrl = body.imageUrl ? sanitizeText(body.imageUrl, 1000) : undefined;
  if (imageUrl && !isSafeMediaUrl(imageUrl)) {
    return NextResponse.json(
      { error: "URL gambar merch harus path lokal atau HTTPS yang valid." },
      { status: 400 }
    );
  }

  const sizes = Array.isArray(body.sizes)
    ? body.sizes.map((s: unknown) => sanitizeText(s, 30)).filter(Boolean)
    : sanitizeText(body.sizes || "All Size", 120)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const item = await createMerchItem({
    title,
    cat: body.cat || "apparel",
    status: sanitizeText(body.status || "READY STOCK", 40),
    soldOut: Boolean(body.soldOut),
    price,
    sizes,
    impactNote: sanitizeText(body.impactNote, 160),
    description: sanitizeText(body.description, 500),
    imageUrl,
  });
  return NextResponse.json({ item }, { status: 201 });
}
