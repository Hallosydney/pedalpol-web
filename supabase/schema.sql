-- ============================================================================
-- PEDALPOL — SUPABASE POSTGRESQL SCHEMA
-- Jalankan seluruh script ini satu kali di Supabase Dashboard -> SQL Editor.
-- ============================================================================

-- 1. AGENDA GOWES (UPCOMING + ARCHIVE BULETIN + DYNAMIC INFORMASI BROSUR)
create table if not exists public.rides (
  id text primary key,
  status text not null check (status in ('upcoming', 'archive')) default 'upcoming',
  category text not null default 'rabo',
  badge text not null,
  date_badge text not null,
  title text not null,
  schedule text not null,
  tikum text not null,
  distance text not null,
  bikes text not null,
  pace text not null,
  accent_bg text not null default '#14101C',
  accent_text text not null default '#92FA66',
  highlight text not null,
  elevation jsonb not null default '[10,14,12,18,15,22,16,12,10]'::jsonb,
  riders_attended text,
  zine_slug text,
  -- Dynamic Informasi Brosur (diatur Admin per agenda)
  is_collab boolean not null default false,
  brosur_card_perk text not null default '📸 Docs @bike2ngonten • Road Captain & Sweeper',
  brosur_quota text not null default 'Terbuka untuk Semua Pesepeda',
  brosur_points jsonb not null default '[]'::jsonb,
  brosur_giveback text not null default 'Jaga etika jalan bareng @bikebaik.dijalan & tag @pedalpol saat share Story!',
  brosur_prompt text not null default 'Catatan tambahan (opsional)',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. LIST BARISAN / RIDERS YANG JOIN TANPA LOGIN (DEVICE TOKEN + IP HASH)
create table if not exists public.ride_riders (
  id uuid primary key default gen_random_uuid(),
  ride_id text not null references public.rides(id) on delete cascade,
  name text not null,
  bike text not null,
  note text,
  device_token text not null,
  ip_hash text,
  checked_in boolean not null default false,
  created_at timestamptz not null default now(),
  unique (ride_id, device_token)
);

create index if not exists idx_ride_riders_ride_id on public.ride_riders (ride_id, created_at desc);
create index if not exists idx_ride_riders_ip_hash on public.ride_riders (ride_id, ip_hash);

-- 3. POST-RIDE FEEDBACK WALL (UNTUK KOMUNITAS & BRAND REPORT)
create table if not exists public.ride_feedbacks (
  id uuid primary key default gen_random_uuid(),
  ride_id text not null references public.rides(id) on delete cascade,
  author text not null,
  tag text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ride_feedbacks_ride_id on public.ride_feedbacks (ride_id, created_at desc);

-- 4. ZINE PEDALPOL ARTICLES
create table if not exists public.articles (
  slug text primary key,
  cat text not null default 'cerita',
  rubrik text not null default 'CERITA JALAN',
  tag_bg text not null default '#14101C',
  tag_fg text not null default '#92FA66',
  date_label text not null,
  read_time text not null default '3 MNT BACA',
  author text not null,
  bike_tag text not null default 'All Bikes Welcome',
  location text not null default 'Jakarta',
  distance text not null default '25 KM',
  applause integer not null default 1,
  title text not null,
  subtitle text not null,
  excerpt text not null,
  quote text not null,
  cover_key text not null default 'rabo-rabo-terapi',
  cover_image_url text,
  paragraphs jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. DOKUMENTASI FOTO & STREET REELS (CONTACT SHEET + BERANDA FILMSTRIP)
create table if not exists public.doc_items (
  id text primary key,
  type text not null check (type in ('photo', 'video')) default 'photo',
  media_url text not null,
  poster_url text,
  cat text not null default 'street',
  cat_label text not null default 'STREET & PELOTON',
  date_stamp text not null default '2026',
  location text not null default 'JAKARTA',
  title text not null,
  caption text not null,
  tilt text not null default '-1deg',
  tape_rot text not null default '-2deg',
  tape_class text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 6. MERCHANDISE (PEDALPOL SUPPLY)
create table if not exists public.merch_items (
  id text primary key,
  cat text not null default 'apparel',
  status text not null default 'READY STOCK',
  status_bg text not null default '#92FA66',
  status_fg text not null default '#14101C',
  sold_out boolean not null default false,
  title text not null,
  price text not null,
  sizes jsonb not null default '["All Size"]'::jsonb,
  impact_note text not null default '',
  description text not null,
  art_key text not null default 'jersey-sporty',
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 7. KIRIMAN CERITA PEMBACA (ANTREAN REVIEW ADMIN -> TERBIT KE ZINE)
create table if not exists public.story_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  cat text not null default 'cerita',
  body text not null,
  status text not null check (status in ('pending', 'published', 'archived')) default 'pending',
  created_at timestamptz not null default now()
);

-- 8. INBOX KOLABORASI BRAND & UNDANGAN KOMUNITAS
create table if not exists public.collab_inquiries (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  brand_name text not null,
  contact text not null default '',
  message text not null,
  status text not null check (status in ('new', 'contacted', 'done')) default 'new',
  created_at timestamptz not null default now()
);

-- 9. PENGATURAN UMUM WEBSITE (WHATSAPP ADMIN, COUNTER POHON, DLL)
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value)
values
  ('whatsapp_admin', '6281234567890'),
  ('tree_count', '25')
on conflict (key) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Server Next.js menggunakan SUPABASE_SERVICE_ROLE_KEY untuk semua mutasi &
-- kontrol anti-spam, sehingga publik cukup read-only pada data katalog publik.
-- ============================================================================
alter table public.rides enable row level security;
alter table public.ride_riders enable row level security;
alter table public.ride_feedbacks enable row level security;
alter table public.articles enable row level security;
alter table public.doc_items enable row level security;
alter table public.merch_items enable row level security;
alter table public.story_submissions enable row level security;
alter table public.collab_inquiries enable row level security;
alter table public.site_settings enable row level security;

create policy "Public read rides" on public.rides for select using (true);
create policy "Public read ride_riders" on public.ride_riders for select using (true);
create policy "Public read ride_feedbacks" on public.ride_feedbacks for select using (true);
create policy "Public read published articles" on public.articles for select using (published = true);
create policy "Public read doc_items" on public.doc_items for select using (true);
create policy "Public read merch_items" on public.merch_items for select using (true);

-- ============================================================================
-- STORAGE BUCKET UNTUK UPLOAD FOTO & VIDEO DARI PANEL ADMIN
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('docs', 'docs', true)
on conflict (id) do nothing;

create policy "Public read docs storage"
on storage.objects for select
using (bucket_id = 'docs');
