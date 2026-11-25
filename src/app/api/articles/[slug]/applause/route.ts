import { NextResponse } from "next/server";
import { checkRateLimit, hashClientIp } from "@/lib/rateLimit";
import { incrementArticleApplause } from "@/lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const ipHash = hashClientIp(request);
  if (!checkRateLimit(`applause:${slug}:${ipHash}`, 20, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }
  try {
    const applause = await incrementArticleApplause(slug);
    return NextResponse.json({ applause });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal" },
      { status: 404 }
    );
  }
}
