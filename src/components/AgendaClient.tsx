"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useMotion } from "@/components/MotionProvider";
import {
  getOrCreateDeviceToken,
  getSavedRiderProfile,
  saveRiderProfile,
} from "@/lib/device";
import type { Ride, RideCategory, RideStatus } from "@/lib/types";

const subscribeStorage = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const getEmptySnapshot = () => "";

function renderRiderName(name: string) {
  if (name.startsWith("@") && name.length > 1) {
    const handle = encodeURIComponent(name.slice(1).replace(/[^a-zA-Z0-9._]/g, ""));
    return (
      <a
        href={`https://www.instagram.com/${handle}/`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="hover:underline hover:text-[#6C2BD9]"
      >
        {name} <span className="text-[9px] opacity-60">↗</span>
      </a>
    );
  }
  return <span>{name}</span>;
}

function ElevationChart({ points }: { points: number[] }) {
  const safePoints = points.length >= 2 ? points : [10, 14, 12, 18, 15, 22, 16, 12, 10];
  const w = 360;
  const h = 76;
  const step = w / (safePoints.length - 1);
  const coords = safePoints.map(
    (val, i) => `${(i * step).toFixed(1)},${(h - val * 0.78).toFixed(1)}`
  );
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20 bg-[#EBE3D3] border-2 border-[#14101C]">
      <polygon points={`0,${h} ${coords.join(" ")} ${w},${h}`} fill="#92FA66" opacity="0.55" />
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="#14101C"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AgendaClient({
  initialRides,
  initialTab = "upcoming",
  initialOpenRideId = null,
}: {
  initialRides: Ride[];
  initialTab?: RideStatus;
  initialOpenRideId?: string | null;
}) {
  const { boostWheel } = useMotion();
  const [rides, setRides] = useState<Ride[]>(initialRides);
  const [statusTab, setStatusTab] = useState<RideStatus>(initialTab);
  const [catFilter, setCatFilter] = useState<"all" | RideCategory>("all");

  // Hydration-safe deviceToken from localStorage
  const deviceToken = useSyncExternalStore(
    subscribeStorage,
    getOrCreateDeviceToken,
    getEmptySnapshot
  );

  // Modal state
  const [activeRideId, setActiveRideId] = useState<string | null>(initialOpenRideId);
  const [modalTab, setModalTab] = useState<"info" | "riders">("info");
  const [joinHandle, setJoinHandle] = useState("");
  const [joinBike, setJoinBike] = useState('Commuter 26"');
  const [joinNote, setJoinNote] = useState("");
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Rider search/filter inside modal
  const [riderQuery, setRiderQuery] = useState("");
  const [riderBikeFilter, setRiderBikeFilter] = useState("all");

  // Archive feedback form
  const [fbAuthor, setFbAuthor] = useState("");
  const [fbTag, setFbTag] = useState("🔥 Rute Asyik");
  const [fbNote, setFbNote] = useState("");
  const [fbBusy, setFbBusy] = useState(false);

  useEffect(() => {
    if (!activeRideId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveRideId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeRideId]);

  const upcomingRides = useMemo(
    () => rides.filter((r) => r.status === "upcoming"),
    [rides]
  );
  const archiveRides = useMemo(
    () => rides.filter((r) => r.status === "archive"),
    [rides]
  );
  const nextRide = upcomingRides[0] || null;

  const visibleRides = useMemo(() => {
    const byStatus = statusTab === "upcoming" ? upcomingRides : archiveRides;
    return catFilter === "all"
      ? byStatus
      : byStatus.filter((r) => r.category === catFilter);
  }, [statusTab, upcomingRides, archiveRides, catFilter]);

  const activeRide = useMemo(
    () => rides.find((r) => r.id === activeRideId) || null,
    [rides, activeRideId]
  );

  const findMyEntry = (ride: Ride) => {
    if (!deviceToken) return null;
    return ride.riders.find((r) => r.deviceToken === deviceToken) || null;
  };

  const openModal = (rideId: string, tab: "info" | "riders" = "info") => {
    const saved = getSavedRiderProfile();
    if (!joinHandle && saved.handle) setJoinHandle(saved.handle);
    if (!fbAuthor && saved.handle) setFbAuthor(saved.handle);
    if (saved.bike) setJoinBike(saved.bike);
    setActiveRideId(rideId);
    setModalTab(tab);
    setRiderQuery("");
    setRiderBikeFilter("all");
    setJoinError("");
  };

  const replaceRide = (updated: Ride) => {
    setRides((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRide || !joinHandle.trim()) return;
    setJoinBusy(true);
    setJoinError("");
    const tok = deviceToken || getOrCreateDeviceToken();
    try {
      const res = await fetch(`/api/rides/${encodeURIComponent(activeRide.id)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: joinHandle.trim(),
          bike: joinBike,
          note: joinNote.trim(),
          deviceToken: tok,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal join agenda.");
      saveRiderProfile(joinHandle.trim(), joinBike);
      setFbAuthor(joinHandle.trim());
      setJoinNote("");
      if (data.ride) replaceRide(data.ride);
      boostWheel(30);
      setModalTab("riders");
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Gagal join.");
    } finally {
      setJoinBusy(false);
    }
  };

  const handleLeave = async (rideId: string) => {
    if (!deviceToken) return;
    setJoinBusy(true);
    try {
      const res = await fetch(`/api/rides/${encodeURIComponent(rideId)}/join`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceToken }),
      });
      const data = await res.json();
      if (res.ok && data.ride) replaceRide(data.ride);
    } finally {
      setJoinBusy(false);
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRide || !fbAuthor.trim() || !fbNote.trim()) return;
    setFbBusy(true);
    try {
      const res = await fetch(
        `/api/rides/${encodeURIComponent(activeRide.id)}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: fbAuthor.trim(),
            tag: fbTag,
            note: fbNote.trim(),
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.ride) {
        replaceRide(data.ride);
        setFbNote("");
        saveRiderProfile(fbAuthor.trim(), joinBike);
      }
    } finally {
      setFbBusy(false);
    }
  };

  const myActiveEntry = activeRide ? findMyEntry(activeRide) : null;
  const myPassNum =
    activeRide && myActiveEntry
      ? String(
          activeRide.riders.findIndex((r) => r.id === myActiveEntry.id) + 1
        ).padStart(2, "0")
      : "01";

  const filteredModalRiders = useMemo(() => {
    if (!activeRide) return [];
    const q = riderQuery.trim().toLowerCase();
    return activeRide.riders
      .map((r, idx) => ({ ...r, num: idx + 1 }))
      .filter((r) => {
        const matchBike = riderBikeFilter === "all" || r.bike === riderBikeFilter;
        const matchText =
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.bike.toLowerCase().includes(q);
        return matchBike && matchText;
      });
  }, [activeRide, riderQuery, riderBikeFilter]);

  const modalBikeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!activeRide) return counts;
    activeRide.riders.forEach((r) => {
      counts[r.bike] = (counts[r.bike] || 0) + 1;
    });
    return counts;
  }, [activeRide]);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="border-b-2 border-[#14101C] pb-7 mb-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#8E47EE] text-white border-2 border-[#14101C] inline-block mb-3">
            RIDE CALENDAR &amp; BULETIN ARCHIVE
          </span>
          <h1 className="font-poster text-5xl sm:text-6xl uppercase text-[#14101C]">
            AGENDA GOWES &amp; RUTE
          </h1>
        </div>
        <p className="text-sm text-[#4B4258] max-w-md">
          Cek jadwal <strong>Upcoming</strong> untuk <strong>Join Barisan</strong> (tanpa
          login—cukup nama / <code>@username</code> IG), atau buka{" "}
          <strong>Archive Buletin</strong> untuk melihat rekap kegiatan yang terhubung ke{" "}
          <strong>Zine PedalPol</strong>.
        </p>
      </div>

      {/* Primary Status Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7" role="tablist">
        <button
          type="button"
          onClick={() => setStatusTab("upcoming")}
          className={`text-left p-4 border-2 border-[#14101C] flex items-center justify-between gap-3 transition-colors ${
            statusTab === "upcoming"
              ? "riso-shadow bg-[#92FA66] text-[#14101C]"
              : "bg-[#EBE3D3] text-[#14101C] hover:bg-[#F5F0E6]"
          }`}
        >
          <div>
            <div className="font-stamp text-[11px] font-bold uppercase">
              STATUS: BUKA BARISAN
            </div>
            <div className="font-poster text-2xl sm:text-3xl uppercase">
              ⚡ UPCOMING RIDES ({upcomingRides.length})
            </div>
          </div>
          <span className="font-stamp text-xs font-bold px-2.5 py-1 bg-[#14101C] text-[#92FA66] uppercase">
            JOIN
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusTab("archive")}
          className={`text-left p-4 border-2 border-[#14101C] flex items-center justify-between gap-3 transition-colors ${
            statusTab === "archive"
              ? "riso-shadow bg-[#8E47EE] text-white"
              : "bg-[#EBE3D3] text-[#14101C] hover:bg-[#F5F0E6]"
          }`}
        >
          <div>
            <div
              className={`font-stamp text-[11px] font-bold uppercase ${
                statusTab === "archive" ? "text-[#92FA66]" : "text-[#5B5269]"
              }`}
            >
              TERARSIP KE BULETIN &amp; ZINE
            </div>
            <div className="font-poster text-2xl sm:text-3xl uppercase">
              🗂 ARCHIVE BULETIN ({archiveRides.length})
            </div>
          </div>
          <span className="font-stamp text-xs font-bold px-2.5 py-1 border-2 border-[#14101C] bg-[#F5F0E6] text-[#14101C] uppercase">
            REKAP
          </span>
        </button>
      </div>

      {/* Dynamic Context Banner */}
      {statusTab === "upcoming" && nextRide ? (
        <div className="mb-7 bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-lime p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="font-stamp text-xs font-bold uppercase text-[#92FA66] mb-1">
              ⚡ NEXT UPCOMING RIDE • {nextRide.riders.length} PESEPEDA SUDAH MERAPAT
            </div>
            <h2 className="font-poster text-3xl sm:text-4xl uppercase leading-tight">
              {nextRide.title}
            </h2>
            <p className="font-stamp text-xs text-[#D6CFE0] mt-1">
              {nextRide.schedule} • Tikum: {nextRide.tikum} • {nextRide.distance}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            {(() => {
              const mine = findMyEntry(nextRide);
              return (
                <button
                  type="button"
                  onClick={() => openModal(nextRide.id, "info")}
                  className={`font-stamp text-xs font-bold uppercase px-5 py-3 border-2 border-[#92FA66] transition-colors ${
                    mine
                      ? "bg-[#176B3F] text-[#92FA66]"
                      : "bg-[#92FA66] text-[#14101C] hover:bg-white"
                  }`}
                >
                  {mine ? `✓ Sudah Join (${mine.name})` : "Gas Join Barisan! →"}
                </button>
              );
            })()}
            <button
              type="button"
              onClick={() => openModal(nextRide.id, "riders")}
              className="font-stamp text-xs font-bold uppercase px-4 py-3 border border-[#F5F0E6]/45 text-[#F5F0E6] hover:border-[#92FA66] hover:text-[#92FA66]"
            >
              Lihat Semua Barisan ({nextRide.riders.length})
            </button>
          </div>
        </div>
      ) : statusTab === "archive" ? (
        <div className="mb-7 bg-[#EBE3D3] text-[#14101C] border-2 border-[#14101C] riso-shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-stamp text-xs font-bold uppercase text-[#6C2BD9] mb-1">
              🗂 BULETIN ARSIP KEGIATAN PEDALPOL
            </div>
            <p className="text-sm text-[#362F42]">
              Setiap agenda yang selesai dilaksanakan diarsipkan di sini lengkap dengan jumlah
              peserta, rute, ulasan riders, dan tautan langsung ke liputannya di{" "}
              <strong>Zine PedalPol</strong>.
            </p>
          </div>
          <Link
            href="/zine"
            className="shrink-0 font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#14101C] text-[#92FA66] border-2 border-[#14101C] w-fit"
          >
            Buka Zine PedalPol →
          </Link>
        </div>
      ) : null}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-7">
        {[
          { id: "all", label: "Semua Kategori" },
          { id: "rabo", label: "Rabo-Rabo" },
          { id: "sporty", label: "Sporty & Brick" },
          { id: "sunday", label: "Sunday Pol" },
          { id: "ngelayap", label: "Ngelayap" },
          { id: "collab", label: "Culture & Collab" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setCatFilter(f.id as "all" | RideCategory)}
            className={`font-stamp text-xs font-bold uppercase px-3.5 py-2 border-2 border-[#14101C] transition-colors ${
              catFilter === f.id
                ? "bg-[#14101C] text-[#92FA66]"
                : "bg-[#F5F0E6] text-[#14101C] hover:bg-[#EBE3D3]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Agenda Grid */}
      {visibleRides.length === 0 ? (
        <div className="p-8 bg-[#EBE3D3] border-2 border-dashed border-[#14101C] text-center font-stamp text-xs uppercase mb-12">
          Belum ada agenda pada kategori ini. Coba pilih &quot;Semua Kategori&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {visibleRides.map((ride) => {
            if (ride.status === "upcoming") {
              const mine = findMyEntry(ride);
              const total = ride.riders.length;
              const preview = ride.riders.slice(0, 3);
              const remaining = Math.max(0, total - 3);
              return (
                <article
                  key={ride.id}
                  onClick={() => openModal(ride.id, "info")}
                  className="bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow flex flex-col justify-between overflow-hidden cursor-pointer group"
                >
                  <div>
                    <div
                      className="px-4 py-2.5 border-b-2 border-[#14101C] font-stamp text-[11px] font-bold uppercase flex items-center justify-between"
                      style={{ background: ride.accentBg, color: ride.accentText }}
                    >
                      <span>{ride.badge}</span>
                      <span>{ride.distance}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 font-stamp text-xs text-[#6C2BD9] font-bold uppercase mb-1.5">
                        <span>{ride.dateBadge}</span>
                        <span className="text-[#176B3F]">● {total} Riders</span>
                      </div>
                      <h3 className="font-poster text-2xl uppercase text-[#14101C] group-hover:text-[#8E47EE] transition-colors mb-2">
                        {ride.title}
                      </h3>
                      <p className="text-sm text-[#362F42] leading-relaxed mb-3">
                        {ride.highlight}
                      </p>

                      {/* Informasi Brosur Highlight Pill */}
                      {ride.brosur.cardPerk && (
                        <div
                          className={`mb-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#14101C] font-stamp text-[10px] font-bold uppercase ${
                            ride.brosur.isCollab
                              ? "bg-[#92FA66] text-[#14101C]"
                              : "bg-[#EBE3D3] text-[#14101C]"
                          }`}
                        >
                          <span>{ride.brosur.cardPerk}</span>
                        </div>
                      )}

                      {/* Live Rider List Preview */}
                      <div className="pt-3 border-t border-dashed border-[#14101C]/30">
                        <div className="flex items-center justify-between font-stamp text-[10px] font-bold uppercase text-[#5B5269] mb-1.5">
                          <span>LIST BARISAN ({total})</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(ride.id, "riders");
                            }}
                            className="text-[#6C2BD9] underline hover:text-[#14101C]"
                          >
                            Lihat Semua →
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 font-stamp">
                          {preview.map((r) => {
                            const isMe = deviceToken && r.deviceToken === deviceToken;
                            return (
                              <span
                                key={r.id}
                                className={`px-1.5 py-0.5 text-[10px] border border-[#14101C] ${
                                  isMe ? "bg-[#92FA66] font-bold" : "bg-[#F5F0E6]"
                                }`}
                              >
                                {isMe ? "✓ " : ""}
                                {r.name}
                              </span>
                            );
                          })}
                          {remaining > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(ride.id, "riders");
                              }}
                              className="px-1.5 py-0.5 text-[10px] bg-[#14101C] text-[#92FA66] hover:bg-[#8E47EE] hover:text-white transition-colors"
                            >
                              +{remaining} lainnya
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-[#EBE3D3] border-t-2 border-[#14101C] flex items-center justify-between gap-2 font-stamp text-[11px]">
                    <span className="truncate text-[#14101C] font-bold">
                      🚲 {ride.bikes}
                    </span>
                    <span
                      className={`shrink-0 px-3 py-1 border border-[#14101C] font-bold uppercase ${
                        mine
                          ? "bg-[#176B3F] text-[#92FA66]"
                          : "bg-[#92FA66] text-[#14101C]"
                      }`}
                    >
                      {mine ? "✓ Sudah Join" : "Gas Join →"}
                    </span>
                  </div>
                </article>
              );
            }

            // Archive Card
            return (
              <article
                key={ride.id}
                onClick={() => openModal(ride.id, "info")}
                className="bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                <div>
                  <div className="px-4 py-2.5 border-b-2 border-[#14101C] font-stamp text-[11px] font-bold uppercase flex items-center justify-between bg-[#EBE3D3] text-[#14101C]">
                    <span>✓ {ride.dateBadge}</span>
                    <span
                      className="px-2 py-0.5 border border-[#14101C]"
                      style={{ background: ride.accentBg, color: ride.accentText }}
                    >
                      {ride.ridersAttended || "Terlaksana"}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="font-stamp text-[11px] text-[#5B5269] font-bold uppercase mb-1.5">
                      {ride.badge} • {ride.distance}
                    </div>
                    <h3 className="font-poster text-2xl uppercase text-[#14101C] group-hover:text-[#8E47EE] transition-colors mb-2.5">
                      {ride.title}
                    </h3>
                    <p className="text-sm text-[#362F42] leading-relaxed mb-3">
                      {ride.highlight}
                    </p>
                    <div className="font-stamp text-[10px] font-bold uppercase text-[#176B3F]">
                      💬 {ride.feedbacks.length} Kesan &amp; Feedback Riders (Klik isi/lihat)
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3.5 bg-[#14101C] text-[#F5F0E6] border-t-2 border-[#14101C] flex items-center justify-between gap-2 font-stamp text-[11px]">
                  <span className="truncate text-[#BEB5CA]">Rekap &amp; Feedback</span>
                  {ride.zineSlug ? (
                    <Link
                      href={`/zine/${ride.zineSlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 px-3 py-1 bg-[#92FA66] text-[#14101C] hover:bg-white font-bold uppercase transition-colors"
                    >
                      Baca di Zine →
                    </Link>
                  ) : (
                    <span className="shrink-0 px-3 py-1 bg-[#92FA66] text-[#14101C] font-bold uppercase">
                      Lihat Rekap →
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* First Timer / Newbie Welcome Box */}
      <div className="bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow p-6 sm:p-8">
        <div className="font-stamp text-xs font-bold uppercase text-[#6C2BD9] mb-2">
          BARU PERTAMA KALI MAU IKUT?
        </div>
        <h2 className="font-poster text-3xl uppercase text-[#14101C] mb-4">
          PANDUAN SINGKAT BIAR GOWES AMAN &amp; SERU
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-[#F5F0E6] border-2 border-[#14101C]">
            <div className="font-stamp text-xs font-bold uppercase mb-1.5">
              01. WAJIB HELM &amp; LAMPU
            </div>
            <p className="text-[#362F42]">
              <em>No Helmet, No Ride</em>. Khusus <strong>Rabo-Rabo</strong> malam hari,
              wajib pasang lampu depan &amp; belakang biar aman di jalanan Jakarta.
            </p>
          </div>
          <div className="p-4 bg-[#F5F0E6] border-2 border-[#14101C]">
            <div className="font-stamp text-xs font-bold uppercase mb-1.5">
              02. SEMUA SEPEDA WELCOME
            </div>
            <p className="text-[#362F42]">
              Fixie, Gravel, Road Bike, Commuter 26&quot;, sampai lipat boleh gabung. Ada{" "}
              <em>Road Captain</em> di depan dan <em>Sweeper</em> di belakang—nggak ada yang
              ditinggal!
            </p>
          </div>
          <div className="p-4 bg-[#F5F0E6] border-2 border-[#14101C]">
            <div className="font-stamp text-xs font-bold uppercase mb-1.5">
              03. BAWA BAN DALAM &amp; UANG KOPI
            </div>
            <p className="text-[#362F42]">
              Sedia ban dalam cadangan &amp; air minum. Selebihnya tinggal bawa tenaga sisa
              pulang kantor dan siap kenalan sama teman baru.
            </p>
          </div>
        </div>
      </div>

      {/* RIDE DETAIL MODAL (UPCOMING & ARCHIVE) */}
      {activeRide && (
        <div
          className="fixed inset-0 z-[125] bg-[#14101C]/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveRideId(null);
          }}
        >
          <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow-lime max-w-2xl w-full p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveRideId(null)}
              className="absolute top-4 right-4 font-stamp text-xs font-bold px-2.5 py-1 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#14101C] hover:text-[#92FA66]"
            >
              ESC ✕
            </button>

            <div
              className="font-stamp text-xs font-bold uppercase px-2.5 py-1 inline-block border-2 border-[#14101C] mb-2"
              style={{ background: activeRide.accentBg, color: activeRide.accentText }}
            >
              {activeRide.badge}
            </div>
            <h3 className="font-poster text-2xl sm:text-3xl uppercase text-[#14101C] mb-3 pr-14">
              {activeRide.title}
            </h3>

            {activeRide.status === "archive" ? (
              <>
                <p className="text-sm text-[#362F42] mb-4">{activeRide.highlight}</p>
                <div className="grid grid-cols-2 gap-2 mb-4 font-stamp text-xs">
                  <div className="p-2.5 bg-[#EBE3D3] border border-[#14101C]">
                    <strong>TERLAKSANA</strong>
                    <br />
                    {activeRide.schedule}
                  </div>
                  <div className="p-2.5 bg-[#EBE3D3] border border-[#14101C]">
                    <strong>TIKUM / RUTE</strong>
                    <br />
                    {activeRide.tikum}
                  </div>
                  <div className="p-2.5 bg-[#EBE3D3] border border-[#14101C]">
                    <strong>JARAK</strong>
                    <br />
                    {activeRide.distance}
                  </div>
                  <div className="p-2.5 bg-[#EBE3D3] border border-[#14101C]">
                    <strong>PESERTA</strong>
                    <br />
                    {activeRide.ridersAttended || "Terlaksana"}
                  </div>
                </div>

                {/* Post-Ride Feedback Wall */}
                <div className="mb-4 p-4 bg-[#EBE3D3] border-2 border-[#14101C]">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-stamp text-xs font-bold uppercase mb-2.5">
                    <span>💬 KATA RIDERS / FEEDBACK ({activeRide.feedbacks.length})</span>
                    <span className="text-[10px] text-[#176B3F]">
                      UNTUK KOMUNITAS &amp; BRAND REPORT
                    </span>
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto mb-3 pr-1">
                    {activeRide.feedbacks.map((f) => (
                      <div key={f.id} className="p-3 bg-white border-2 border-[#14101C]">
                        <div className="flex items-center justify-between gap-2 font-stamp text-[10px] font-bold uppercase mb-1">
                          <span className="text-[#6C2BD9]">{f.author}</span>
                          <span className="px-2 py-0.5 bg-[#92FA66] text-[#14101C] border border-[#14101C]">
                            {f.tag}
                          </span>
                        </div>
                        <p className="text-xs text-[#362F42]">“{f.note}”</p>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={handleFeedback}
                    className="pt-3 border-t-2 border-dashed border-[#14101C]/35 space-y-2"
                  >
                    <div className="font-stamp text-[10px] font-bold uppercase">
                      IKUT ACARA INI? BAGI KESAN / REVIEW 10 DETIK:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        required
                        type="text"
                        value={fbAuthor}
                        onChange={(e) => setFbAuthor(e.target.value)}
                        placeholder="Nama / @username IG"
                        className="px-2.5 py-1.5 bg-white border-2 border-[#14101C] text-xs font-stamp"
                      />
                      <select
                        value={fbTag}
                        onChange={(e) => setFbTag(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border-2 border-[#14101C] text-xs font-stamp"
                      >
                        <option value="🔥 Rute Asyik">🔥 Rute Asyik</option>
                        <option value="☕ Refreshment Mantap">☕ Refreshment Mantap</option>
                        <option value="📸 Foto Keren">📸 Foto Keren</option>
                        <option value="🤝 Ramah Pemula">🤝 Ramah Pemula</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        required
                        type="text"
                        value={fbNote}
                        onChange={(e) => setFbNote(e.target.value)}
                        placeholder="Tulis 1 kalimat kesan / review produk brand..."
                        className="flex-1 px-2.5 py-1.5 bg-white border-2 border-[#14101C] text-xs"
                      />
                      <button
                        type="submit"
                        disabled={fbBusy}
                        className="px-3.5 py-1.5 bg-[#14101C] text-[#92FA66] font-stamp text-xs font-bold uppercase hover:bg-[#8E47EE] hover:text-white transition-colors shrink-0 disabled:opacity-50"
                      >
                        {fbBusy ? "..." : "Kirim"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-[#14101C]">
                  {activeRide.zineSlug && (
                    <Link
                      href={`/zine/${activeRide.zineSlug}`}
                      className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-2.5 border-2 border-[#14101C] bg-[#92FA66] text-[#14101C]"
                    >
                      Baca Liputan Lengkap di Zine →
                    </Link>
                  )}
                  <span className="font-stamp text-[11px] font-bold text-[#176B3F]">
                    ✓ {activeRide.ridersAttended || "Terlaksana"}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Modal Sub-Tabs */}
                <div className="grid grid-cols-2 gap-2 mb-4 font-stamp text-xs font-bold uppercase">
                  <button
                    type="button"
                    onClick={() => setModalTab("info")}
                    className={`py-2 px-3 border-2 border-[#14101C] ${
                      modalTab === "info"
                        ? "bg-[#14101C] text-[#92FA66]"
                        : "bg-[#EBE3D3] text-[#14101C] hover:bg-white"
                    }`}
                  >
                    Informasi Brosur &amp; Join
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab("riders")}
                    className={`py-2 px-3 border-2 border-[#14101C] ${
                      modalTab === "riders"
                        ? "bg-[#14101C] text-[#92FA66]"
                        : "bg-[#EBE3D3] text-[#14101C] hover:bg-white"
                    }`}
                  >
                    Semua Barisan ({activeRide.riders.length})
                  </button>
                </div>

                {modalTab === "info" ? (
                  <>
                    <p className="text-sm text-[#362F42] mb-3.5">{activeRide.highlight}</p>

                    {/* Dynamic Informasi Brosur Box */}
                    <div
                      className={`mb-3.5 p-3.5 border-2 border-[#14101C] ${
                        activeRide.brosur.isCollab ? "bg-[#92FA66]/35" : "bg-[#F5F0E6]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 font-stamp text-[11px] font-bold uppercase mb-2">
                        <span className="text-[#14101C]">📋 INFORMASI BROSUR</span>
                        <span className="px-2 py-0.5 bg-[#14101C] text-[#92FA66] text-[10px]">
                          {activeRide.brosur.quota}
                        </span>
                      </div>
                      <ul className="text-xs text-[#1E1928] space-y-1.5">
                        {activeRide.brosur.points.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3.5 font-stamp text-xs">
                      <div className="p-2.5 bg-[#EBE3D3] border border-[#14101C]">
                        <strong>JADWAL</strong>
                        <br />
                        {activeRide.schedule}
                      </div>
                      <div className="p-2.5 bg-[#EBE3D3] border border-[#14101C]">
                        <strong>TIKUM</strong>
                        <br />
                        {activeRide.tikum}
                      </div>
                      <div className="p-2.5 bg-[#EBE3D3] border border-[#14101C]">
                        <strong>JARAK</strong>
                        <br />
                        {activeRide.distance}
                      </div>
                      <div className="p-2.5 bg-[#EBE3D3] border border-[#14101C]">
                        <strong>PACE</strong>
                        <br />
                        {activeRide.pace}
                      </div>
                    </div>

                    <div className="mb-3.5">
                      <div className="font-stamp text-[11px] font-bold uppercase mb-1 text-[#4B4258]">
                        PROFIL ELEVASI RUTE (GPX)
                      </div>
                      <ElevationChart points={activeRide.elevation} />
                    </div>

                    <div className="mb-4 p-3.5 bg-white border-2 border-[#14101C]">
                      <div className="flex items-center justify-between gap-2 font-stamp text-[11px] font-bold uppercase mb-2">
                        <span>BARISAN MERAPAT ({activeRide.riders.length} PESEPEDA)</span>
                        <button
                          type="button"
                          onClick={() => setModalTab("riders")}
                          className="px-2.5 py-1 bg-[#14101C] text-[#92FA66] hover:bg-[#8E47EE] hover:text-white transition-colors"
                        >
                          Lihat Semua ({activeRide.riders.length}) →
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeRide.riders.slice(0, 6).map((r, i) => {
                          const isMe = deviceToken && r.deviceToken === deviceToken;
                          return (
                            <span
                              key={r.id}
                              className={`inline-flex items-center gap-1 px-2 py-1 border border-[#14101C] font-stamp text-[11px] ${
                                isMe ? "bg-[#92FA66] font-bold" : "bg-[#F5F0E6]"
                              }`}
                            >
                              <span className="text-[9px] text-[#5B5269]">
                                #{String(i + 1).padStart(2, "0")}
                              </span>
                              <span>
                                {isMe ? "★ " : ""}
                                {r.name}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mb-4">
                    <div className="mb-3 space-y-2.5">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={riderQuery}
                          onChange={(e) => setRiderQuery(e.target.value)}
                          placeholder="Cari nama atau @username IG..."
                          className="flex-1 px-3 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp focus:outline-none focus:bg-[#92FA66]/15"
                        />
                        <span className="font-stamp text-[11px] px-3 py-2 bg-[#EBE3D3] border-2 border-[#14101C] text-[#14101C] shrink-0">
                          Menampilkan {filteredModalRiders.length} dari {activeRide.riders.length}{" "}
                          pesepeda
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRiderBikeFilter("all")}
                          className={`font-stamp text-[10px] font-bold uppercase px-2.5 py-1 border-2 border-[#14101C] ${
                            riderBikeFilter === "all"
                              ? "bg-[#14101C] text-[#92FA66]"
                              : "bg-[#F5F0E6] hover:bg-[#EBE3D3]"
                          }`}
                        >
                          Semua ({activeRide.riders.length})
                        </button>
                        {Object.entries(modalBikeCounts).map(([bike, count]) => (
                          <button
                            key={bike}
                            type="button"
                            onClick={() => setRiderBikeFilter(bike)}
                            className={`font-stamp text-[10px] font-bold uppercase px-2.5 py-1 border-2 border-[#14101C] ${
                              riderBikeFilter === bike
                                ? "bg-[#14101C] text-[#92FA66]"
                                : "bg-[#F5F0E6] hover:bg-[#EBE3D3]"
                            }`}
                          >
                            {bike} ({count})
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {filteredModalRiders.length === 0 ? (
                        <div className="col-span-full py-6 text-center font-stamp text-xs text-[#5B5269]">
                          Tidak ada pesepeda yang cocok dengan pencarianmu.
                        </div>
                      ) : (
                        filteredModalRiders.map((r) => {
                          const isMe = deviceToken && r.deviceToken === deviceToken;
                          return (
                            <div
                              key={r.id}
                              className={`flex items-center justify-between gap-2 px-3 py-2 border-2 border-[#14101C] font-stamp text-xs ${
                                isMe ? "bg-[#92FA66] font-bold" : "bg-[#F5F0E6]"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[10px] text-[#5B5269] tabular-nums shrink-0">
                                  #{String(r.num).padStart(2, "0")}
                                </span>
                                <span className="truncate">
                                  {isMe ? "★ " : ""}
                                  {renderRiderName(r.name)}
                                </span>
                              </div>
                              <span className="shrink-0 px-1.5 py-0.5 bg-[#14101C] text-[#F5F0E6] text-[9px] uppercase">
                                {r.bike}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Digital Ride Pass OR Join Form */}
                {myActiveEntry ? (
                  <div className="p-4 bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-lime">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-dashed border-[#92FA66]/45">
                      <span className="font-stamp text-[11px] uppercase text-[#92FA66] font-bold">
                        🎟 DIGITAL RIDE PASS • #{myPassNum}
                      </span>
                      <span className="px-2 py-0.5 bg-[#92FA66] text-[#14101C] font-stamp text-[10px] font-bold uppercase">
                        {activeRide.brosur.isCollab
                          ? "✓ VALID PASS • KLAIM REFRESHMENT"
                          : "✓ VALID RIDE PASS • TERDAFTAR"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-stamp text-xs">
                        <div className="text-sm font-bold text-white">
                          {myActiveEntry.name}{" "}
                          <span className="text-[#92FA66]">({myActiveEntry.bike})</span>
                        </div>
                        {myActiveEntry.note && (
                          <div className="text-[11px] text-[#D6CFE0] mt-0.5">
                            Catatan: &quot;{myActiveEntry.note}&quot;
                          </div>
                        )}
                        <div className="text-[10px] text-[#BEB5CA] mt-1">
                          {activeRide.brosur.isCollab
                            ? "Tunjukkan kartu ini di titik finish / booth partner sesuai Informasi Brosur!"
                            : "Tunjukkan kartu ini saat absen di titik kumpul atau regrouping!"}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={joinBusy}
                        onClick={() => handleLeave(activeRide.id)}
                        className="font-stamp text-[11px] font-bold uppercase px-3 py-1.5 border border-[#92FA66] text-[#92FA66] hover:bg-[#92FA66] hover:text-[#14101C] shrink-0 disabled:opacity-50"
                      >
                        Batal Join
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleJoin}
                    className="p-4 bg-[#EBE3D3] border-2 border-[#14101C] space-y-3"
                  >
                    <div className="font-stamp text-xs font-bold uppercase text-[#14101C]">
                      GAS JOIN BARISAN — KLAIM DIGITAL RIDE PASS
                    </div>
                    {joinError && (
                      <div className="p-2 bg-[#FF5B37]/15 border border-[#FF5B37] font-stamp text-xs text-[#14101C]">
                        {joinError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        required
                        type="text"
                        value={joinHandle}
                        onChange={(e) => setJoinHandle(e.target.value)}
                        placeholder="Nama atau @username_ig"
                        className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp focus:outline-none focus:bg-[#92FA66]/20"
                      />
                      <select
                        value={joinBike}
                        onChange={(e) => setJoinBike(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                      >
                        <option value="Fixie">Fixie</option>
                        <option value="Gravel">Gravel</option>
                        <option value="Road Bike">Road Bike</option>
                        <option value='Commuter 26"'>Commuter 26&quot;</option>
                        <option value="Sepeda Lain">Lipat / MTB / Lainnya</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={joinNote}
                      onChange={(e) => setJoinNote(e.target.value)}
                      placeholder={activeRide.brosur.prompt || "Catatan tambahan (opsional)"}
                      className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-xs"
                    />
                    {activeRide.brosur.giveback && (
                      <label className="flex items-start gap-2 p-2.5 bg-[#F5F0E6] border border-[#14101C] cursor-pointer text-[11px] text-[#362F42]">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-0.5 accent-[#8E47EE]"
                        />
                        <span>
                          <strong>Timbal Balik Seru (Giveback):</strong>{" "}
                          {activeRide.brosur.giveback}
                        </span>
                      </label>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="submit"
                        disabled={joinBusy}
                        className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-2.5 bg-[#8E47EE] text-white border-2 border-[#14101C] disabled:opacity-50"
                      >
                        {joinBusy ? "Mendaftarkan..." : "Gas Join & Ambil Pass! →"}
                      </button>
                      <span className="font-stamp text-[10px] text-[#4B4258]">
                        Tanpa login • Tersimpan otomatis di perangkatmu
                      </span>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
