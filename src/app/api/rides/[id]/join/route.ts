import { NextResponse } from "next/server";
import { getOrIssueRiderTokenHash, getViewerRiderTokenHash } from "@/lib/auth";
import { checkRateLimit, hashClientIp } from "@/lib/rateLimit";
import { joinRide, leaveRide, listRidesForViewer } from "@/lib/store";
import { isSameOriginRequest, sanitizeText } from "@/lib/validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const { id } = await context.params;
  const ipHash = hashClientIp(request);

  if (!checkRateLimit(`join:${id}:${ipHash}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan join dari jaringan ini. Coba sebentar lagi." },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    bike?: string;
    note?: string;
  } | null;

  const cleanName = sanitizeText(body?.name, 60);
  if (!cleanName) {
    return NextResponse.json(
      { error: "Nama / @username IG wajib diisi." },
      { status: 400 }
    );
  }

  const riderTokenHash = await getOrIssueRiderTokenHash();

  try {
    const result = await joinRide({
      rideId: id,
      name: cleanName,
      bike: sanitizeText(body?.bike, 40) || "Fixie",
      note: sanitizeText(body?.note, 220) || undefined,
      deviceToken: riderTokenHash,
      ipHash,
    });
    const rides = await listRidesForViewer(riderTokenHash);
    const ride = rides.find((r) => r.id === id);
    return NextResponse.json(
      { alreadyJoined: result.alreadyJoined, ride },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal join agenda." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const { id } = await context.params;
  const riderTokenHash = await getViewerRiderTokenHash();

  if (!riderTokenHash) {
    return NextResponse.json(
      { error: "Sesi rider tidak ditemukan." },
      { status: 400 }
    );
  }

  await leaveRide(id, riderTokenHash);
  const rides = await listRidesForViewer(riderTokenHash);
  const ride = rides.find((r) => r.id === id);
  return NextResponse.json({ ok: true, ride });
}
