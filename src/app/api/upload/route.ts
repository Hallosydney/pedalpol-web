import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { detectMediaFromMagicBytes, isSameOriginRequest } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Ukuran file maksimal 20 MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectMediaFromMagicBytes(buffer);
  if (!detected) {
    return NextResponse.json(
      { error: "Format file tidak valid. Hanya JPG, PNG, WebP, MP4, atau MOV asli yang diizinkan." },
      { status: 400 }
    );
  }

  const fileName = `pp-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${detected.ext}`;

  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.storage
      .from("docs")
      .upload(fileName, buffer, { contentType: detected.mime, upsert: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data } = sb.storage.from("docs").getPublicUrl(fileName);
    return NextResponse.json({ url: data.publicUrl, storage: "supabase" }, { status: 201 });
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "Upload file langsung di Vercel butuh konfigurasi Supabase Storage (isi NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY), atau tempel URL gambar/video.",
      },
      { status: 400 }
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, fileName), buffer);
  return NextResponse.json({ url: `/uploads/${fileName}`, storage: "local" }, { status: 201 });
}
