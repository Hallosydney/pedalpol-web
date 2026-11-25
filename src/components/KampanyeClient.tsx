"use client";

import Link from "next/link";
import { useState } from "react";
import { useMotion } from "@/components/MotionProvider";

interface TreeNode {
  id: string;
  x: number;
  y: number;
  scale: number;
  color: string;
}

const INITIAL_TREES: TreeNode[] = [
  { id: "t1", x: 42, y: 175, scale: 0.95, color: "#1D8B4E" },
  { id: "t2", x: 96, y: 166, scale: 1.12, color: "#176B3F" },
  { id: "t3", x: 152, y: 165, scale: 1.0, color: "#2CC46C" },
  { id: "t4", x: 212, y: 174, scale: 1.18, color: "#176B3F" },
  { id: "t5", x: 280, y: 173, scale: 0.94, color: "#1D8B4E" },
  { id: "t6", x: 348, y: 169, scale: 1.12, color: "#2CC46C" },
  { id: "t7", x: 422, y: 171, scale: 1.02, color: "#176B3F" },
];

export function KampanyeClient({ initialTreeCount }: { initialTreeCount: number }) {
  const { boostWheel } = useMotion();
  const [treeCount, setTreeCount] = useState(initialTreeCount);
  const [trees, setTrees] = useState<TreeNode[]>(INITIAL_TREES);
  const [busy, setBusy] = useState(false);

  const plantTrees = async (amount: number) => {
    setTreeCount((c) => c + amount);
    boostWheel(18);
    const colors = ["#176B3F", "#1D8B4E", "#2CC46C", "#92FA66"];
    setTrees((prev) => {
      const next = [...prev];
      for (let i = 0; i < Math.min(amount, 5); i++) {
        if (next.length >= 28) break;
        next.push({
          id: `t-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
          x: Math.round(24 + Math.random() * 452),
          y: Math.round(160 + Math.random() * 18),
          scale: Number((0.72 + Math.random() * 0.55).toFixed(2)),
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      return next;
    });

    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.treeCount === "number") setTreeCount(data.treeCount);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-[#143B28] text-[#F5F0E6] relative overflow-hidden">
      <div className="halftone-lime absolute inset-0 pointer-events-none opacity-40" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 font-stamp text-xs font-bold uppercase px-3 py-1 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] mb-4">
              <span>PEDAL FOR IMPACT</span>
              <span>•</span>
              <span>× LINDUNGIHUTAN</span>
            </div>
            <h1 className="font-poster text-5xl sm:text-6xl uppercase leading-none mb-4">
              FOR REST <span className="text-[#92FA66]">FOREST.</span>
            </h1>
            <p className="font-stamp text-sm text-[#C6FF8E] uppercase mb-4">
              &quot;Dari setiap kayuhan, tumbuh kepedulian untuk menjaga hutan Indonesia.&quot;
            </p>
            <p className="text-sm sm:text-base text-[#E2EFE7] leading-relaxed mb-6">
              Berbasis di kawasan Menteng, Jakarta Pusat, PedalPol berkolaborasi bersama{" "}
              <strong>LindungiHutan</strong> mengajak sesama anggota dan jejaring pesepeda ikut
              donasi pohon. Karena pesepeda bukan cuma soal kilometer, tapi juga menjaga udara
              yang kita hirup tiap hari.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://lindungihutan.com/pedalhijauuntukbumi"
                target="_blank"
                rel="noopener noreferrer"
                className="riso-shadow-lime font-stamp text-xs font-bold uppercase px-4 py-3 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C]"
              >
                Kampanye Community ↗
              </a>
              <a
                href="https://lindungihutan.com/pedalhijauuntukbumi2"
                target="_blank"
                rel="noopener noreferrer"
                className="font-stamp text-xs font-bold uppercase px-4 py-3 bg-transparent text-[#F5F0E6] border-2 border-[#92FA66] hover:bg-[#92FA66] hover:text-[#14101C] transition-colors"
              >
                Kampanye Ambassador ↗
              </a>
            </div>
          </div>

          {/* Live Tree Simulator */}
          <div className="lg:col-span-6">
            <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow-lime p-5">
              <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-[#14101C]">
                <div>
                  <div className="font-stamp text-[11px] font-bold uppercase text-[#176B3F]">
                    INTERACTIVE ART SIMULATOR
                  </div>
                  <div className="font-poster text-2xl uppercase">KAYUH → TANAM POHON</div>
                </div>
                <div className="text-right">
                  <div className="font-poster text-3xl text-[#176B3F] tabular-nums leading-none">
                    {treeCount}
                  </div>
                  <div className="font-stamp text-[11px] uppercase">Pohon Ditanam</div>
                </div>
              </div>

              <div className="relative w-full h-56 bg-[#E6F4E8] border-2 border-[#14101C] overflow-hidden mb-4">
                <svg
                  viewBox="0 0 500 220"
                  className="w-full h-full"
                  aria-label="Ilustrasi Hutan Interaktif"
                >
                  <circle cx="430" cy="48" r="28" fill="#92FA66" stroke="#14101C" strokeWidth="2.5" />
                  <path
                    d="M 0,185 Q 130,152 260,178 T 500,168 L 500,220 L 0,220 Z"
                    fill="#176B3F"
                    stroke="#14101C"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 0,206 Q 150,182 285,196 T 500,188"
                    fill="none"
                    stroke="#F5F0E6"
                    strokeWidth="8"
                  />
                  <path
                    className="road-dash"
                    d="M 0,206 Q 150,182 285,196 T 500,188"
                    fill="none"
                    stroke="#14101C"
                    strokeWidth="2"
                    strokeDasharray="10 10"
                  />
                  <g>
                    {trees.map((t) => (
                      <g key={t.id} transform={`translate(${t.x}, ${t.y}) scale(${t.scale})`}>
                        <g className="tree-pop">
                          <rect
                            x="-3.5"
                            y="-14"
                            width="7"
                            height="16"
                            fill="#4A2E1B"
                            stroke="#14101C"
                            strokeWidth="1.5"
                          />
                          <polygon
                            points="0,-62 -18,-28 -8,-28 -22,-10 22,-10 8,-28 18,-28"
                            fill={t.color}
                            stroke="#14101C"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </g>
                      </g>
                    ))}
                  </g>
                </svg>
                <div className="absolute top-2.5 left-2.5 bg-[#14101C] text-[#92FA66] font-stamp text-[11px] px-2.5 py-1">
                  EST. SERAPAN CO₂:{" "}
                  <span className="tabular-nums font-bold">
                    {(treeCount * 22).toLocaleString("id-ID")}
                  </span>{" "}
                  KG/THN
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => plantTrees(1)}
                    className="riso-shadow font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#176B3F] text-[#92FA66] border-2 border-[#14101C]"
                  >
                    + Tanam 1 Pohon
                  </button>
                  <button
                    type="button"
                    onClick={() => plantTrees(5)}
                    className="font-stamp text-xs font-bold uppercase px-3.5 py-2.5 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] hover:bg-[#8E47EE] hover:text-white transition-colors"
                  >
                    +5 Pohon
                  </button>
                </div>
                <Link
                  href="/zine/for-rest-forest"
                  className="font-stamp text-[11px] font-bold uppercase underline text-[#176B3F]"
                >
                  Baca Jurnal Kampanye →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Other Cultural & Community Campaigns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 border-t border-[#92FA66]/35">
          <div className="p-5 bg-[#0E291C]/85 border-2 border-[#92FA66]/50">
            <div className="font-stamp text-xs text-[#92FA66] uppercase font-bold mb-2">
              TUR BUDAYA • SEPT 2026
            </div>
            <h3 className="font-poster text-2xl uppercase mb-2">MENYAPA MUSEUM</h3>
            <p className="text-sm text-[#CBE2D4] mb-4">
              Tur sepeda sejarah bersama Museum Kebangkitan Nasional, mendekatkan ruang sejarah
              Jakarta ke generasi pesepeda urban.
            </p>
            <Link
              href="/zine/menyapa-museum"
              className="font-stamp text-xs text-[#92FA66] underline uppercase"
            >
              Baca Liputannya →
            </Link>
          </div>
          <div className="p-5 bg-[#0E291C]/85 border-2 border-[#92FA66]/50">
            <div className="font-stamp text-xs text-[#92FA66] uppercase font-bold mb-2">
              CROSS-SPORT COLLAB
            </div>
            <h3 className="font-poster text-2xl uppercase mb-2">
              BRICK SESSION × @PEGIPEDA
            </h3>
            <p className="text-sm text-[#CBE2D4] mb-4">
              Latihan kombinasi bersepeda dan lari lintas komunitas untuk membangun gaya hidup
              aktif &amp; solid.
            </p>
            <Link
              href="/agenda"
              className="font-stamp text-xs text-[#92FA66] underline uppercase"
            >
              Lihat Jadwal Sabtu →
            </Link>
          </div>
          <div className="p-5 bg-[#0E291C]/85 border-2 border-[#92FA66]/50">
            <div className="font-stamp text-xs text-[#92FA66] uppercase font-bold mb-2">
              SOLIDARITAS SKENA
            </div>
            <h3 className="font-poster text-2xl uppercase mb-2">COMMUNITY DAY 2026</h3>
            <p className="text-sm text-[#CBE2D4] mb-4">
              Temu kumpul lintas komunitas, pameran sepeda member, dan dukungan penuh untuk acara
              komunitas sepeda sahabat.
            </p>
            <Link
              href="/kolab"
              className="font-stamp text-xs text-[#92FA66] underline uppercase"
            >
              Undang PedalPol →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
