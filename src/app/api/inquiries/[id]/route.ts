import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { updateCollabInquiryStatus } from "@/lib/store";
import type { CollabInquiry } from "@/lib/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: CollabInquiry["status"];
  };
  const valid: CollabInquiry["status"] =
    body.status === "contacted" || body.status === "done" ? body.status : "new";
  const ok = await updateCollabInquiryStatus(id, valid);
  if (!ok) {
    return NextResponse.json({ error: "Inquiry tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
