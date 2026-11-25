"use client";

import Link from "next/link";
import { useState } from "react";
import { DocLightbox } from "@/components/DocLightbox";
import { useMotion } from "@/components/MotionProvider";
import type { DocItem } from "@/lib/types";

export function HomeFilmstrip({ docs }: { docs: DocItem[] }) {
  const { triggerShutterFlash, boostWheel } = useMotion();
  const [activeId, setActiveId] = useState<string | null>(null);

  const openLightbox = (id: string) => {
    triggerShutterFlash();
    boostWheel(18);
    setActiveId(id);
  };

  if (!docs.length) return null;

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <div className="bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-purple overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#F5F0E6]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 font-stamp text-[11px] font-bold uppercase">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FF5B37] text-white">
                <span className="w-2 h-2 rounded-full bg-white rec-blink" /> ROLL 01 • LIVE DOCS
              </span>
              <span className="text-[#92FA66]">
                35MM CONTACT SHEET &amp; REELS × @BIKE2NGONTEN
              </span>
            </div>
            <Link
              href="/zine#zine-contact-sheet"
              className="font-stamp text-[11px] font-bold uppercase text-[#92FA66] hover:text-white underline text-left sm:text-right w-fit"
            >
              Buka Galeri Penuh &amp; Video di Zine ({docs.length}) →
            </Link>
          </div>
          <div className="film-sprockets" aria-hidden="true" />
          <div className="film-reel-wrap overflow-hidden py-3.5 px-2 bg-[#14101C]">
            <div className="film-reel-track">
              {[0, 1].map((dup) =>
                docs.map((item) => {
                  const thumb =
                    item.type === "video"
                      ? item.posterUrl || item.mediaUrl
                      : item.mediaUrl;
                  return (
                    <button
                      key={`${dup}-${item.id}`}
                      type="button"
                      onClick={() => openLightbox(item.id)}
                      className="film-frame-btn group relative w-44 sm:w-52 shrink-0 bg-[#1E1928] border-2 border-[#F5F0E6]/25 hover:border-[#92FA66] overflow-hidden text-left transition-colors focus:outline-none"
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                        <img
                          src={thumb}
                          alt={item.title}
                          loading="lazy"
                          className="zine-photo-img w-full h-full object-cover block"
                        />
                        {item.type === "video" ? (
                          <>
                            <span className="absolute inset-0 m-auto w-11 h-11 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] flex items-center justify-center font-poster text-lg group-hover:scale-110 transition-transform">
                              ▶
                            </span>
                            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-[#FF5B37] text-white font-stamp text-[9px] font-bold uppercase">
                              ● REEL 0:16
                            </span>
                          </>
                        ) : (
                          <span className="absolute bottom-2 right-2 date-stamp text-[10px] font-bold">
                            {item.dateStamp}
                          </span>
                        )}
                      </div>
                      <div className="px-2.5 py-2 border-t border-[#F5F0E6]/15">
                        <div className="font-stamp text-[9px] text-[#92FA66] uppercase truncate">
                          {item.location}
                        </div>
                        <div className="font-poster text-sm uppercase text-[#F5F0E6] truncate group-hover:text-[#92FA66] transition-colors">
                          {item.title}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <div className="film-sprockets" aria-hidden="true" />
        </div>
      </section>

      <DocLightbox
        items={docs}
        activeId={activeId}
        onSelect={openLightbox}
        onClose={() => setActiveId(null)}
      />
    </>
  );
}
