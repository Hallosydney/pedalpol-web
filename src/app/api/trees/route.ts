import { NextResponse } from "next/server";
import { checkRateLimit, hashClientIp } from "@/lib/rateLimit";
import { getSiteSettings, plantCommunityTrees } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ treeCount: settings.treeCount });
}

export async function POST(request: Request) {
  const ipHash = hashClientIp(request);
  if (!checkRateLimit(`trees:${ipHash}`, 25, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }
  const body = (await request.json().catch(() => ({}))) as { amount?: number };
  const treeCount = await plantCommunityTrees(Number(body.amount || 1));
  return NextResponse.json({ treeCount });
}
