import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { updateStorySubmissionStatus } from "@/lib/store";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: "published" | "archived";
  };
  const status = body.status === "published" ? "published" : "archived";
  const result = await updateStorySubmissionStatus(id, status);
  if (!result) {
    return NextResponse.json({ error: "Kiriman tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json(result);
}
