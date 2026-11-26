import { NextResponse } from "next/server";
import { setAdminSessionCookie, verifyPassword } from "@/lib/auth";
import { checkRateLimit, hashClientIp } from "@/lib/rateLimit";
import { isSameOriginRequest } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const ipHash = hashClientIp(request);
  if (!checkRateLimit(`admin-login:${ipHash}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Tunggu 1 menit." },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { password?: string };
  if (typeof body.password !== "string" || !body.password || !verifyPassword(body.password)) {
    return NextResponse.json(
      { error: "Password admin tidak cocok." },
      { status: 401 }
    );
  }

  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
