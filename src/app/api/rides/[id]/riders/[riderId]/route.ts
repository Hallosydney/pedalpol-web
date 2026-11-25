import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { toggleRiderCheckIn } from "@/lib/store";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; riderId: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, riderId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { checkedIn?: boolean };
  const ok = await toggleRiderCheckIn(id, riderId, Boolean(body.checkedIn));
  if (!ok) {
    return NextResponse.json({ error: "Rider tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
