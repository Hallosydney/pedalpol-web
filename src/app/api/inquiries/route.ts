import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { checkRateLimit, hashClientIp } from "@/lib/rateLimit";
import { createCollabInquiry, listCollabInquiries } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const inquiries = await listCollabInquiries();
  return NextResponse.json({ inquiries });
}

export async function POST(request: Request) {
  const ipHash = hashClientIp(request);
  if (!checkRateLimit(`inquiry:${ipHash}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak pengiriman. Tunggu sebentar ya." },
      { status: 429 }
    );
  }
  const body = await request.json().catch(() => null);
  if (!body?.brandName?.trim() || !body?.message?.trim()) {
    return NextResponse.json(
      { error: "Nama brand/komunitas dan ide kolaborasi wajib diisi." },
      { status: 400 }
    );
  }
  const inquiry = await createCollabInquiry({
    topic: String(body.topic || "Kolaborasi Brand"),
    brandName: String(body.brandName),
    contact: String(body.contact || ""),
    message: String(body.message),
  });
  return NextResponse.json({ inquiry }, { status: 201 });
}
