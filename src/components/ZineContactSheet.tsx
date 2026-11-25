"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { DocLightbox } from "@/components/DocLightbox";
import { useMotion } from "@/components/MotionProvider";
import type { DocCategory, DocItem } from "@/lib/types";

function formatTimecode(sec: number): string {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function ZineContactSheet({ docs }: { docs: DocItem[] }) {
  const { triggerShutterFlash, boostWheel } = useMotion();
  const [filter, setFilter] = useState<"all" | DocCategory>("all");
  const [activeLightboxId, setActiveLightboxId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [timecode, setTimecode] = useState("00:00 / 00:16");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const photos = docs.filter(
    (d) => d.type === "photo" && (filter === "all" || d.cat === filter)
  );
  const totalPhotos = docs.filter((d) => d.type === "photo").length;
  const featuredVideo = docs.find((d) => d.type === "video");

  const openLightbox = (id: string) => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    triggerShutterFlash();
    boostWheel(18);
    setActiveLightboxId(id);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div id="zine-contact-sheet" className="mt-16 pt-12 border-t-2 border-[#14101C]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div>
          <div className="inline-flex flex-wrap items-center gap-2 mb-2.5">
            <span className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#14101C] text-[#92FA66] border-2 border-[#14101C]">
              🎞 ROLL 01 // ARSIP VISUAL × @BIKE2NGONTEN
            </span>
            <span className="font-stamp text-[11px] font-bold uppercase px-2 py-1 bg-[#EBE3D3] border border-[#14101C]">
              {totalPhotos} FOTO + {docs.filter((d) => d.type === "video").length} VIDEO REELS
            </span>
          </div>
          <h2 className="font-poster text-4xl sm:text-5xl uppercase text-[#14101C]">
            CONTACT SHEET &amp; STREET REELS
          </h2>
          <p className="text-sm text-[#362F42] max-w-2xl mt-2">
            Potongan nyata dari aspal Jakarta—dari barisan <em>Fixie</em> &amp;{" "}
            <em>Commuter 26&quot;</em> di rooftop, lampu merah CSW Blok M, nongkrong di KINA,
            aktivasi brand, sampai rekaman peloton melaju di Sudirman. Klik foto atau video
            untuk membuka <strong>Analog Lightbox</strong>.
          </p>
        </div>

        {/* Visual Roll Filters */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {[
            { id: "all", label: `Semua (${totalPhotos})` },
            { id: "street", label: "Street & Peloton" },
            { id: "hangout", label: "Hangout & Kafe" },
            { id: "collab", label: "Brand Collab" },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setFilter(btn.id as "all" | DocCategory)}
              className={`font-stamp text-[11px] font-bold uppercase px-3 py-1.5 border-2 border-[#14101C] transition-colors ${
                filter === btn.id
                  ? "bg-[#14101C] text-[#92FA66]"
                  : "bg-[#F5F0E6] text-[#14101C] hover:bg-[#EBE3D3]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* LEFT 5 COLS: RETRO CAMCORDER / REELS PLAYER */}
        {featuredVideo && (
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-lime overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#F5F0E6]/15 flex items-center justify-between font-stamp text-[11px] font-bold uppercase">
                <span className="inline-flex items-center gap-1.5 text-[#FF5B37]">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF5B37] rec-blink" />
                  <span>{playing ? "PLAYING // STREET REEL" : "REC // STREET REEL"}</span>
                </span>
                <span className="text-[#92FA66] tabular-nums">{timecode}</span>
              </div>

              <div
                onClick={togglePlay}
                className="relative bg-black aspect-[9/16] max-h-[540px] mx-auto w-full overflow-hidden group cursor-pointer"
              >
                <video
                  ref={videoRef}
                  src={featuredVideo.mediaUrl}
                  poster={featuredVideo.posterUrl}
                  className="w-full h-full object-cover block"
                  playsInline
                  loop
                  muted={muted}
                  preload="metadata"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 16;
                    setTimecode(`${formatTimecode(v.currentTime)} / ${formatTimecode(dur)}`);
                  }}
                />
                <div className="cam-scanlines absolute inset-0" />
                <div className="pointer-events-none absolute inset-3">
                  <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#92FA66]" />
                  <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#92FA66]" />
                  <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#92FA66]" />
                  <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#92FA66]" />
                </div>

                <div className="pointer-events-none absolute top-5 left-5 px-2 py-0.5 bg-[#14101C]/80 border border-[#92FA66]/60 font-stamp text-[10px] text-[#92FA66] uppercase">
                  {featuredVideo.location} • HD REEL
                </div>

                {!playing && (
                  <button
                    type="button"
                    aria-label="Putar Video Sudirman Peloton"
                    className="absolute inset-0 m-auto w-16 h-16 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] riso-shadow flex items-center justify-center font-poster text-2xl transition-transform hover:scale-105"
                  >
                    ▶
                  </button>
                )}

                <div className="pointer-events-none absolute bottom-5 right-5 date-stamp text-xs font-bold">
                  PEDALPOL REEL &apos;26
                </div>
              </div>

              <div className="p-4 border-t border-[#F5F0E6]/15 space-y-3">
                <div className="flex flex-wrap items-center gap-2 font-stamp text-[11px] font-bold uppercase">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="px-3 py-1.5 bg-[#92FA66] text-[#14101C] border border-[#92FA66] hover:bg-white transition-colors"
                  >
                    {playing ? "⏸ Jeda Video" : "▶ Putar Video"}
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="px-3 py-1.5 border border-[#F5F0E6]/40 text-[#F5F0E6] hover:border-[#92FA66] hover:text-[#92FA66] transition-colors"
                  >
                    {muted ? "🔇 Suara: OFF" : "🔊 Suara: ON"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openLightbox(featuredVideo.id)}
                    className="ml-auto px-3 py-1.5 border border-[#8E47EE] bg-[#8E47EE] text-white hover:bg-white hover:text-[#14101C] transition-colors"
                  >
                    ⛶ Teater
                  </button>
                </div>
                <div>
                  <div className="font-poster text-xl uppercase text-[#92FA66] leading-tight">
                    {featuredVideo.title}
                  </div>
                  <p className="text-xs text-[#D6CFE0] leading-relaxed mt-1">
                    {featuredVideo.caption}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#F5F0E6]/15 flex items-center justify-between font-stamp text-[10px] text-[#BEB5CA]">
                  <span>🎬 STREET REEL • 16 DETIK</span>
                  <span>DOKS: @PEDALPOL × @BIKE2NGONTEN</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT 7 COLS: 35MM RISOGRAPH CONTACT SHEET & ZINE CLIPPINGS */}
        <div className={featuredVideo ? "lg:col-span-7" : "lg:col-span-12"}>
          <div className="bg-[#EBE3D3] border-2 border-[#14101C] p-4 sm:p-5 halftone-corner">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-5 border-b-2 border-dashed border-[#14101C]/35 font-stamp text-[11px] font-bold uppercase">
              <span>📸 ARSIP FOTO LAPANGAN (KLIK FOTO UNTUK PERBESAR)</span>
              <span className="px-2 py-0.5 bg-[#8E47EE] text-white border border-[#14101C]">
                REAL FOOTAGE
              </span>
            </div>

            {photos.length === 0 ? (
              <div className="py-10 text-center font-stamp text-xs text-[#4B4258]">
                Belum ada foto pada kategori ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {photos.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => openLightbox(item.id)}
                    style={{
                      ["--card-tilt" as string]: item.tilt,
                      ["--tape-rot" as string]: item.tapeRot,
                    }}
                    className="zine-photo-card art-tilt relative bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow p-2.5 cursor-pointer group"
                  >
                    <div
                      className={`zine-tape ${item.tapeClass}`}
                      aria-hidden="true"
                    />
                    {/* Clean Opsi 1 Header: Location + Category */}
                    <div className="flex items-center justify-between gap-2 font-stamp text-[10px] font-bold uppercase mb-1.5 pt-1">
                      <span className="text-[#6C2BD9] truncate">📍 {item.location}</span>
                      <span className="px-1.5 py-0.5 bg-[#14101C] text-[#92FA66] text-[9px] shrink-0">
                        {item.catLabel}
                      </span>
                    </div>
                    <div className="relative aspect-[4/5] w-full overflow-hidden border-2 border-[#14101C] bg-[#14101C]">
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        loading="lazy"
                        className="zine-photo-img w-full h-full object-cover block"
                      />
                      <div className="absolute bottom-2 right-2.5 date-stamp text-[11px] font-bold pointer-events-none">
                        {item.dateStamp}
                      </div>
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#14101C]/80 text-[#F5F0E6] font-stamp text-[9px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                        🔍 Klik Perbesar
                      </div>
                    </div>
                    <div className="pt-2.5 px-0.5">
                      <h3 className="font-poster text-xl uppercase text-[#14101C] group-hover:text-[#8E47EE] transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#362F42] leading-relaxed mt-1">
                        {item.caption}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Brand Portfolio Bridge Banner */}
          <div className="mt-5 p-4 bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#D6CFE0]">
              <span className="font-stamp font-bold uppercase text-[#92FA66] block mb-0.5">
                PORTOFOLIO VISUAL UNTUK BRAND &amp; PARTNER
              </span>
              Semua foto &amp; <em>Reels</em> autentik seperti ini diproduksi organik bareng{" "}
              <strong>@pedalpol</strong>, <strong>@bikebaik.dijalan</strong> &amp;{" "}
              <strong>@bike2ngonten</strong>.
            </div>
            <Link
              href="/kolab"
              className="shrink-0 font-stamp text-[11px] font-bold uppercase px-3.5 py-2 bg-[#92FA66] text-[#14101C] border border-[#92FA66] hover:bg-white transition-colors w-fit"
            >
              Buka Halaman Kolab →
            </Link>
          </div>
        </div>
      </div>

      <DocLightbox
        items={docs}
        activeId={activeLightboxId}
        onSelect={openLightbox}
        onClose={() => setActiveLightboxId(null)}
      />
    </div>
  );
}
