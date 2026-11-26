import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { deleteRide, sanitizeRideForViewer, updateRide } from "@/lib/store";
import type { RideCategory, RideStatus } from "@/lib/types";
import { isSameOriginRequest, sanitizeText } from "@/lib/validation";

const VALID_CATEGORIES = new Set<RideCategory>([
  "rabo",
  "sporty",
  "sunday",
  "ngelayap",
  "collab",
]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const patch: Parameters<typeof updateRide>[1] = {};
  if (body.status === "upcoming" || body.status === "archive") {
    patch.status = body.status as RideStatus;
  }
  if (typeof body.category === "string" && VALID_CATEGORIES.has(body.category as RideCategory)) {
    patch.category = body.category as RideCategory;
  }
  if (typeof body.dateBadge === "string") patch.dateBadge = sanitizeText(body.dateBadge, 60);
  if (typeof body.title === "string") patch.title = sanitizeText(body.title, 120);
  if (typeof body.schedule === "string") patch.schedule = sanitizeText(body.schedule, 120);
  if (typeof body.tikum === "string") patch.tikum = sanitizeText(body.tikum, 140);
  if (typeof body.distance === "string") patch.distance = sanitizeText(body.distance, 40);
  if (typeof body.bikes === "string") patch.bikes = sanitizeText(body.bikes, 100);
  if (typeof body.pace === "string") patch.pace = sanitizeText(body.pace, 80);
  if (typeof body.highlight === "string") patch.highlight = sanitizeText(body.highlight, 400);
  if (typeof body.ridersAttended === "string") {
    patch.ridersAttended = sanitizeText(body.ridersAttended, 60);
  }
  if (typeof body.zineSlug === "string") patch.zineSlug = sanitizeText(body.zineSlug, 80);

  if (body.brosur && typeof body.brosur === "object") {
    const b = body.brosur as Record<string, unknown>;
    patch.brosur = {
      ...(typeof b.isCollab === "boolean" ? { isCollab: b.isCollab } : {}),
      ...(typeof b.cardPerk === "string" ? { cardPerk: sanitizeText(b.cardPerk, 140) } : {}),
      ...(typeof b.quota === "string" ? { quota: sanitizeText(b.quota, 120) } : {}),
      ...(Array.isArray(b.points)
        ? {
            points: b.points
              .map((p) => sanitizeText(p, 200))
              .filter(Boolean)
              .slice(0, 12),
          }
        : {}),
      ...(typeof b.giveback === "string" ? { giveback: sanitizeText(b.giveback, 360) } : {}),
      ...(typeof b.prompt === "string" ? { prompt: sanitizeText(b.prompt, 160) } : {}),
    };
  }

  const updated = await updateRide(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Agenda tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ ride: sanitizeRideForViewer(updated, null) });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
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
