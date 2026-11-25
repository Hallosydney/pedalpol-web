import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteRide, updateRide } from "@/lib/store";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const updated = await updateRide(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Agenda tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ ride: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const ok = await deleteRide(id);
  if (!ok) {
    return NextResponse.json({ error: "Agenda tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
