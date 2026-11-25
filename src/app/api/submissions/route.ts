import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { checkRateLimit, hashClientIp } from "@/lib/rateLimit";
import { createStorySubmission, listStorySubmissions } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const submissions = await listStorySubmissions();
  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const ipHash = hashClientIp(request);
  if (!checkRateLimit(`story:${ipHash}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak kiriman cerita. Tunggu 1 menit ya." },
      { status: 429 }
    );
  }
  const body = await request.json().catch(() => null);
  if (!body?.title?.trim() || !body?.author?.trim() || !body?.body?.trim()) {
    return NextResponse.json(
      { error: "Judul, nama/IG, dan isi cerita wajib diisi." },
      { status: 400 }
    );
  }
  const submission = await createStorySubmission({
    title: String(body.title),
    author: String(body.author),
    cat: body.cat || "cerita",
    body: String(body.body),
  });
  return NextResponse.json({ submission }, { status: 201 });
}
