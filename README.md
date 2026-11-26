# PEDAL POL — Official Community Web, Zine & Brand Portfolio

Website resmi komunitas sepeda **PedalPol** (`@pedalpol`, Menteng, Jakarta Pusat) bersama aliansi 3 komunitas gandeng: **`@pedalpol` × `@bikebaik.dijalan` × `@bike2ngonten`**.

Dibangun dengan **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (PostgreSQL & Storage)** dengan desain **Risograph Street-Art Zine**, responsif penuh di HP/desktop, dan mode **`Motion: ON / CALM`**.

---

## Fitur Utama (Fase 1 / MVP Siap Produksi)

1. **Beranda (`/`)**
   - Hero Poster + **Interactive Sticker Wall** (stiker asli *Sunday Morning Pol*, logo *PedalPol*, *Raboo-Raboo*, *For Rest Forest*, dan tombol `+ Tempel Stiker` memunculkan logo `@bike2ngonten` & `@bikebaik.dijalan`).
   - **Next Upcoming Ride Strip** (jumlah riders real-time dari database).
   - **3 Komunitas Gandeng** dengan animasi rantai sepeda kinetik.
   - **Strip Film 35mm Bergerak** menampilkan 6 foto asli + video Reels Sudirman.
   - **All Bikes Art Deck** interaktif (*Fixie*, *Gravel*, *Road Bike*, *Commuter 26"*).
2. **Zine PedalPol (`/zine` & `/zine/[slug]`)**
   - Majalah komunitas ramah SEO + filter rubrik + tombol **👏 Tepuk Pedal** + **Bagikan Link**.
   - **Contact Sheet & Street Reels:** pemutar video *Retro Camcorder* untuk Reels Sudirman 16 detik + kolase foto lapangan + **Analog Shutter Lightbox**.
   - Modal **Kirim Cerita** pembaca masuk ke antrean review Admin.
3. **Agenda Gowes & Rute (`/agenda`)**
   - **Upcoming Rides** & **Archive Buletin** (terhubung langsung ke liputan Zine).
   - **Join Barisan tanpa login** cukup pakai Nama / `@username` IG + jenis sepeda (anti-duplikat & anti-spam lewat `deviceToken` + *rate-limit* berbasis hash IP di server).
   - **📋 Informasi Brosur** dinamis per agenda + **🎟 Digital Ride Pass** untuk klaim refreshment/kolaborasi + **Post-Ride Feedback Wall**.
4. **Kampanye (`/kampanye`), Merch (`/merch`), & Kolab Brand (`/kolab`)**
   - Simulator tanam pohon **For Rest Forest × LindungiHutan** terhubung ke database.
   - Katalog **Merch & Supply** langsung membentuk format pesanan **WhatsApp Admin**.
   - Portofolio kolaborasi, preview **Media Kit**, dan form brief brand langsung masuk ke **Inbox Admin**.
5. **Panel Admin (`/admin`)**
   - Login cookie aman (`ADMIN_PASSWORD`).
   - Kelola **Agenda + edit dinamis Informasi Brosur**, **Check-in Riders + Export CSV**, review & terbitkan **Kiriman Cerita Zine**, upload **Foto/Reels baru**, kelola **Merch & nomor WA Admin**, serta baca **Inbox Kolab Brand**.

---

## Menjalankan Lokal (Langsung Jalan Tanpa Setup Rumit!)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000` (dan Panel Admin di `http://localhost:3000/admin`, password default dev: **`pedalpol2026`**).

> **Catatan Mode Penyimpanan:** Selama `NEXT_PUBLIC_SUPABASE_URL` kosong di `.env.local`, semua data otomatis tersimpan secara lokal di `data/pedalpol-db.json` dan upload file tersimpan di `public/uploads/`. Begitu env var Supabase diisi, aplikasi otomatis beralih ke **Supabase PostgreSQL + Supabase Storage**!

---

## Panduan Deploy Gratis ke Vercel + Supabase

1. **Siapkan Database Gratis di [Supabase](https://supabase.com):**
   - Buat project baru (pilih region `Singapore` agar super cepat dari Jakarta).
   - Buka **SQL Editor**, salin seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql), lalu klik **Run**.
   - Ambil `Project URL`, `anon public key`, dan `service_role key` dari **Project Settings → API**.
2. **Deploy Gratis di [Vercel](https://vercel.com):**
   - Import repository GitHub ini ke Vercel.
   - Masukkan Environment Variables sesuai `.env.example`:
     - `ADMIN_PASSWORD` *(wajib ganti dengan password kuat!)*
     - `ADMIN_SESSION_SECRET` *(string acak minimal 32 karakter)*
     - `IP_HASH_SALT` *(string acak rahasia)*
     - `NEXT_PUBLIC_WHATSAPP_NUMBER` *(contoh: `6281234567890`)*
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Klik **Deploy**, lalu hubungkan domain custom (mis. `pedalpol.id` atau `pedalpol.com`) di menu **Domains** Vercel.
