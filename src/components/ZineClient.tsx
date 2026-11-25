"use client";

import Link from "next/link";
import { useState } from "react";
import { ArticleCoverArt } from "@/components/ArtIllustrations";
import { useMotion } from "@/components/MotionProvider";
import { ZineContactSheet } from "@/components/ZineContactSheet";
import type { Article, ArticleCategory, DocItem } from "@/lib/types";

const RUBRIK_FILTERS: Array<{ id: "all" | ArticleCategory; label: string }> = [
  { id: "all", label: "Semua Rubrik" },
  { id: "cerita", label: "Cerita Jalan" },
  { id: "ngelayap", label: "Catatan Ngelayap" },
  { id: "budaya", label: "Skena & Budaya" },
  { id: "bikecheck", label: "Bike Check" },
  { id: "impact", label: "Pedal for Impact" },
];

export function ZineClient({
  articles,
  docs,
}: {
  articles: Article[];
  docs: DocItem[];
}) {
  const { openStoryModal, calmMotion } = useMotion();
  const [cat, setCat] = useState<"all" | ArticleCategory>("all");

  const filtered = cat === "all" ? articles : articles.filter((a) => a.cat === cat);
  const [featured, ...rest] = filtered;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Zine Masthead */}
      <div className="border-b-2 border-[#14101C] pb-7 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <span className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] inline-block mb-3">
            MAJALAH INDIE KOMUNITAS // OPEN FOR ALL CYCLISTS
          </span>
          <h1 className="font-poster text-5xl sm:text-6xl uppercase text-[#14101C]">
            ZINE PEDALPOL
          </h1>
          <p className="text-sm sm:text-base text-[#362F42] max-w-2xl mt-2.5">
            Kumpulan catatan kecil habis <em>Rabo-Rabo</em>, liputan <em>Ngelayap</em>,
            arsip kegiatan sebelumnya, cerita <em>Bike Check</em> member, hingga kolaborasi
            budaya &amp; alam—untuk menginspirasi semua kalangan pesepeda di Indonesia.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("zine-contact-sheet");
              el?.scrollIntoView({ behavior: calmMotion ? "auto" : "smooth" });
            }}
            className="riso-shadow font-stamp text-xs font-bold uppercase px-4 py-3 bg-[#14101C] text-[#92FA66] border-2 border-[#14101C]"
          >
            🎞 Contact Sheet &amp; Reels ({docs.length})
          </button>
          <button
            type="button"
            onClick={openStoryModal}
            className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-3 bg-[#8E47EE] text-white border-2 border-[#14101C]"
          >
            ✍ Kirim Ceritamu ke Zine
          </button>
        </div>
      </div>

      {/* Rubrik Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filter rubrik zine">
        {RUBRIK_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setCat(f.id)}
            className={`font-stamp text-xs font-bold uppercase px-3.5 py-2 border-2 border-[#14101C] transition-colors ${
              cat === f.id
                ? "bg-[#14101C] text-[#92FA66]"
                : "bg-[#F5F0E6] text-[#14101C] hover:bg-[#EBE3D3]"
            }`}
          >
            {f.label}
            {f.id === "all" ? ` (${articles.length})` : ""}
          </button>
        ))}
      </div>

      {/* Featured Lead Story */}
      {featured ? (
        <div className="mb-9">
          <Link
            href={`/zine/${featured.slug}`}
            className="grid grid-cols-1 lg:grid-cols-12 bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow group overflow-hidden"
          >
            <div className="lg:col-span-6 min-h-[220px] border-b-2 lg:border-b-0 lg:border-r-2 border-[#14101C]">
              <ArticleCoverArt
                coverKey={featured.coverKey}
                coverImageUrl={featured.coverImageUrl}
                title={featured.title}
              />
            </div>
            <div className="lg:col-span-6 p-6 sm:p-7 flex flex-col justify-between bg-[#EBE3D3]/45">
              <div>
                <div className="flex flex-wrap items-center gap-2 font-stamp text-[11px] font-bold uppercase mb-3">
                  <span
                    className="px-2.5 py-1 border-2 border-[#14101C]"
                    style={{ background: featured.tagBg, color: featured.tagFg }}
                  >
                    ★ PILIHAN REDAKSI • {featured.rubrik}
                  </span>
                  <span className="text-[#5B5269]">
                    {featured.dateLabel} • {featured.readTime}
                  </span>
                </div>
                <h2 className="font-poster text-3xl sm:text-4xl uppercase text-[#14101C] group-hover:text-[#8E47EE] transition-colors mb-3">
                  {featured.title}
                </h2>
                <p className="font-editorial text-sm sm:text-base text-[#362F42] leading-relaxed mb-5">
                  {featured.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-[#14101C]/35 font-stamp text-xs font-bold uppercase">
                <span>OLEH {featured.author}</span>
                <span className="px-3 py-1.5 bg-[#14101C] text-[#92FA66]">
                  Baca Artikel →
                </span>
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <p className="font-stamp text-sm py-8">Belum ada artikel di rubrik ini.</p>
      )}

      {/* Remaining Articles Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((a) => (
            <Link
              key={a.slug}
              href={`/zine/${a.slug}`}
              className="bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow flex flex-col justify-between group overflow-hidden"
            >
              <div>
                <div className="h-40 border-b-2 border-[#14101C] overflow-hidden">
                  <ArticleCoverArt
                    coverKey={a.coverKey}
                    coverImageUrl={a.coverImageUrl}
                    title={a.title}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 font-stamp text-[10px] font-bold uppercase mb-2.5">
                    <span
                      className="px-2 py-0.5 border border-[#14101C]"
                      style={{ background: a.tagBg, color: a.tagFg }}
                    >
                      {a.rubrik}
                    </span>
                    <span className="text-[#5B5269]">{a.readTime}</span>
                  </div>
                  <h3 className="font-poster text-2xl uppercase text-[#14101C] group-hover:text-[#8E47EE] transition-colors mb-2.5">
                    {a.title}
                  </h3>
                  <p className="text-sm text-[#362F42] leading-relaxed mb-3">
                    {a.excerpt}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 bg-[#EBE3D3] border-t-2 border-[#14101C] flex items-center justify-between font-stamp text-[11px] font-bold">
                <span>
                  {a.dateLabel} • 👏 {a.applause}
                </span>
                <span className="text-[#6C2BD9]">Baca →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Real Photo & Video Contact Sheet */}
      <ZineContactSheet docs={docs} />
    </div>
  );
}
