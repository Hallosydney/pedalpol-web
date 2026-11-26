import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getStorageMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    storageMode: getStorageMode(),
  });
}
