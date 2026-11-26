import Link from "next/link";
import { AllBikesDeck } from "@/components/AllBikesDeck";
import { ArticleCoverArt } from "@/components/ArtIllustrations";
import { HomeFilmstrip } from "@/components/HomeFilmstrip";
import { HomeHero } from "@/components/StickerWall";
import { getViewerRiderTokenHash } from "@/lib/auth";
import { listArticles, listDocItems, listRidesForViewer } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const viewerHash = await getViewerRiderTokenHash();
  const [rides, articles, docs] = await Promise.all([
    listRidesForViewer(viewerHash),
    listArticles(),
    listDocItems(),
  ]);

  const nextRide = rides.find((r) => r.status === "upcoming") || null;

  return (
    <>
      <HomeHero />

      {/* Home Highlight 0: Next Upcoming Ride Strip */}
      {nextRide && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
          <div className="bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-lime p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="shrink-0 px-3 py-2 bg-[#92FA66] text-[#14101C] border-2 border-[#92FA66] font-stamp text-center">
                <div className="text-[10px] font-bold uppercase">UPCOMING</div>
                <div className="font-poster text-2xl leading-none">
                  {nextRide.dateBadge.split(",")[1]?.trim().slice(0, 6) || "NEXT"}
                </div>
              </div>
              <div>
                <div className="font-stamp text-[11px] uppercase text-[#92FA66] font-bold">
                  NEXT RIDE TERDEKAT • {nextRide.riders.length} RIDERS MERAPAT
                </div>
                <div className="font-poster text-2xl sm:text-3xl uppercase">
                  {nextRide.title}
                </div>
                <div className="font-stamp text-xs text-[#D6CFE0]">
                  {nextRide.schedule} • {nextRide.tikum} • {nextRide.bikes}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href={`/agenda?ride=${encodeURIComponent(nextRide.id)}`}
                className="font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#92FA66] text-[#14101C] hover:bg-white transition-colors"
              >
                Gas Join! →
              </Link>
              <Link
                href="/agenda?tab=archive"
                className="font-stamp text-xs font-bold uppercase px-3.5 py-2.5 border border-[#F5F0E6]/45 text-[#F5F0E6] hover:border-[#92FA66] hover:text-[#92FA66] transition-colors"
              >
                Arsip Buletin
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Home Highlight 0.5: Kinetic Trio Culture-Art Collective */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow p-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="font-stamp text-[11px] font-bold uppercase text-[#14101C] flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#8E47EE] text-white border border-[#14101C]">
                3 KOMUNITAS GANDENG
              </span>
              <span>CULTURE ART &amp; CYCLING COLLECTIVE</span>
            </div>
            <Link
              href="/kolab"
              className="font-stamp text-[11px] font-bold uppercase underline text-[#6C2BD9] hover:text-[#14101C] w-fit"
            >
              Lihat Portofolio Brand &amp; Media Kit →
            </Link>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <svg
              viewBox="0 0 800 30"
              className="hidden sm:block absolute inset-x-10 top-1/2 -translate-y-1/2 w-[calc(100%-5rem)] h-6 pointer-events-none opacity-65"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="15"
                x2="800"
                y2="15"
                stroke="#14101C"
                strokeWidth="3"
                strokeDasharray="10 6"
                className="chain-link"
              />
            </svg>

            <a
              href="https://www.instagram.com/pedalpol/"
              target="_blank"
              rel="noopener noreferrer"
              className="art-tilt relative z-10 flex items-center gap-3.5 p-3 bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow"
            >
              <img
                src="/logos/pedalpol.webp"
                alt="Logo PedalPol"
                className="w-14 h-14 object-cover border-2 border-[#14101C] shrink-0 bg-[#8E47EE]"
              />
              <div className="min-w-0">
                <div className="font-stamp text-[10px] font-bold uppercase text-[#6C2BD9]">
                  COMMUNITY &amp; ZINE
                </div>
                <div className="font-poster text-xl uppercase leading-tight truncate">
                  PEDALPOL
                </div>
                <div className="font-stamp text-[11px] text-[#4B4258] truncate">
                  @pedalpol ↗
                </div>
              </div>
            </a>

            <a
              href="https://www.instagram.com/bikebaik.dijalan/"
              target="_blank"
              rel="noopener noreferrer"
              className="art-tilt relative z-10 flex items-center gap-3.5 p-3 bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow"
            >
              <img
                src="/logos/bikebaik.webp"
                alt="Logo BikeBaik di Jalan"
                className="w-14 h-14 object-cover border-2 border-[#14101C] shrink-0 bg-[#19498A]"
              />
              <div className="min-w-0">
                <div className="font-stamp text-[10px] font-bold uppercase text-[#19498A]">
                  STREET &amp; ROAD CULTURE
                </div>
                <div className="font-poster text-xl uppercase leading-tight truncate">
                  BIKEBAIK DIJALAN
                </div>
                <div className="font-stamp text-[11px] text-[#4B4258] truncate">
                  @bikebaik.dijalan ↗
                </div>
              </div>
            </a>

            <a
              href="https://www.instagram.com/bike2ngonten/"
              target="_blank"
              rel="noopener noreferrer"
              className="art-tilt relative z-10 flex items-center gap-3.5 p-3 bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow"
            >
              <img
                src="/logos/bike2ngonten.webp"
                alt="Logo Bike2Ngonten"
                className="w-14 h-14 object-cover border-2 border-[#14101C] shrink-0 bg-[#FAD1D8]"
              />
              <div className="min-w-0">
                <div className="font-stamp text-[10px] font-bold uppercase text-[#D9467A]">
                  CREATOR &amp; DOCS
                </div>
                <div className="font-poster text-xl uppercase leading-tight truncate">
                  BIKE2NGONTEN
                </div>
                <div className="font-stamp text-[11px] text-[#4B4258] truncate">
                  @bike2ngonten ↗
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Home Highlight 0.8: Kinetic 35mm Filmstrip Teaser (Real Photo & Video Docs) */}
      <HomeFilmstrip docs={docs} />

      {/* Home Highlight 1: Cerita Terbaru dari Zine */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-b-2 border-[#14101C]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <span className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#8E47EE] text-white border-2 border-[#14101C] inline-block mb-2.5">
              BARU DI ZINE PEDALPOL
            </span>
            <h2 className="font-poster text-4xl uppercase text-[#14101C]">
              CERITA DARI JALUR SEPEDA
            </h2>
          </div>
          <Link
            href="/zine"
            className="font-stamp text-xs font-bold uppercase px-4 py-2 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#92FA66] transition-colors w-fit"
          >
            Lihat Semua Zine ({articles.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((a) => (
            <Link
              key={a.slug}
              href={`/zine/${a.slug}`}
              className="bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow flex flex-col justify-between group overflow-hidden"
            >
              <div>
                <div className="h-36 border-b-2 border-[#14101C] overflow-hidden">
                  <ArticleCoverArt
                    coverKey={a.coverKey}
                    coverImageUrl={a.coverImageUrl}
                    title={a.title}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2 font-stamp text-[10px] font-bold uppercase">
                    <span
                      className="px-2 py-0.5 border border-[#14101C]"
                      style={{ background: a.tagBg, color: a.tagFg }}
                    >
                      {a.rubrik}
                    </span>
                    <span className="text-[#5B5269]">{a.readTime}</span>
                  </div>
                  <h3 className="font-poster text-xl uppercase text-[#14101C] group-hover:text-[#8E47EE] transition-colors leading-snug mb-2">
                    {a.title}
                  </h3>
                  <p className="text-xs text-[#362F42] leading-relaxed">{a.excerpt}</p>
                </div>
              </div>
              <div className="px-4 py-2.5 bg-[#EBE3D3] border-t-2 border-[#14101C] flex items-center justify-between font-stamp text-[11px] font-bold">
                <span>{a.dateLabel}</span>
                <span className="text-[#6C2BD9]">Baca →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Home Highlight 2: All Bikes Art Deck */}
      <AllBikesDeck />
    </>
  );
}
