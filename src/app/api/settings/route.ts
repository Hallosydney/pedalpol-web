import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    whatsappAdmin?: string;
    treeCount?: number;
  };
  const cleanWa = body.whatsappAdmin?.replace(/[^0-9]/g, "");
  const settings = await updateSiteSettings({
    ...(cleanWa ? { whatsappAdmin: cleanWa } : {}),
    ...(typeof body.treeCount === "number" && body.treeCount >= 0
      ? { treeCount: Math.floor(body.treeCount) }
      : {}),
  });
  return NextResponse.json({ settings });
}
