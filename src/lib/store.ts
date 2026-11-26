import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { INITIAL_DB } from "@/data/seed";
import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  Article,
  ArticleCategory,
  CollabInquiry,
  DatabaseState,
  DocCategory,
  DocItem,
  MerchCategory,
  MerchItem,
  Ride,
  RideBrosur,
  RideCategory,
  RideFeedback,
  RideRider,
  RideStatus,
  SiteSettings,
  StorySubmission,
} from "@/lib/types";

const LOCAL_DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "pedalpol-db.json")
  : path.join(process.cwd(), "data", "pedalpol-db.json");

let memoryFallbackDb: DatabaseState | null = null;

function cloneSeed(): DatabaseState {
  return JSON.parse(JSON.stringify(INITIAL_DB)) as DatabaseState;
}

async function readLocalDb(): Promise<DatabaseState> {
  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as DatabaseState;
    memoryFallbackDb = parsed;
    return parsed;
  } catch {
    if (memoryFallbackDb) return memoryFallbackDb;
    const fresh = cloneSeed();
    memoryFallbackDb = fresh;
    await writeLocalDb(fresh).catch(() => {});
    return fresh;
  }
}

async function writeLocalDb(db: DatabaseState): Promise<void> {
  memoryFallbackDb = db;
  try {
    await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
    const tmp = `${LOCAL_DB_PATH}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, LOCAL_DB_PATH);
  } catch {
    // Serverless read-only fallback: keep state in memoryFallbackDb
  }
}

export function getStorageMode(): "supabase" | "local" {
  return getSupabaseAdmin() ? "supabase" : "local";
}

export function sanitizeRideForViewer(
  ride: Ride,
  viewerTokenHash: string | null
): Ride {
  return {
    ...ride,
    riders: ride.riders.map((r) => ({
      id: r.id,
      rideId: r.rideId,
      name: r.name,
      bike: r.bike,
      note: r.note,
      isMe: Boolean(viewerTokenHash && r.deviceToken === viewerTokenHash),
      checkedIn: r.checkedIn,
      createdAt: r.createdAt,
    })),
  };
}

export async function listRidesForViewer(
  viewerTokenHash: string | null
): Promise<Ride[]> {
  const rides = await listRides();
  return rides.map((ride) => sanitizeRideForViewer(ride, viewerTokenHash));
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || `item-${Date.now()}`
  );
}

const RUBRIK_MAP: Record<ArticleCategory, { rubrik: string; bg: string; fg: string }> = {
  cerita: { rubrik: "CERITA JALAN", bg: "#14101C", fg: "#92FA66" },
  ngelayap: { rubrik: "CATATAN NGELAYAP", bg: "#8E47EE", fg: "#FFFFFF" },
  budaya: { rubrik: "SKENA & BUDAYA", bg: "#FF5B37", fg: "#FFFFFF" },
  bikecheck: { rubrik: "BIKE CHECK", bg: "#92FA66", fg: "#14101C" },
  impact: { rubrik: "PEDAL FOR IMPACT", bg: "#176B3F", fg: "#92FA66" },
};

// ============================================================================
// RIDES
// ============================================================================
export async function listRides(): Promise<Ride[]> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    return [...db.rides].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const [{ data: rides }, { data: riders }, { data: feedbacks }] = await Promise.all([
    sb.from("rides").select("*").order("sort_order", { ascending: true }),
    sb.from("ride_riders").select("*").order("created_at", { ascending: false }),
    sb.from("ride_feedbacks").select("*").order("created_at", { ascending: false }),
  ]);

  if (!rides || rides.length === 0) {
    return INITIAL_DB.rides;
  }

  const ridersByRide = new Map<string, RideRider[]>();
  for (const r of riders || []) {
    const list = ridersByRide.get(r.ride_id) || [];
    list.push({
      id: r.id,
      rideId: r.ride_id,
      name: r.name,
      bike: r.bike,
      note: r.note || undefined,
      deviceToken: r.device_token,
      checkedIn: Boolean(r.checked_in),
      createdAt: r.created_at,
    });
    ridersByRide.set(r.ride_id, list);
  }

  const fbByRide = new Map<string, RideFeedback[]>();
  for (const f of feedbacks || []) {
    const list = fbByRide.get(f.ride_id) || [];
    list.push({
      id: f.id,
      rideId: f.ride_id,
      author: f.author,
      tag: f.tag,
      note: f.note,
      createdAt: f.created_at,
    });
    fbByRide.set(f.ride_id, list);
  }

  return rides.map((row) => ({
    id: row.id,
    status: row.status as RideStatus,
    category: row.category as RideCategory,
    badge: row.badge,
    dateBadge: row.date_badge,
    title: row.title,
    schedule: row.schedule,
    tikum: row.tikum,
    distance: row.distance,
    bikes: row.bikes,
    pace: row.pace,
    accentBg: row.accent_bg,
    accentText: row.accent_text,
    highlight: row.highlight,
    elevation: Array.isArray(row.elevation) ? row.elevation : [10, 14, 12, 18, 15, 22, 16, 12, 10],
    ridersAttended: row.riders_attended || undefined,
    zineSlug: row.zine_slug || undefined,
    sortOrder: row.sort_order ?? 0,
    brosur: {
      isCollab: Boolean(row.is_collab),
      cardPerk: row.brosur_card_perk || "",
      quota: row.brosur_quota || "",
      points: Array.isArray(row.brosur_points) ? row.brosur_points : [],
      giveback: row.brosur_giveback || "",
      prompt: row.brosur_prompt || "",
    },
    riders: ridersByRide.get(row.id) || [],
    feedbacks: fbByRide.get(row.id) || [],
  }));
}

export async function createRide(input: {
  title: string;
  status?: RideStatus;
  category: RideCategory;
  dateBadge: string;
  schedule: string;
  tikum: string;
  distance: string;
  bikes: string;
  pace: string;
  highlight: string;
  ridersAttended?: string;
  zineSlug?: string;
  brosur: Partial<RideBrosur>;
}): Promise<Ride> {
  const id = `${slugify(input.title)}-${Date.now().toString(36).slice(-4)}`;
  const status: RideStatus = input.status || "upcoming";
  const accentMap: Record<RideCategory, { bg: string; fg: string; label: string }> = {
    rabo: { bg: "#14101C", fg: "#92FA66", label: "RABOO-RABOO" },
    sporty: { bg: "#8E47EE", fg: "#FFFFFF", label: "SPORTY & BRICK" },
    sunday: { bg: "#92FA66", fg: "#14101C", label: "SUNDAY POL" },
    ngelayap: { bg: "#176B3F", fg: "#92FA66", label: "NGELAYAP" },
    collab: { bg: "#FF5B37", fg: "#FFFFFF", label: "STROLLING COLLAB" },
  };
  const style = accentMap[input.category] || accentMap.rabo;

  const newRide: Ride = {
    id,
    status,
    category: input.category,
    badge: `${status === "upcoming" ? "UPCOMING" : "ARSIP BULETIN"} • ${style.label}`,
    dateBadge: input.dateBadge.toUpperCase(),
    title: input.title,
    schedule: input.schedule,
    tikum: input.tikum,
    distance: input.distance,
    bikes: input.bikes || "All Bikes Welcome",
    pace: input.pace || "Santai / Sosial",
    accentBg: style.bg,
    accentText: style.fg,
    highlight: input.highlight,
    elevation: [10, 15, 14, 20, 18, 24, 16, 13, 10],
    ridersAttended: input.ridersAttended,
    zineSlug: input.zineSlug,
    sortOrder: 0,
    brosur: {
      isCollab: Boolean(input.brosur.isCollab),
      cardPerk: input.brosur.cardPerk || "📸 Docs @bike2ngonten • Road Captain & Sweeper",
      quota: input.brosur.quota || "Terbuka untuk Semua Pesepeda",
      points:
        input.brosur.points && input.brosur.points.length > 0
          ? input.brosur.points
          : [
              "🛡 Road Captain & Sweeper (aman untuk pemula)",
              "📸 Dokumentasi foto & Reels bareng @bike2ngonten",
            ],
      giveback:
        input.brosur.giveback ||
        "Jaga barisan tertib ala @bikebaik.dijalan & tag @pedalpol saat share Story!",
      prompt: input.brosur.prompt || "Catatan tambahan (opsional)",
    },
    riders: [],
    feedbacks: [],
  };

  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    db.rides.unshift(newRide);
    await writeLocalDb(db);
    return newRide;
  }

  const { error } = await sb.from("rides").insert({
    id: newRide.id,
    status: newRide.status,
    category: newRide.category,
    badge: newRide.badge,
    date_badge: newRide.dateBadge,
    title: newRide.title,
    schedule: newRide.schedule,
    tikum: newRide.tikum,
    distance: newRide.distance,
    bikes: newRide.bikes,
    pace: newRide.pace,
    accent_bg: newRide.accentBg,
    accent_text: newRide.accentText,
    highlight: newRide.highlight,
    elevation: newRide.elevation,
    riders_attended: newRide.ridersAttended || null,
    zine_slug: newRide.zineSlug || null,
    is_collab: newRide.brosur.isCollab,
    brosur_card_perk: newRide.brosur.cardPerk,
    brosur_quota: newRide.brosur.quota,
    brosur_points: newRide.brosur.points,
    brosur_giveback: newRide.brosur.giveback,
    brosur_prompt: newRide.brosur.prompt,
    sort_order: 0,
  });
  if (error) throw new Error(error.message);
  return newRide;
}

export async function updateRide(
  id: string,
  patch: Partial<{
    status: RideStatus;
    category: RideCategory;
    dateBadge: string;
    title: string;
    schedule: string;
    tikum: string;
    distance: string;
    bikes: string;
    pace: string;
    highlight: string;
    ridersAttended: string;
    zineSlug: string;
    brosur: Partial<RideBrosur>;
  }>
): Promise<Ride | null> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const ride = db.rides.find((r) => r.id === id);
    if (!ride) return null;
    if (patch.status) {
      ride.status = patch.status;
      ride.badge = ride.badge.replace(
        /^(UPCOMING|ARSIP BULETIN)/,
        patch.status === "upcoming" ? "UPCOMING" : "ARSIP BULETIN"
      );
    }
    if (patch.category) ride.category = patch.category;
    if (patch.dateBadge !== undefined) ride.dateBadge = patch.dateBadge;
    if (patch.title !== undefined) ride.title = patch.title;
    if (patch.schedule !== undefined) ride.schedule = patch.schedule;
    if (patch.tikum !== undefined) ride.tikum = patch.tikum;
    if (patch.distance !== undefined) ride.distance = patch.distance;
    if (patch.bikes !== undefined) ride.bikes = patch.bikes;
    if (patch.pace !== undefined) ride.pace = patch.pace;
    if (patch.highlight !== undefined) ride.highlight = patch.highlight;
    if (patch.ridersAttended !== undefined) ride.ridersAttended = patch.ridersAttended;
    if (patch.zineSlug !== undefined) ride.zineSlug = patch.zineSlug;
    if (patch.brosur) {
      ride.brosur = { ...ride.brosur, ...patch.brosur };
    }
    await writeLocalDb(db);
    return ride;
  }

  const updateRow: Record<string, unknown> = {};
  if (patch.status !== undefined) updateRow.status = patch.status;
  if (patch.category !== undefined) updateRow.category = patch.category;
  if (patch.dateBadge !== undefined) updateRow.date_badge = patch.dateBadge;
  if (patch.title !== undefined) updateRow.title = patch.title;
  if (patch.schedule !== undefined) updateRow.schedule = patch.schedule;
  if (patch.tikum !== undefined) updateRow.tikum = patch.tikum;
  if (patch.distance !== undefined) updateRow.distance = patch.distance;
  if (patch.bikes !== undefined) updateRow.bikes = patch.bikes;
  if (patch.pace !== undefined) updateRow.pace = patch.pace;
  if (patch.highlight !== undefined) updateRow.highlight = patch.highlight;
  if (patch.ridersAttended !== undefined) updateRow.riders_attended = patch.ridersAttended;
  if (patch.zineSlug !== undefined) updateRow.zine_slug = patch.zineSlug;
  if (patch.brosur) {
    if (patch.brosur.isCollab !== undefined) updateRow.is_collab = patch.brosur.isCollab;
    if (patch.brosur.cardPerk !== undefined) updateRow.brosur_card_perk = patch.brosur.cardPerk;
    if (patch.brosur.quota !== undefined) updateRow.brosur_quota = patch.brosur.quota;
    if (patch.brosur.points !== undefined) updateRow.brosur_points = patch.brosur.points;
    if (patch.brosur.giveback !== undefined) updateRow.brosur_giveback = patch.brosur.giveback;
    if (patch.brosur.prompt !== undefined) updateRow.brosur_prompt = patch.brosur.prompt;
  }

  const { error } = await sb.from("rides").update(updateRow).eq("id", id);
  if (error) throw new Error(error.message);
  const all = await listRides();
  return all.find((r) => r.id === id) || null;
}

export async function deleteRide(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const before = db.rides.length;
    db.rides = db.rides.filter((r) => r.id !== id);
    if (db.rides.length === before) return false;
    await writeLocalDb(db);
    return true;
  }
  const { error } = await sb.from("rides").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function joinRide(input: {
  rideId: string;
  name: string;
  bike: string;
  note?: string;
  deviceToken: string;
  ipHash: string;
}): Promise<{ rider: RideRider; alreadyJoined: boolean }> {
  const cleanName = input.name.trim().slice(0, 60);
  const cleanBike = input.bike.trim().slice(0, 40) || "Fixie";
  const cleanNote = input.note?.trim().slice(0, 220) || undefined;

  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const ride = db.rides.find((r) => r.id === input.rideId);
    if (!ride) throw new Error("Agenda tidak ditemukan.");

    const existing = ride.riders.find(
      (r) =>
        r.deviceToken === input.deviceToken ||
        r.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existing) {
      existing.name = cleanName;
      existing.bike = cleanBike;
      existing.note = cleanNote;
      await writeLocalDb(db);
      return { rider: existing, alreadyJoined: true };
    }

    const rider: RideRider = {
      id: `rdr-${crypto.randomUUID().slice(0, 8)}`,
      rideId: input.rideId,
      name: cleanName,
      bike: cleanBike,
      note: cleanNote,
      deviceToken: input.deviceToken,
      checkedIn: false,
      createdAt: new Date().toISOString(),
    };
    ride.riders.unshift(rider);
    await writeLocalDb(db);
    return { rider, alreadyJoined: false };
  }

  const { data: existing } = await sb
    .from("ride_riders")
    .select("*")
    .eq("ride_id", input.rideId)
    .eq("device_token", input.deviceToken)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await sb
      .from("ride_riders")
      .update({ name: cleanName, bike: cleanBike, note: cleanNote || null })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return {
      rider: {
        id: updated.id,
        rideId: updated.ride_id,
        name: updated.name,
        bike: updated.bike,
        note: updated.note || undefined,
        deviceToken: updated.device_token,
        checkedIn: Boolean(updated.checked_in),
        createdAt: updated.created_at,
      },
      alreadyJoined: true,
    };
  }

  const { data: inserted, error } = await sb
    .from("ride_riders")
    .insert({
      ride_id: input.rideId,
      name: cleanName,
      bike: cleanBike,
      note: cleanNote || null,
      device_token: input.deviceToken,
      ip_hash: input.ipHash,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return {
    rider: {
      id: inserted.id,
      rideId: inserted.ride_id,
      name: inserted.name,
      bike: inserted.bike,
      note: inserted.note || undefined,
      deviceToken: inserted.device_token,
      checkedIn: Boolean(inserted.checked_in),
      createdAt: inserted.created_at,
    },
    alreadyJoined: false,
  };
}

export async function leaveRide(rideId: string, deviceToken: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const ride = db.rides.find((r) => r.id === rideId);
    if (!ride) return false;
    const before = ride.riders.length;
    ride.riders = ride.riders.filter((r) => r.deviceToken !== deviceToken);
    if (ride.riders.length === before) return false;
    await writeLocalDb(db);
    return true;
  }
  const { error } = await sb
    .from("ride_riders")
    .delete()
    .eq("ride_id", rideId)
    .eq("device_token", deviceToken);
  if (error) throw new Error(error.message);
  return true;
}

export async function toggleRiderCheckIn(
  rideId: string,
  riderId: string,
  checkedIn: boolean
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const ride = db.rides.find((r) => r.id === rideId);
    const rider = ride?.riders.find((r) => r.id === riderId);
    if (!rider) return false;
    rider.checkedIn = checkedIn;
    await writeLocalDb(db);
    return true;
  }
  const { error } = await sb
    .from("ride_riders")
    .update({ checked_in: checkedIn })
    .eq("id", riderId)
    .eq("ride_id", rideId);
  if (error) throw new Error(error.message);
  return true;
}

export async function addRideFeedback(input: {
  rideId: string;
  author: string;
  tag: string;
  note: string;
}): Promise<RideFeedback> {
  const fb: RideFeedback = {
    id: `fb-${crypto.randomUUID().slice(0, 8)}`,
    rideId: input.rideId,
    author: input.author.trim().slice(0, 60),
    tag: input.tag.trim().slice(0, 40),
    note: input.note.trim().slice(0, 320),
    createdAt: new Date().toISOString(),
  };

  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const ride = db.rides.find((r) => r.id === input.rideId);
    if (!ride) throw new Error("Agenda tidak ditemukan.");
    ride.feedbacks.unshift(fb);
    await writeLocalDb(db);
    return fb;
  }

  const { data, error } = await sb
    .from("ride_feedbacks")
    .insert({
      ride_id: fb.rideId,
      author: fb.author,
      tag: fb.tag,
      note: fb.note,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    rideId: data.ride_id,
    author: data.author,
    tag: data.tag,
    note: data.note,
    createdAt: data.created_at,
  };
}

// ============================================================================
// ARTICLES (ZINE)
// ============================================================================
export async function listArticles(): Promise<Article[]> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    return db.articles.filter((a) => a.published);
  }
  const { data } = await sb
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) return INITIAL_DB.articles;

  return data.map((row) => ({
    slug: row.slug,
    cat: row.cat as ArticleCategory,
    rubrik: row.rubrik,
    tagBg: row.tag_bg,
    tagFg: row.tag_fg,
    dateLabel: row.date_label,
    readTime: row.read_time,
    author: row.author,
    bikeTag: row.bike_tag,
    location: row.location,
    distance: row.distance,
    applause: row.applause ?? 1,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    quote: row.quote,
    coverKey: row.cover_key,
    coverImageUrl: row.cover_image_url || undefined,
    paragraphs: Array.isArray(row.paragraphs) ? row.paragraphs : [],
    published: Boolean(row.published),
    createdAt: row.created_at,
  }));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const all = await listArticles();
  return all.find((a) => a.slug === slug) || null;
}

export async function createArticle(input: {
  title: string;
  subtitle?: string;
  author: string;
  cat: ArticleCategory;
  location?: string;
  distance?: string;
  bikeTag?: string;
  quote?: string;
  coverImageUrl?: string;
  paragraphs: string[];
}): Promise<Article> {
  const meta = RUBRIK_MAP[input.cat] || RUBRIK_MAP.cerita;
  const slug = `${slugify(input.title)}-${Date.now().toString(36).slice(-3)}`;
  const bodyFirst = input.paragraphs[0] || "";
  const nowLabel = new Date()
    .toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  const article: Article = {
    slug,
    cat: input.cat,
    rubrik: meta.rubrik,
    tagBg: meta.bg,
    tagFg: meta.fg,
    dateLabel: nowLabel,
    readTime: `${Math.max(2, Math.ceil(input.paragraphs.join(" ").split(/\s+/).length / 150))} MNT BACA`,
    author: input.author.trim(),
    bikeTag: input.bikeTag?.trim() || "All Bikes Welcome",
    location: input.location?.trim() || "Jakarta",
    distance: input.distance?.trim() || "Cerita Komunitas",
    applause: 1,
    title: input.title.trim(),
    subtitle:
      input.subtitle?.trim() ||
      `Catatan perjalanan dari ${input.author.trim()} untuk seluruh pesepeda di Indonesia.`,
    excerpt: bodyFirst.slice(0, 155) + (bodyFirst.length > 155 ? "..." : ""),
    quote:
      input.quote?.trim() ||
      `“${bodyFirst.slice(0, 100)}${bodyFirst.length > 100 ? "..." : ""}”`,
    coverKey: input.cat === "impact" ? "for-rest-forest" : input.cat === "ngelayap" ? "ngelayap-95km" : input.cat === "budaya" ? "menyapa-museum" : input.cat === "bikecheck" ? "bikecheck-fixie-harian" : "rabo-rabo-terapi",
    coverImageUrl: input.coverImageUrl || undefined,
    paragraphs: input.paragraphs,
    published: true,
    createdAt: new Date().toISOString(),
  };

  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    db.articles.unshift(article);
    await writeLocalDb(db);
    return article;
  }

  const { error } = await sb.from("articles").insert({
    slug: article.slug,
    cat: article.cat,
    rubrik: article.rubrik,
    tag_bg: article.tagBg,
    tag_fg: article.tagFg,
    date_label: article.dateLabel,
    read_time: article.readTime,
    author: article.author,
    bike_tag: article.bikeTag,
    location: article.location,
    distance: article.distance,
    applause: article.applause,
    title: article.title,
    subtitle: article.subtitle,
    excerpt: article.excerpt,
    quote: article.quote,
    cover_key: article.coverKey,
    cover_image_url: article.coverImageUrl || null,
    paragraphs: article.paragraphs,
    published: true,
  });
  if (error) throw new Error(error.message);
  return article;
}

export async function deleteArticle(slug: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const before = db.articles.length;
    db.articles = db.articles.filter((a) => a.slug !== slug);
    if (db.articles.length === before) return false;
    await writeLocalDb(db);
    return true;
  }
  const { error } = await sb.from("articles").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  return true;
}

export async function incrementArticleApplause(slug: string): Promise<number> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const art = db.articles.find((a) => a.slug === slug);
    if (!art) throw new Error("Artikel tidak ditemukan.");
    art.applause += 1;
    await writeLocalDb(db);
    return art.applause;
  }

  const { data } = await sb
    .from("articles")
    .select("applause")
    .eq("slug", slug)
    .single();
  const nextCount = (data?.applause || 0) + 1;
  await sb.from("articles").update({ applause: nextCount }).eq("slug", slug);
  return nextCount;
}

// ============================================================================
// DOCS (PHOTO CONTACT SHEET & REELS)
// ============================================================================
export async function listDocItems(): Promise<DocItem[]> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    return [...db.docItems].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const { data } = await sb
    .from("doc_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!data || data.length === 0) return INITIAL_DB.docItems;

  return data.map((row) => ({
    id: row.id,
    type: row.type as "photo" | "video",
    mediaUrl: row.media_url,
    posterUrl: row.poster_url || undefined,
    cat: row.cat as DocCategory,
    catLabel: row.cat_label,
    dateStamp: row.date_stamp,
    location: row.location,
    title: row.title,
    caption: row.caption,
    tilt: row.tilt || "-1deg",
    tapeRot: row.tape_rot || "-2deg",
    tapeClass: row.tape_class || "",
    sortOrder: row.sort_order ?? 0,
  }));
}

export async function createDocItem(input: {
  type: "photo" | "video";
  mediaUrl: string;
  posterUrl?: string;
  cat: DocCategory;
  location: string;
  dateStamp: string;
  title: string;
  caption: string;
}): Promise<DocItem> {
  const catLabelMap: Record<DocCategory, string> = {
    street: "STREET & PELOTON",
    hangout: "HANGOUT & KAFE",
    collab: "BRAND ACTIVATION",
  };
  const tilts = ["-1.2deg", "1.1deg", "-0.9deg", "1.3deg"];
  const item: DocItem = {
    id: `doc-${Date.now().toString(36)}`,
    type: input.type,
    mediaUrl: input.mediaUrl,
    posterUrl: input.posterUrl,
    cat: input.cat,
    catLabel: input.type === "video" ? "VIDEO REELS" : catLabelMap[input.cat] || "STREET & PELOTON",
    dateStamp: input.dateStamp.toUpperCase() || "2026",
    location: input.location.toUpperCase() || "JAKARTA",
    title: input.title.trim(),
    caption: input.caption.trim(),
    tilt: tilts[Math.floor(Math.random() * tilts.length)],
    tapeRot: Math.random() > 0.5 ? "-2.4deg" : "2.2deg",
    tapeClass: Math.random() > 0.5 ? "tape-paper" : "",
    sortOrder: 0,
  };

  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    db.docItems.unshift(item);
    await writeLocalDb(db);
    return item;
  }

  const { error } = await sb.from("doc_items").insert({
    id: item.id,
    type: item.type,
    media_url: item.mediaUrl,
    poster_url: item.posterUrl || null,
    cat: item.cat,
    cat_label: item.catLabel,
    date_stamp: item.dateStamp,
    location: item.location,
    title: item.title,
    caption: item.caption,
    tilt: item.tilt,
    tape_rot: item.tapeRot,
    tape_class: item.tapeClass,
    sort_order: 0,
  });
  if (error) throw new Error(error.message);
  return item;
}

export async function deleteDocItem(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const before = db.docItems.length;
    db.docItems = db.docItems.filter((d) => d.id !== id);
    if (db.docItems.length === before) return false;
    await writeLocalDb(db);
    return true;
  }
  const { error } = await sb.from("doc_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

// ============================================================================
// MERCH
// ============================================================================
export async function listMerchItems(): Promise<MerchItem[]> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    return [...db.merchItems].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const { data } = await sb
    .from("merch_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!data || data.length === 0) return INITIAL_DB.merchItems;

  return data.map((row) => ({
    id: row.id,
    cat: row.cat as MerchCategory,
    status: row.status,
    statusBg: row.status_bg,
    statusFg: row.status_fg,
    soldOut: Boolean(row.sold_out),
    title: row.title,
    price: row.price,
    sizes: Array.isArray(row.sizes) ? row.sizes : ["All Size"],
    impactNote: row.impact_note || "",
    description: row.description,
    artKey: row.art_key,
    imageUrl: row.image_url || undefined,
    sortOrder: row.sort_order ?? 0,
  }));
}

export async function createMerchItem(input: {
  title: string;
  cat: MerchCategory;
  status: string;
  soldOut?: boolean;
  price: string;
  sizes: string[];
  impactNote: string;
  description: string;
  imageUrl?: string;
}): Promise<MerchItem> {
  const soldOut = Boolean(input.soldOut);
  const item: MerchItem = {
    id: `${slugify(input.title)}-${Date.now().toString(36).slice(-3)}`,
    cat: soldOut ? "archive" : input.cat,
    status: input.status.toUpperCase() || (soldOut ? "SOLD OUT" : "READY STOCK"),
    statusBg: soldOut ? "#14101C" : input.status.toUpperCase().includes("PO") ? "#8E47EE" : "#92FA66",
    statusFg: soldOut || input.status.toUpperCase().includes("PO") ? "#FFFFFF" : "#14101C",
    soldOut,
    title: input.title.trim(),
    price: input.price.trim(),
    sizes: input.sizes.length ? input.sizes : ["All Size"],
    impactNote: input.impactNote.trim(),
    description: input.description.trim(),
    artKey: "jersey-sporty",
    imageUrl: input.imageUrl,
    sortOrder: 0,
  };

  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    db.merchItems.unshift(item);
    await writeLocalDb(db);
    return item;
  }

  const { error } = await sb.from("merch_items").insert({
    id: item.id,
    cat: item.cat,
    status: item.status,
    status_bg: item.statusBg,
    status_fg: item.statusFg,
    sold_out: item.soldOut,
    title: item.title,
    price: item.price,
    sizes: item.sizes,
    impact_note: item.impactNote,
    description: item.description,
    art_key: item.artKey,
    image_url: item.imageUrl || null,
    sort_order: 0,
  });
  if (error) throw new Error(error.message);
  return item;
}

export async function updateMerchItem(
  id: string,
  patch: Partial<{ soldOut: boolean; status: string; price: string; title: string }>
): Promise<MerchItem | null> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const item = db.merchItems.find((m) => m.id === id);
    if (!item) return null;
    if (patch.soldOut !== undefined) {
      item.soldOut = patch.soldOut;
      item.status = patch.soldOut ? "SOLD OUT • ARCHIVE" : "READY STOCK";
      item.statusBg = patch.soldOut ? "#14101C" : "#92FA66";
      item.statusFg = patch.soldOut ? "#F5F0E6" : "#14101C";
    }
    if (patch.status !== undefined) item.status = patch.status;
    if (patch.price !== undefined) item.price = patch.price;
    if (patch.title !== undefined) item.title = patch.title;
    await writeLocalDb(db);
    return item;
  }

  const row: Record<string, unknown> = {};
  if (patch.soldOut !== undefined) {
    row.sold_out = patch.soldOut;
    row.status = patch.soldOut ? "SOLD OUT • ARCHIVE" : "READY STOCK";
    row.status_bg = patch.soldOut ? "#14101C" : "#92FA66";
    row.status_fg = patch.soldOut ? "#F5F0E6" : "#14101C";
  }
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.price !== undefined) row.price = patch.price;
  if (patch.title !== undefined) row.title = patch.title;

  const { error } = await sb.from("merch_items").update(row).eq("id", id);
  if (error) throw new Error(error.message);
  const all = await listMerchItems();
  return all.find((m) => m.id === id) || null;
}

export async function deleteMerchItem(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const before = db.merchItems.length;
    db.merchItems = db.merchItems.filter((m) => m.id !== id);
    if (db.merchItems.length === before) return false;
    await writeLocalDb(db);
    return true;
  }
  const { error } = await sb.from("merch_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

// ============================================================================
// STORY SUBMISSIONS & COLLAB INQUIRIES
// ============================================================================
export async function listStorySubmissions(): Promise<StorySubmission[]> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    return db.storySubmissions;
  }
  const { data } = await sb
    .from("story_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    cat: row.cat as ArticleCategory,
    body: row.body,
    status: row.status as StorySubmission["status"],
    createdAt: row.created_at,
  }));
}

export async function createStorySubmission(input: {
  title: string;
  author: string;
  cat: ArticleCategory;
  body: string;
}): Promise<StorySubmission> {
  const sub: StorySubmission = {
    id: `sub-${crypto.randomUUID().slice(0, 8)}`,
    title: input.title.trim().slice(0, 140),
    author: input.author.trim().slice(0, 60),
    cat: input.cat,
    body: input.body.trim().slice(0, 5000),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    db.storySubmissions.unshift(sub);
    await writeLocalDb(db);
    return sub;
  }

  const { data, error } = await sb
    .from("story_submissions")
    .insert({
      title: sub.title,
      author: sub.author,
      cat: sub.cat,
      body: sub.body,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    title: data.title,
    author: data.author,
    cat: data.cat as ArticleCategory,
    body: data.body,
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function updateStorySubmissionStatus(
  id: string,
  status: "published" | "archived"
): Promise<{ submission: StorySubmission; article?: Article } | null> {
  const subs = await listStorySubmissions();
  const target = subs.find((s) => s.id === id);
  if (!target) return null;

  let publishedArticle: Article | undefined;
  if (status === "published" && target.status !== "published") {
    const paragraphs = target.body
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    publishedArticle = await createArticle({
      title: target.title,
      author: target.author,
      cat: target.cat,
      paragraphs: paragraphs.length ? paragraphs : [target.body],
    });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const item = db.storySubmissions.find((s) => s.id === id);
    if (!item) return null;
    item.status = status;
    await writeLocalDb(db);
    return { submission: item, article: publishedArticle };
  }

  const { error } = await sb
    .from("story_submissions")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { submission: { ...target, status }, article: publishedArticle };
}

export async function listCollabInquiries(): Promise<CollabInquiry[]> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    return db.collabInquiries;
  }
  const { data } = await sb
    .from("collab_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return (data || []).map((row) => ({
    id: row.id,
    topic: row.topic,
    brandName: row.brand_name,
    contact: row.contact || "",
    message: row.message,
    status: row.status as CollabInquiry["status"],
    createdAt: row.created_at,
  }));
}

export async function createCollabInquiry(input: {
  topic: string;
  brandName: string;
  contact: string;
  message: string;
}): Promise<CollabInquiry> {
  const inq: CollabInquiry = {
    id: `inq-${crypto.randomUUID().slice(0, 8)}`,
    topic: input.topic.trim().slice(0, 100),
    brandName: input.brandName.trim().slice(0, 100),
    contact: input.contact.trim().slice(0, 120),
    message: input.message.trim().slice(0, 2000),
    status: "new",
    createdAt: new Date().toISOString(),
  };

  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    db.collabInquiries.unshift(inq);
    await writeLocalDb(db);
    return inq;
  }

  const { data, error } = await sb
    .from("collab_inquiries")
    .insert({
      topic: inq.topic,
      brand_name: inq.brandName,
      contact: inq.contact,
      message: inq.message,
      status: "new",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    topic: data.topic,
    brandName: data.brand_name,
    contact: data.contact,
    message: data.message,
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function updateCollabInquiryStatus(
  id: string,
  status: CollabInquiry["status"]
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    const item = db.collabInquiries.find((i) => i.id === id);
    if (!item) return false;
    item.status = status;
    await writeLocalDb(db);
    return true;
  }
  const { error } = await sb
    .from("collab_inquiries")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

// ============================================================================
// SITE SETTINGS (WHATSAPP ADMIN & TREE SIMULATOR COUNTER)
// ============================================================================
export async function getSiteSettings(): Promise<SiteSettings> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    return db.settings;
  }
  const { data } = await sb.from("site_settings").select("*");
  const map = new Map<string, string>((data || []).map((r) => [r.key, r.value]));
  return {
    whatsappAdmin:
      map.get("whatsapp_admin") ||
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
      "6281234567890",
    treeCount: Number(map.get("tree_count") || 25),
  };
}

export async function updateSiteSettings(
  patch: Partial<SiteSettings>
): Promise<SiteSettings> {
  const sb = getSupabaseAdmin();
  if (!sb) {
    const db = await readLocalDb();
    db.settings = { ...db.settings, ...patch };
    await writeLocalDb(db);
    return db.settings;
  }
  const upserts: Array<{ key: string; value: string }> = [];
  if (patch.whatsappAdmin !== undefined) {
    upserts.push({ key: "whatsapp_admin", value: patch.whatsappAdmin });
  }
  if (patch.treeCount !== undefined) {
    upserts.push({ key: "tree_count", value: String(patch.treeCount) });
  }
  if (upserts.length) {
    await sb.from("site_settings").upsert(upserts);
  }
  return getSiteSettings();
}

export async function plantCommunityTrees(amount: number): Promise<number> {
  const safeAmount = Math.max(1, Math.min(5, Math.floor(amount)));
  const current = await getSiteSettings();
  const updated = await updateSiteSettings({
    treeCount: current.treeCount + safeAmount,
  });
  return updated.treeCount;
}
