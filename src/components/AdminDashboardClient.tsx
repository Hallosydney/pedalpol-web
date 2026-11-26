"use client";

import { useState } from "react";
import type {
  Article,
  ArticleCategory,
  CollabInquiry,
  DocCategory,
  DocItem,
  MerchCategory,
  MerchItem,
  Ride,
  RideCategory,
  SiteSettings,
  StorySubmission,
} from "@/lib/types";
import { sanitizeCsvCell } from "@/lib/validation";

type AdminTab = "agenda" | "zine" | "docs" | "merch" | "inbox";

interface AdminProps {
  initialAuthenticated: boolean;
  storageMode: "supabase" | "local";
  usingDefaultSecurity: boolean;
  initialRides: Ride[];
  initialArticles: Article[];
  initialDocs: DocItem[];
  initialMerch: MerchItem[];
  initialSubmissions: StorySubmission[];
  initialInquiries: CollabInquiry[];
  initialSettings: SiteSettings;
}

export function AdminDashboardClient({
  initialAuthenticated,
  storageMode,
  usingDefaultSecurity,
  initialRides,
  initialArticles,
  initialDocs,
  initialMerch,
  initialSubmissions,
  initialInquiries,
  initialSettings,
}: AdminProps) {
  const [authed, setAuthed] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [tab, setTab] = useState<AdminTab>("agenda");
  const [toast, setToast] = useState<string | null>(null);

  const [rides, setRides] = useState<Ride[]>(initialRides);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [merch, setMerch] = useState<MerchItem[]>(initialMerch);
  const [submissions, setSubmissions] = useState<StorySubmission[]>(initialSubmissions);
  const [inquiries, setInquiries] = useState<CollabInquiry[]>(initialInquiries);

  // Selected ride for Brosur editing or Riders CSV/Check-in
  const [editingRideId, setEditingRideId] = useState<string | null>(null);
  const [viewingRidersRideId, setViewingRidersRideId] = useState<string | null>(null);

  // New ride form state
  const [nrTitle, setNrTitle] = useState("");
  const [nrCat, setNrCat] = useState<RideCategory>("rabo");
  const [nrDateBadge, setNrDateBadge] = useState("");
  const [nrSchedule, setNrSchedule] = useState("");
  const [nrTikum, setNrTikum] = useState("Kawasan Menteng, Jakarta Pusat");
  const [nrDistance, setNrDistance] = useState("25 KM");
  const [nrPace, setNrPace] = useState("Santai / Sosial");
  const [nrHighlight, setNrHighlight] = useState("");
  const [nrIsCollab, setNrIsCollab] = useState(false);
  const [nrCardPerk, setNrCardPerk] = useState("📸 Docs @bike2ngonten • Road Captain & Sweeper");
  const [nrQuota, setNrQuota] = useState("Gratis • Terbuka untuk Semua");
  const [nrPoints, setNrPoints] = useState(
    "🛡 Road Captain & Sweeper\n📸 Dokumentasi bareng @bike2ngonten\n☕ Titik finish ngopi bareng"
  );
  const [nrGiveback, setNrGiveback] = useState(
    "Jaga etika jalan bareng @bikebaik.dijalan & tag @pedalpol saat share Story!"
  );

  // New article form state
  const [naTitle, setNaTitle] = useState("");
  const [naAuthor, setNaAuthor] = useState("Tim Redaksi PedalPol");
  const [naCat, setNaCat] = useState<ArticleCategory>("cerita");
  const [naLocation, setNaLocation] = useState("Menteng, Jakarta Pusat");
  const [naBody, setNaBody] = useState("");

  // New doc form state
  const [ndType, setNdType] = useState<"photo" | "video">("photo");
  const [ndTitle, setNdTitle] = useState("");
  const [ndLocation, setNdLocation] = useState("JAKARTA");
  const [ndDateStamp, setNdDateStamp] = useState("NOV '26");
  const [ndCat, setNdCat] = useState<DocCategory>("street");
  const [ndCaption, setNdCaption] = useState("");
  const [ndUrl, setNdUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // New merch form state
  const [nmTitle, setNmTitle] = useState("");
  const [nmCat, setNmCat] = useState<MerchCategory>("apparel");
  const [nmPrice, setNmPrice] = useState("Rp 185.000");
  const [nmStatus, setNmStatus] = useState("READY STOCK");
  const [nmSizes, setNmSizes] = useState("M, L, XL");
  const [nmImpact, setNmImpact] = useState("Sebagian hasil mendukung For Rest Forest");
  const [nmDesc, setNmDesc] = useState("");

  // Settings form
  const [waInput, setWaInput] = useState(initialSettings.whatsappAdmin);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const refreshAll = async () => {
    const [rRes, aRes, dRes, mRes, sRes, iRes, setRes] = await Promise.all([
      fetch("/api/rides"),
      fetch("/api/articles"),
      fetch("/api/docs"),
      fetch("/api/merch"),
      fetch("/api/submissions"),
      fetch("/api/inquiries"),
      fetch("/api/settings"),
    ]);
    if (rRes.ok) setRides((await rRes.json()).rides || []);
    if (aRes.ok) setArticles((await aRes.json()).articles || []);
    if (dRes.ok) setDocs((await dRes.json()).docs || []);
    if (mRes.ok) setMerch((await mRes.json()).merch || []);
    if (sRes.ok) setSubmissions((await sRes.json()).submissions || []);
    if (iRes.ok) setInquiries((await iRes.json()).inquiries || []);
    if (setRes.ok) {
      const s = (await setRes.json()).settings;
      if (s?.whatsappAdmin) {
        setWaInput(s.whatsappAdmin);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login gagal.");
      setAuthed(true);
      setPassword("");
      await refreshAll();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  };

  // --- AGENDA ACTIONS ---
  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: nrTitle,
        category: nrCat,
        dateBadge: nrDateBadge || nrSchedule,
        schedule: nrSchedule,
        tikum: nrTikum,
        distance: nrDistance,
        pace: nrPace,
        highlight: nrHighlight,
        brosur: {
          isCollab: nrIsCollab,
          cardPerk: nrCardPerk,
          quota: nrQuota,
          points: nrPoints
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          giveback: nrGiveback,
        },
      }),
    });
    if (res.ok) {
      setNrTitle("");
      setNrDateBadge("");
      setNrSchedule("");
      setNrHighlight("");
      await refreshAll();
      notify("✓ Agenda baru & Informasi Brosur berhasil ditambahkan!");
    }
  };

  const handleToggleRideStatus = async (ride: Ride) => {
    const nextStatus = ride.status === "upcoming" ? "archive" : "upcoming";
    const res = await fetch(`/api/rides/${encodeURIComponent(ride.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        ridersAttended:
          nextStatus === "archive"
            ? `${ride.riders.length || 30} Riders`
            : undefined,
      }),
    });
    if (res.ok) {
      await refreshAll();
      notify(`✓ Status agenda diubah ke ${nextStatus.toUpperCase()}.`);
    }
  };

  const handleDeleteRide = async (id: string) => {
    const res = await fetch(`/api/rides/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      await refreshAll();
      notify("Agenda dihapus.");
    }
  };

  const handleSaveBrosur = async (rideId: string, form: HTMLFormElement) => {
    const fd = new FormData(form);
    const res = await fetch(`/api/rides/${encodeURIComponent(rideId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brosur: {
          isCollab: fd.get("isCollab") === "on",
          cardPerk: String(fd.get("cardPerk") || ""),
          quota: String(fd.get("quota") || ""),
          points: String(fd.get("points") || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          giveback: String(fd.get("giveback") || ""),
          prompt: String(fd.get("prompt") || ""),
        },
      }),
    });
    if (res.ok) {
      setEditingRideId(null);
      await refreshAll();
      notify("✓ Informasi Brosur berhasil diperbarui!");
    }
  };

  const handleToggleCheckIn = async (rideId: string, riderId: string, checkedIn: boolean) => {
    const res = await fetch(
      `/api/rides/${encodeURIComponent(rideId)}/riders/${encodeURIComponent(riderId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkedIn }),
      }
    );
    if (res.ok) {
      setRides((prev) =>
        prev.map((r) =>
          r.id === rideId
            ? {
                ...r,
                riders: r.riders.map((rd) =>
                  rd.id === riderId ? { ...rd, checkedIn } : rd
                ),
              }
            : r
        )
      );
    }
  };

  const exportRidersCsv = (ride: Ride) => {
    const header = ["No", "Nama / IG", "Jenis Sepeda", "Catatan", "Check-In", "Waktu Join"];
    const rows = ride.riders.map((r, i) => [
      String(i + 1),
      sanitizeCsvCell(r.name),
      sanitizeCsvCell(r.bike),
      sanitizeCsvCell(r.note || ""),
      r.checkedIn ? "SUDAH" : "BELUM",
      sanitizeCsvCell(r.createdAt),
    ]);
    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barisan-${ride.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- ZINE ACTIONS ---
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: naTitle,
        author: naAuthor,
        cat: naCat,
        location: naLocation,
        paragraphs: naBody,
      }),
    });
    if (res.ok) {
      setNaTitle("");
      setNaBody("");
      await refreshAll();
      notify("✓ Artikel Zine berhasil diterbitkan!");
    }
  };

  const handleReviewSubmission = async (id: string, status: "published" | "archived") => {
    const res = await fetch(`/api/submissions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await refreshAll();
      notify(
        status === "published"
          ? "✓ Cerita pembaca langsung terbit di Zine PedalPol!"
          : "Kiriman diarsipkan."
      );
    }
  };

  const handleDeleteArticle = async (slug: string) => {
    const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await refreshAll();
      notify("Artikel dihapus.");
    }
  };

  // --- DOC UPLOAD & CREATE ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload gagal.");
      setNdUrl(data.url);
      if (file.type.startsWith("video/")) setNdType("video");
      else setNdType("photo");
      notify(`✓ File berhasil di-upload (${data.storage})!`);
    } catch (err) {
      notify(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: ndType,
        title: ndTitle,
        location: ndLocation,
        dateStamp: ndDateStamp,
        cat: ndCat,
        caption: ndCaption,
        mediaUrl: ndUrl,
      }),
    });
    if (res.ok) {
      setNdTitle("");
      setNdCaption("");
      setNdUrl("");
      await refreshAll();
      notify("✓ Dokumentasi baru langsung tayang di Contact Sheet & Beranda!");
    }
  };

  const handleDeleteDoc = async (id: string) => {
    const res = await fetch(`/api/docs/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      await refreshAll();
      notify("Dokumentasi dihapus.");
    }
  };

  // --- MERCH & SETTINGS ---
  const handleCreateMerch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/merch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: nmTitle,
        cat: nmCat,
        price: nmPrice,
        status: nmStatus,
        sizes: nmSizes,
        impactNote: nmImpact,
        description: nmDesc,
      }),
    });
    if (res.ok) {
      setNmTitle("");
      setNmDesc("");
      await refreshAll();
      notify("✓ Produk Merch baru ditambahkan!");
    }
  };

  const handleToggleMerchSold = async (item: MerchItem) => {
    const res = await fetch(`/api/merch/${encodeURIComponent(item.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soldOut: !item.soldOut }),
    });
    if (res.ok) {
      await refreshAll();
      notify("✓ Status stok merch diperbarui.");
    }
  };

  const handleDeleteMerch = async (id: string) => {
    const res = await fetch(`/api/merch/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      await refreshAll();
      notify("Produk merch dihapus.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappAdmin: waInput }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.settings?.whatsappAdmin) setWaInput(data.settings.whatsappAdmin);
      notify("✓ Nomor WhatsApp Admin diperbarui!");
    }
  };

  // --- INQUIRY STATUS ---
  const handleInquiryStatus = async (id: string, status: CollabInquiry["status"]) => {
    const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await refreshAll();
      notify("✓ Status inbox diperbarui.");
    }
  };

  // LOGIN GATE
  if (!authed) {
    return (
      <section className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow-purple p-6 sm:p-8">
          <span className="font-stamp text-[11px] font-bold uppercase px-2.5 py-1 bg-[#14101C] text-[#92FA66] inline-block mb-3">
            🔒 PENGURUS PEDALPOL ONLY
          </span>
          <h1 className="font-poster text-4xl uppercase text-[#14101C] mb-2">
            PANEL ADMIN PEDALPOL
          </h1>
          <p className="text-xs text-[#362F42] mb-5">
            Masuk untuk kelola Agenda, Informasi Brosur dinamis, Export CSV Riders, Zine,
            Upload Foto/Reels, Merch, dan Inbox Kolab Brand.
          </p>
          {loginError && (
            <div className="mb-3 p-2.5 bg-[#FF5B37]/15 border-2 border-[#FF5B37] font-stamp text-xs">
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block font-stamp text-xs font-bold uppercase mb-1">
                Password Admin
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin..."
                className="w-full px-3 py-2.5 bg-white border-2 border-[#14101C] font-stamp text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loginBusy}
              className="w-full riso-shadow font-stamp text-xs font-bold uppercase px-5 py-3 bg-[#8E47EE] text-white border-2 border-[#14101C] disabled:opacity-50"
            >
              {loginBusy ? "Memverifikasi..." : "Masuk Dashboard Admin →"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  const viewingRide = rides.find((r) => r.id === viewingRidersRideId) || null;
  const pendingSubs = submissions.filter((s) => s.status === "pending").length;
  const newInquiries = inquiries.filter((i) => i.status === "new").length;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {toast && (
        <div className="fixed bottom-24 md:bottom-5 right-4 md:right-5 z-[140] px-4 py-3 bg-[#14101C] text-[#92FA66] border-2 border-[#92FA66] riso-shadow font-stamp text-xs font-bold">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="border-b-2 border-[#14101C] pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-stamp text-[10px] font-bold uppercase px-2 py-0.5 bg-[#92FA66] border border-[#14101C]">
              ADMIN CMS • ACTIVE
            </span>
            <span className="font-stamp text-[10px] font-bold uppercase px-2 py-0.5 bg-[#14101C] text-[#92FA66]">
              DB: {storageMode === "supabase" ? "SUPABASE POSTGRES" : "LOCAL JSON DEV"}
            </span>
          </div>
          <h1 className="font-poster text-4xl sm:text-5xl uppercase text-[#14101C]">
            CONTROL ROOM PEDALPOL
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="font-stamp text-xs font-bold uppercase px-4 py-2 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#14101C] hover:text-[#92FA66] w-fit"
        >
          Keluar Admin
        </button>
      </div>

      {usingDefaultSecurity && (
        <div className="mb-6 p-3.5 bg-[#FF5B37]/15 border-2 border-[#FF5B37] font-stamp text-xs text-[#14101C]">
          <strong>⚠ PENGINGAT KEAMANAN PRODUKSI:</strong> Panel Admin masih memakai
          password/secret default. Sebelum rilis ke publik, pastikan kamu sudah mengisi{" "}
          <code>ADMIN_PASSWORD</code>, <code>ADMIN_SESSION_SECRET</code>, dan{" "}
          <code>IP_HASH_SALT</code> di <strong>Vercel → Environment Variables</strong>.
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: "agenda", label: `⚡ Agenda & Brosur (${rides.length})` },
          {
            id: "zine",
            label: `📰 Zine & Kiriman (${articles.length}${pendingSubs ? ` • ${pendingSubs} Baru` : ""})`,
          },
          { id: "docs", label: `🎞 Dokumentasi (${docs.length})` },
          { id: "merch", label: `👕 Merch & WA (${merch.length})` },
          {
            id: "inbox",
            label: `📬 Inbox Kolab (${inquiries.length}${newInquiries ? ` • ${newInquiries} Baru` : ""})`,
          },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as AdminTab)}
            className={`font-stamp text-xs font-bold uppercase px-3.5 py-2 border-2 border-[#14101C] transition-colors ${
              tab === t.id
                ? "bg-[#14101C] text-[#92FA66]"
                : "bg-[#F5F0E6] text-[#14101C] hover:bg-[#EBE3D3]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: AGENDA & INFORMASI BROSUR */}
      {tab === "agenda" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left: Existing Rides List */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-poster text-2xl uppercase">DAFTAR AGENDA &amp; BROSUR</h2>
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span
                      className="font-stamp text-[10px] font-bold uppercase px-2 py-0.5 border border-[#14101C] inline-block mb-1"
                      style={{ background: ride.accentBg, color: ride.accentText }}
                    >
                      {ride.status.toUpperCase()} • {ride.dateBadge}
                    </span>
                    <h3 className="font-poster text-2xl uppercase">{ride.title}</h3>
                    <div className="font-stamp text-[11px] text-[#4B4258]">
                      {ride.schedule} • {ride.tikum} • {ride.riders.length} riders
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-stamp text-[10px] font-bold uppercase">
                    <button
                      type="button"
                      onClick={() => setViewingRidersRideId(ride.id)}
                      className="px-2.5 py-1 bg-[#92FA66] border border-[#14101C]"
                    >
                      👥 Riders ({ride.riders.length})
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingRideId(editingRideId === ride.id ? null : ride.id)
                      }
                      className="px-2.5 py-1 bg-[#8E47EE] text-white border border-[#14101C]"
                    >
                      📋 Edit Brosur
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleRideStatus(ride)}
                      className="px-2.5 py-1 bg-[#EBE3D3] border border-[#14101C]"
                    >
                      {ride.status === "upcoming" ? "→ Arsipkan" : "→ Buka Lagi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRide(ride.id)}
                      className="px-2.5 py-1 bg-white text-[#FF5B37] border border-[#FF5B37]"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-[#EBE3D3] border border-[#14101C] font-stamp text-[11px]">
                  <strong>Brosur:</strong> {ride.brosur.cardPerk} ({ride.brosur.quota})
                </div>

                {/* Inline Dynamic Informasi Brosur Editor */}
                {editingRideId === ride.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveBrosur(ride.id, e.currentTarget);
                    }}
                    className="p-4 bg-white border-2 border-[#14101C] space-y-2.5"
                  >
                    <div className="font-stamp text-[11px] font-bold uppercase text-[#6C2BD9]">
                      EDIT INFORMASI BROSUR DINAMIS:
                    </div>
                    <label className="flex items-center gap-2 font-stamp text-xs">
                      <input
                        name="isCollab"
                        type="checkbox"
                        defaultChecked={ride.brosur.isCollab}
                        className="accent-[#8E47EE]"
                      />
                      <span>Mode Kolaborasi Brand (Digital Ride Pass: Klaim Refreshment)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        name="cardPerk"
                        defaultValue={ride.brosur.cardPerk}
                        placeholder="Highlight singkat di kartu"
                        className="px-2.5 py-1.5 border-2 border-[#14101C] text-xs font-stamp"
                      />
                      <input
                        name="quota"
                        defaultValue={ride.brosur.quota}
                        placeholder="Badge kuota / syarat"
                        className="px-2.5 py-1.5 border-2 border-[#14101C] text-xs font-stamp"
                      />
                    </div>
                    <textarea
                      name="points"
                      rows={4}
                      defaultValue={ride.brosur.points.join("\n")}
                      placeholder="1 poin informasi brosur per baris..."
                      className="w-full px-2.5 py-1.5 border-2 border-[#14101C] text-xs"
                    />
                    <input
                      name="giveback"
                      defaultValue={ride.brosur.giveback}
                      placeholder="Teks timbal balik (giveback) pesepeda"
                      className="w-full px-2.5 py-1.5 border-2 border-[#14101C] text-xs"
                    />
                    <input
                      name="prompt"
                      defaultValue={ride.brosur.prompt}
                      placeholder="Placeholder input catatan saat JOIN"
                      className="w-full px-2.5 py-1.5 border-2 border-[#14101C] text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingRideId(null)}
                        className="font-stamp text-xs px-3 py-1.5 border border-[#14101C]"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="font-stamp text-xs font-bold uppercase px-4 py-1.5 bg-[#14101C] text-[#92FA66]"
                      >
                        Simpan Brosur ✓
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>

          {/* Right: Add New Ride Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleCreateRide}
              className="bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow p-5 space-y-3 sticky top-24"
            >
              <h2 className="font-poster text-2xl uppercase">+ BUAT AGENDA BARU</h2>
              <input
                required
                value={nrTitle}
                onChange={(e) => setNrTitle(e.target.value)}
                placeholder="Judul Agenda (cth. Rabo-Rabo Night Roll #43)"
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={nrCat}
                  onChange={(e) => setNrCat(e.target.value as RideCategory)}
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                >
                  <option value="rabo">Rabo-Rabo</option>
                  <option value="sporty">Sporty &amp; Brick</option>
                  <option value="sunday">Sunday Pol</option>
                  <option value="ngelayap">Ngelayap</option>
                  <option value="collab">Culture &amp; Collab</option>
                </select>
                <input
                  required
                  value={nrDateBadge}
                  onChange={(e) => setNrDateBadge(e.target.value)}
                  placeholder="Badge Tgl (cth. RABU, 02 DES)"
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
              </div>
              <input
                required
                value={nrSchedule}
                onChange={(e) => setNrSchedule(e.target.value)}
                placeholder="Jadwal Lengkap (cth. Rabu, 02 Des 2026 • 20:00 WIB)"
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  value={nrTikum}
                  onChange={(e) => setNrTikum(e.target.value)}
                  placeholder="Titik Kumpul"
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs"
                />
                <input
                  value={nrDistance}
                  onChange={(e) => setNrDistance(e.target.value)}
                  placeholder="Jarak (25 KM)"
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
              </div>
              <input
                value={nrPace}
                onChange={(e) => setNrPace(e.target.value)}
                placeholder="Pace (Santai / Tempo)"
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <textarea
                rows={2}
                value={nrHighlight}
                onChange={(e) => setNrHighlight(e.target.value)}
                placeholder="Deskripsi singkat agenda..."
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <div className="pt-2 border-t-2 border-dashed border-[#14101C]/35 space-y-2">
                <div className="font-stamp text-[11px] font-bold uppercase text-[#6C2BD9]">
                  📋 INFORMASI BROSUR AGENDA INI:
                </div>
                <label className="flex items-center gap-2 font-stamp text-xs">
                  <input
                    type="checkbox"
                    checked={nrIsCollab}
                    onChange={(e) => setNrIsCollab(e.target.checked)}
                    className="accent-[#8E47EE]"
                  />
                  <span>Agenda Kolaborasi Brand (Refreshment / Sampling)</span>
                </label>
                <input
                  value={nrCardPerk}
                  onChange={(e) => setNrCardPerk(e.target.value)}
                  placeholder="Highlight di kartu agenda"
                  className="w-full px-2.5 py-1.5 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
                <input
                  value={nrQuota}
                  onChange={(e) => setNrQuota(e.target.value)}
                  placeholder="Kuota / Syarat"
                  className="w-full px-2.5 py-1.5 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
                <textarea
                  rows={3}
                  value={nrPoints}
                  onChange={(e) => setNrPoints(e.target.value)}
                  placeholder="1 poin informasi brosur per baris"
                  className="w-full px-2.5 py-1.5 bg-white border-2 border-[#14101C] text-xs"
                />
                <input
                  value={nrGiveback}
                  onChange={(e) => setNrGiveback(e.target.value)}
                  placeholder="Timbal balik pesepeda (Giveback)"
                  className="w-full px-2.5 py-1.5 bg-white border-2 border-[#14101C] text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full riso-shadow font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#8E47EE] text-white border-2 border-[#14101C]"
              >
                Terbitkan Agenda →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: ZINE & KIRIMAN PEMBACA */}
      {tab === "zine" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="font-poster text-2xl uppercase mb-3">
                ANTREAN KIRIMAN PEMBACA ({submissions.length})
              </h2>
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-[#EBE3D3] border-2 border-[#14101C] p-4 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 font-stamp text-[10px] font-bold uppercase">
                      <span className="px-2 py-0.5 bg-[#14101C] text-[#92FA66]">
                        {sub.status} • {sub.cat}
                      </span>
                      <span>OLEH {sub.author}</span>
                    </div>
                    <h3 className="font-poster text-xl uppercase">{sub.title}</h3>
                    <p className="text-xs text-[#362F42]">{sub.body}</p>
                    {sub.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleReviewSubmission(sub.id, "published")}
                          className="font-stamp text-[11px] font-bold uppercase px-3 py-1.5 bg-[#92FA66] border-2 border-[#14101C]"
                        >
                          ✓ Terbitkan ke Zine
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewSubmission(sub.id, "archived")}
                          className="font-stamp text-[11px] font-bold uppercase px-3 py-1.5 bg-white border border-[#14101C]"
                        >
                          Arsipkan
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-poster text-2xl uppercase mb-3">
                ARTIKEL TAYANG DI ZINE ({articles.length})
              </h2>
              <div className="space-y-2.5">
                {articles.map((a) => (
                  <div
                    key={a.slug}
                    className="bg-[#F5F0E6] border-2 border-[#14101C] p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-stamp text-[10px] text-[#6C2BD9] uppercase font-bold">
                        {a.rubrik} • {a.dateLabel} • 👏 {a.applause}
                      </div>
                      <div className="font-poster text-lg uppercase truncate">{a.title}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteArticle(a.slug)}
                      className="shrink-0 font-stamp text-[10px] font-bold uppercase px-2.5 py-1 border border-[#FF5B37] text-[#FF5B37]"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleCreateArticle}
              className="bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow p-5 space-y-3 sticky top-24"
            >
              <h2 className="font-poster text-2xl uppercase">+ TULIS ARTIKEL ZINE BARU</h2>
              <input
                required
                value={naTitle}
                onChange={(e) => setNaTitle(e.target.value)}
                placeholder="Judul Artikel"
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  value={naAuthor}
                  onChange={(e) => setNaAuthor(e.target.value)}
                  placeholder="Penulis"
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
                <select
                  value={naCat}
                  onChange={(e) => setNaCat(e.target.value as ArticleCategory)}
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                >
                  <option value="cerita">Cerita Jalan</option>
                  <option value="ngelayap">Catatan Ngelayap</option>
                  <option value="budaya">Skena &amp; Budaya</option>
                  <option value="bikecheck">Bike Check</option>
                  <option value="impact">Pedal for Impact</option>
                </select>
              </div>
              <input
                value={naLocation}
                onChange={(e) => setNaLocation(e.target.value)}
                placeholder="Lokasi / Rute"
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <textarea
                required
                rows={6}
                value={naBody}
                onChange={(e) => setNaBody(e.target.value)}
                placeholder="Isi artikel (pisahkan paragraf dengan Enter)..."
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <button
                type="submit"
                className="w-full riso-shadow font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#8E47EE] text-white border-2 border-[#14101C]"
              >
                Terbitkan ke Zine →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: DOKUMENTASI FOTO & REELS */}
      {tab === "docs" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {docs.map((d) => (
              <div
                key={d.id}
                className="bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 bg-[#14101C] border border-[#14101C] overflow-hidden mb-2.5">
                    <img
                      src={d.type === "video" ? d.posterUrl || "/media/reel-poster.webp" : d.mediaUrl}
                      alt={d.title}
                      className="w-full h-full object-cover block"
                    />
                  </div>
                  <div className="font-stamp text-[10px] font-bold uppercase text-[#6C2BD9]">
                    {d.type.toUpperCase()} • 📍 {d.location}
                  </div>
                  <div className="font-poster text-lg uppercase leading-tight">{d.title}</div>
                </div>
                <div className="pt-2.5 mt-2 border-t border-dashed border-[#14101C]/30 flex justify-between items-center font-stamp text-[10px]">
                  <span>{d.dateStamp}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDoc(d.id)}
                    className="text-[#FF5B37] font-bold uppercase underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleCreateDoc}
              className="bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow p-5 space-y-3 sticky top-24"
            >
              <h2 className="font-poster text-2xl uppercase">+ UPLOAD FOTO / REELS BARU</h2>
              <div className="p-3 bg-white border-2 border-dashed border-[#14101C]">
                <label className="block font-stamp text-[11px] font-bold uppercase mb-1.5">
                  Upload File dari Perangkat (JPG / WebP / PNG / MP4)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4"
                  onChange={handleFileUpload}
                  className="text-xs w-full"
                />
                {uploading && (
                  <div className="font-stamp text-[11px] text-[#8E47EE] mt-1">
                    Mengunggah media...
                  </div>
                )}
              </div>
              <input
                required
                value={ndUrl}
                onChange={(e) => setNdUrl(e.target.value)}
                placeholder="URL Media (terisi otomatis setelah upload, atau tempel URL)"
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={ndType}
                  onChange={(e) => setNdType(e.target.value as "photo" | "video")}
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                >
                  <option value="photo">Foto</option>
                  <option value="video">Video Reels</option>
                </select>
                <select
                  value={ndCat}
                  onChange={(e) => setNdCat(e.target.value as DocCategory)}
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                >
                  <option value="street">Street &amp; Peloton</option>
                  <option value="hangout">Hangout &amp; Kafe</option>
                  <option value="collab">Brand Collab</option>
                </select>
              </div>
              <input
                required
                value={ndTitle}
                onChange={(e) => setNdTitle(e.target.value)}
                placeholder="Judul Foto / Video"
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={ndLocation}
                  onChange={(e) => setNdLocation(e.target.value)}
                  placeholder="Lokasi (cth. KINA CAFE)"
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
                <input
                  value={ndDateStamp}
                  onChange={(e) => setNdDateStamp(e.target.value)}
                  placeholder="Tanggal (cth. 25 NOV '26)"
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
              </div>
              <textarea
                rows={2}
                value={ndCaption}
                onChange={(e) => setNdCaption(e.target.value)}
                placeholder="Caption singkat..."
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <button
                type="submit"
                className="w-full riso-shadow font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#14101C] text-[#92FA66] border-2 border-[#14101C]"
              >
                Tambahkan ke Galeri &amp; Filmstrip →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: MERCH & WHATSAPP SETTING */}
      {tab === "merch" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="lg:col-span-7 space-y-4">
            {/* WhatsApp Setting */}
            <form
              onSubmit={handleSaveSettings}
              className="bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-lime p-4 flex flex-col sm:flex-row sm:items-end gap-3"
            >
              <div className="flex-1">
                <label className="block font-stamp text-[11px] font-bold uppercase text-[#92FA66] mb-1">
                  NOMOR WHATSAPP ADMIN MERCH (FORMAT 628...)
                </label>
                <input
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  placeholder="6281234567890"
                  className="w-full px-3 py-2 bg-white text-[#14101C] border-2 border-[#92FA66] font-stamp text-xs"
                />
              </div>
              <button
                type="submit"
                className="font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#92FA66] text-[#14101C]"
              >
                Simpan WA ✓
              </button>
            </form>

            <div className="space-y-3">
              {merch.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#F5F0E6] border-2 border-[#14101C] p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-stamp text-[10px] font-bold uppercase text-[#6C2BD9]">
                      {m.status} • {m.price}
                    </div>
                    <div className="font-poster text-xl uppercase">{m.title}</div>
                  </div>
                  <div className="flex gap-2 font-stamp text-[10px] font-bold uppercase">
                    <button
                      type="button"
                      onClick={() => handleToggleMerchSold(m)}
                      className="px-2.5 py-1 bg-[#EBE3D3] border border-[#14101C]"
                    >
                      {m.soldOut ? "Set Ready Stock" : "Tandai Sold Out"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMerch(m.id)}
                      className="px-2.5 py-1 border border-[#FF5B37] text-[#FF5B37]"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleCreateMerch}
              className="bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow p-5 space-y-3 sticky top-24"
            >
              <h2 className="font-poster text-2xl uppercase">+ TAMBAH PRODUK MERCH</h2>
              <input
                required
                value={nmTitle}
                onChange={(e) => setNmTitle(e.target.value)}
                placeholder="Nama Produk"
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={nmCat}
                  onChange={(e) => setNmCat(e.target.value as MerchCategory)}
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                >
                  <option value="apparel">Apparel &amp; Jersey</option>
                  <option value="gear">Bag &amp; Gear</option>
                  <option value="art">Sticker &amp; Zine</option>
                  <option value="archive">Archive</option>
                </select>
                <input
                  required
                  value={nmPrice}
                  onChange={(e) => setNmPrice(e.target.value)}
                  placeholder="Rp 185.000"
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={nmStatus}
                  onChange={(e) => setNmStatus(e.target.value)}
                  placeholder="READY STOCK / OPEN PO"
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
                <input
                  value={nmSizes}
                  onChange={(e) => setNmSizes(e.target.value)}
                  placeholder="Ukuran: S, M, L, XL"
                  className="px-2.5 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                />
              </div>
              <input
                value={nmImpact}
                onChange={(e) => setNmImpact(e.target.value)}
                placeholder="Catatan Bahan / Impact"
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <textarea
                rows={3}
                value={nmDesc}
                onChange={(e) => setNmDesc(e.target.value)}
                placeholder="Deskripsi produk..."
                className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
              />
              <button
                type="submit"
                className="w-full riso-shadow font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#8E47EE] text-white border-2 border-[#14101C]"
              >
                Simpan Merch →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: INBOX KOLAB BRAND */}
      {tab === "inbox" && (
        <div className="space-y-4">
          <h2 className="font-poster text-2xl uppercase">
            INBOX PROPOSAL BRAND &amp; UNDANGAN KOMUNITAS ({inquiries.length})
          </h2>
          {inquiries.length === 0 ? (
            <div className="p-8 bg-[#EBE3D3] border-2 border-dashed border-[#14101C] font-stamp text-xs text-center">
              Belum ada pesan masuk.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow p-5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 font-stamp text-[10px] font-bold uppercase">
                    <span className="px-2 py-0.5 bg-[#92FA66] border border-[#14101C]">
                      {inq.topic}
                    </span>
                    <span className="px-2 py-0.5 bg-[#14101C] text-[#92FA66]">
                      {inq.status}
                    </span>
                  </div>
                  <h3 className="font-poster text-2xl uppercase">{inq.brandName}</h3>
                  <div className="font-stamp text-xs text-[#6C2BD9] font-bold">
                    Kontak: {inq.contact || "-"}
                  </div>
                  <p className="text-sm text-[#362F42]">{inq.message}</p>
                  <div className="pt-2 border-t border-dashed border-[#14101C]/30 flex gap-2 font-stamp text-[10px] font-bold uppercase">
                    {(["new", "contacted", "done"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleInquiryStatus(inq.id, st)}
                        className={`px-2.5 py-1 border border-[#14101C] ${
                          inq.status === st ? "bg-[#14101C] text-[#92FA66]" : "bg-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RIDERS CHECK-IN & CSV EXPORT MODAL */}
      {viewingRide && (
        <div
          className="fixed inset-0 z-[130] bg-[#14101C]/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingRidersRideId(null);
          }}
        >
          <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow-lime max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setViewingRidersRideId(null)}
              className="absolute top-4 right-4 font-stamp text-xs font-bold px-2.5 py-1 border-2 border-[#14101C] bg-[#EBE3D3]"
            >
              ESC ✕
            </button>
            <div className="flex flex-wrap items-center justify-between gap-3 pr-16 mb-4">
              <div>
                <div className="font-stamp text-[11px] font-bold uppercase text-[#6C2BD9]">
                  CHECK-IN &amp; VERIFIKASI DIGITAL RIDE PASS
                </div>
                <h3 className="font-poster text-3xl uppercase">{viewingRide.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => exportRidersCsv(viewingRide)}
                className="font-stamp text-xs font-bold uppercase px-4 py-2 bg-[#14101C] text-[#92FA66] border-2 border-[#14101C]"
              >
                ⬇ Export CSV ({viewingRide.riders.length})
              </button>
            </div>

            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {viewingRide.riders.map((r, i) => (
                <div
                  key={r.id}
                  className={`p-3 border-2 border-[#14101C] flex flex-wrap items-center justify-between gap-3 font-stamp text-xs ${
                    r.checkedIn ? "bg-[#92FA66]/45" : "bg-white"
                  }`}
                >
                  <div>
                    <span className="text-[#5B5269] mr-2">
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                    <strong>{r.name}</strong>{" "}
                    <span className="px-1.5 py-0.5 bg-[#14101C] text-white text-[10px]">
                      {r.bike}
                    </span>
                    {r.note && (
                      <div className="text-[11px] text-[#362F42] mt-0.5">
                        Catatan: {r.note}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleCheckIn(viewingRide.id, r.id, !r.checkedIn)}
                    className={`px-3 py-1 border-2 border-[#14101C] text-[11px] font-bold uppercase ${
                      r.checkedIn ? "bg-[#176B3F] text-[#92FA66]" : "bg-[#EBE3D3]"
                    }`}
                  >
                    {r.checkedIn ? "✓ Sudah Check-In / Klaim" : "Tandai Hadir"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
