import { NextResponse } from "next/server";
import { getViewerRiderTokenHash, isAdminAuthenticated } from "@/lib/auth";
import { createRide, listRidesForViewer } from "@/lib/store";
import { isSameOriginRequest, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const viewerHash = await getViewerRiderTokenHash();
  const rides = await listRidesForViewer(viewerHash);
  return NextResponse.json({ rides });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const title = sanitizeText(body?.title, 120);
  const schedule = sanitizeText(body?.schedule, 120);
  const tikum = sanitizeText(body?.tikum, 140);

  if (!title || !schedule || !tikum) {
    return NextResponse.json(
      { error: "Judul, jadwal, dan titik kumpul wajib diisi." },
      { status: 400 }
    );
  }
  const ride = await createRide({
    title,
    status: body.status === "archive" ? "archive" : "upcoming",
    category: body.category || "rabo",
    dateBadge: sanitizeText(body.dateBadge, 60) || schedule,
    schedule,
    tikum,
    distance: sanitizeText(body.distance, 40) || "25 KM",
    bikes: sanitizeText(body.bikes, 100) || "All Bikes Welcome",
    pace: sanitizeText(body.pace, 80) || "Santai / Sosial",
    highlight: sanitizeText(body.highlight, 400),
    ridersAttended: body.ridersAttended
      ? sanitizeText(body.ridersAttended, 60)
      : undefined,
    zineSlug: body.zineSlug ? sanitizeText(body.zineSlug, 80) : undefined,
    brosur: {
      isCollab: Boolean(body.brosur?.isCollab),
      cardPerk: sanitizeText(body.brosur?.cardPerk, 140) || undefined,
      quota: sanitizeText(body.brosur?.quota, 120) || undefined,
      points: Array.isArray(body.brosur?.points)
        ? body.brosur.points
            .map((p: unknown) => sanitizeText(p, 200))
            .filter(Boolean)
            .slice(0, 12)
        : undefined,
      giveback: sanitizeText(body.brosur?.giveback, 360) || undefined,
      prompt: sanitizeText(body.brosur?.prompt, 160) || undefined,
    },
  });
  return NextResponse.json({ ride }, { status: 201 });
}
