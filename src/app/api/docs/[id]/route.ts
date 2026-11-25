import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteDocItem } from "@/lib/store";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const ok = await deleteDocItem(id);
  if (!ok) {
    return NextResponse.json({ error: "Media tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
