import { NextResponse } from "next/server";
import { checkRateLimit, hashClientIp } from "@/lib/rateLimit";
import { addRideFeedback, listRides } from "@/lib/store";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ipHash = hashClientIp(request);

  if (!checkRateLimit(`feedback:${id}:${ipHash}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak kiriman feedback. Tunggu sebentar ya!" },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    author?: string;
    tag?: string;
    note?: string;
  } | null;

  if (!body?.author?.trim() || !body?.note?.trim()) {
    return NextResponse.json(
      { error: "Nama / @ig dan kesan wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const feedback = await addRideFeedback({
      rideId: id,
      author: body.author,
      tag: body.tag || "🔥 Rute Asyik",
      note: body.note,
    });
    const rides = await listRides();
    const ride = rides.find((r) => r.id === id);
    return NextResponse.json({ feedback, ride }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal kirim feedback." },
      { status: 400 }
    );
  }
}
