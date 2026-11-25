import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createRide, listRides } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const rides = await listRides();
  return NextResponse.json({ rides });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.schedule || !body?.tikum) {
    return NextResponse.json(
      { error: "Judul, jadwal, dan titik kumpul wajib diisi." },
      { status: 400 }
    );
  }
  const ride = await createRide({
    title: String(body.title),
    status: body.status === "archive" ? "archive" : "upcoming",
    category: body.category || "rabo",
    dateBadge: String(body.dateBadge || body.schedule),
    schedule: String(body.schedule),
    tikum: String(body.tikum),
    distance: String(body.distance || "25 KM"),
    bikes: String(body.bikes || "All Bikes Welcome"),
    pace: String(body.pace || "Santai / Sosial"),
    highlight: String(body.highlight || ""),
    ridersAttended: body.ridersAttended ? String(body.ridersAttended) : undefined,
    zineSlug: body.zineSlug ? String(body.zineSlug) : undefined,
    brosur: {
      isCollab: Boolean(body.brosur?.isCollab),
      cardPerk: body.brosur?.cardPerk,
      quota: body.brosur?.quota,
      points: Array.isArray(body.brosur?.points) ? body.brosur.points : undefined,
      giveback: body.brosur?.giveback,
      prompt: body.brosur?.prompt,
    },
  });
  return NextResponse.json({ ride }, { status: 201 });
}
