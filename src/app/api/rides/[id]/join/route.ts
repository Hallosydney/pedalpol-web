import { NextResponse } from "next/server";
import { checkRateLimit, hashClientIp } from "@/lib/rateLimit";
import { joinRide, leaveRide, listRides } from "@/lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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
    deviceToken?: string;
  } | null;

  if (!body?.name?.trim() || !body?.deviceToken?.trim()) {
    return NextResponse.json(
      { error: "Nama / @username IG wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const result = await joinRide({
      rideId: id,
      name: body.name,
      bike: body.bike || "Fixie",
      note: body.note,
      deviceToken: body.deviceToken,
      ipHash,
    });
    const rides = await listRides();
    const ride = rides.find((r) => r.id === id);
    return NextResponse.json({ ...result, ride }, { status: 201 });
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
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    deviceToken?: string;
  } | null;

  if (!body?.deviceToken?.trim()) {
    return NextResponse.json({ error: "Device token wajib." }, { status: 400 });
  }

  await leaveRide(id, body.deviceToken);
  const rides = await listRides();
  const ride = rides.find((r) => r.id === id);
  return NextResponse.json({ ok: true, ride });
}
