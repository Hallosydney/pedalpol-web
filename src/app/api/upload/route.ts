import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
};

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Format file harus JPG, PNG, WebP, atau MP4." },
      { status: 400 }
    );
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 20 MB." },
      { status: 400 }
    );
  }

  const ext = EXT_MAP[file.type] || ".bin";
  const fileName = `pp-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.storage
      .from("docs")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data } = sb.storage.from("docs").getPublicUrl(fileName);
    return NextResponse.json({ url: data.publicUrl, storage: "supabase" }, { status: 201 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, fileName), buffer);
  return NextResponse.json({ url: `/uploads/${fileName}`, storage: "local" }, { status: 201 });
}
