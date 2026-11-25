import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createMerchItem, listMerchItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const merch = await listMerchItems();
  return NextResponse.json({ merch });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.price) {
    return NextResponse.json(
      { error: "Nama produk dan harga wajib diisi." },
      { status: 400 }
    );
  }
  const sizes = Array.isArray(body.sizes)
    ? body.sizes.map(String).filter(Boolean)
    : String(body.sizes || "All Size")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const item = await createMerchItem({
    title: String(body.title),
    cat: body.cat || "apparel",
    status: String(body.status || "READY STOCK"),
    soldOut: Boolean(body.soldOut),
    price: String(body.price),
    sizes,
    impactNote: String(body.impactNote || ""),
    description: String(body.description || ""),
    imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
  });
  return NextResponse.json({ item }, { status: 201 });
}
