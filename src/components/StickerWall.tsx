"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/MotionProvider";

interface SpawnedSticker {
  id: string;
  left: number;
  top: number;
  rot: number;
  img?: string;
  caption?: string;
  label?: string;
  sub?: string;
  bg?: string;
  fg?: string;
}

const EXTRA_TEMPLATES: Array<
  | { img: string; caption: string }
  | { label: string; sub: string; bg: string; fg: string }
> = [
  { img: "/logos/bike2ngonten.webp", caption: "@bike2ngonten" },
  { img: "/logos/bikebaik.webp", caption: "@bikebaik.dijalan" },
  { label: "PEDALPOL ZINE", sub: "CERITA PESEPEDA ID", bg: "#92FA66", fg: "#14101C" },
  { label: "NGELAYAP TEAM", sub: "KABUR DARI KANTOR", bg: "#8E47EE", fg: "#FFFFFF" },
  { label: "MENYAPA MUSEUM", sub: "CULTURAL RIDE JKT", bg: "#FF5B37", fg: "#FFFFFF" },
  { label: "BRICK SESSION", sub: "× @PEGIPEDA", bg: "#14101C", fg: "#92FA66" },
];

export function HomeHero() {
  const { cadenceRpm, boostWheel } = useMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [spawned, setSpawned] = useState<SpawnedSticker[]>([]);
  const spawnIdxRef = useRef(0);
  const [resetKey, setResetKey] = useState(0);

  const attachDrag = useCallback((el: HTMLDivElement | null) => {
    if (!el || el.dataset.dragBound === "1") return;
    el.dataset.dragBound = "1";
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    el.addEventListener("pointerdown", (e) => {
      dragging = true;
      el.classList.add("is-dragging");
      el.classList.remove("animate-float", "animate-float-delay");
      el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseFloat(el.style.left) || 0;
      origTop = parseFloat(el.style.top) || 0;
    });

    el.addEventListener("pointermove", (e) => {
      if (!dragging || !stageRef.current) return;
      const maxLeft = stageRef.current.clientWidth - el.offsetWidth;
      const maxTop = stageRef.current.clientHeight - el.offsetHeight;
      el.style.left = `${Math.max(-10, Math.min(maxLeft + 10, origLeft + (e.clientX - startX)))}px`;
      el.style.top = `${Math.max(30, Math.min(maxTop + 6, origTop + (e.clientY - startY)))}px`;
    });

    const stop = () => {
      dragging = false;
      el.classList.remove("is-dragging");
    };
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointercancel", stop);
  }, []);

  // Clamp stickers on mobile viewport resize
  useEffect(() => {
    const clamp = () => {
      const stage = stageRef.current;
      if (!stage || !stage.clientWidth) return;
      const stageW = stage.clientWidth;
      const stageH = stage.clientHeight;
      stage.querySelectorAll<HTMLElement>(".sticker-item").forEach((el) => {
        const curLeft = parseFloat(el.style.left) || 0;
        const curTop = parseFloat(el.style.top) || 44;
        const maxLeft = Math.max(8, stageW - el.offsetWidth - 8);
        const maxTop = Math.max(40, stageH - el.offsetHeight - 28);
        el.style.left = `${Math.max(8, Math.min(maxLeft, curLeft))}px`;
        el.style.top = `${Math.max(40, Math.min(maxTop, curTop))}px`;
      });
    };
    requestAnimationFrame(clamp);
    window.addEventListener("resize", clamp, { passive: true });
    return () => window.removeEventListener("resize", clamp);
  }, [resetKey, spawned.length]);

  const handleSpawn = () => {
    const stage = stageRef.current;
    const tpl = EXTRA_TEMPLATES[spawnIdxRef.current++ % EXTRA_TEMPLATES.length];
    const w = stage?.clientWidth || 360;
    const h = stage?.clientHeight || 380;
    const next: SpawnedSticker = {
      id: `stk-${Date.now()}-${spawnIdxRef.current}`,
      left: Math.floor(24 + Math.random() * Math.max(80, w - 170)),
      top: Math.floor(54 + Math.random() * Math.max(80, h - 140)),
      rot: Number((Math.random() * 16 - 8).toFixed(1)),
      ...tpl,
    };
    setSpawned((prev) => [...prev, next]);
    boostWheel(26);
  };

  const handleReset = () => {
    setSpawned([]);
    setResetKey((k) => k + 1);
  };

  return (
    <section className="relative overflow-hidden border-b-2 border-[#14101C]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12 md:pt-12 md:pb-16 relative">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-7 border-b-2 border-dashed border-[#14101C]/35 font-stamp text-xs uppercase text-[#4B4258]">
          <span>SEPERTI CLUB-CLUB SEPEDA (@PEDALPOL) // MENTENG, JAKARTA</span>
          <span className="flex items-center gap-2">
            <span>CADENCE:</span>
            <strong className="px-2 py-0.5 bg-[#14101C] text-[#92FA66] tabular-nums">
              {cadenceRpm} RPM
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 relative z-10">
            <p className="font-stamp text-xs sm:text-sm font-bold uppercase tracking-widest text-[#6C2BD9] mb-3">
              MENTENG, JAKARTA PUSAT // FIXIE • GRAVEL • ROAD • COMMUTER 26&quot;
            </p>
            <h1 className="font-poster text-[42px] sm:text-6xl md:text-[68px] uppercase text-[#14101C] tracking-tight mb-5">
              BUDAK KORPORAT
              <br />
              <span className="inline-block bg-[#92FA66] px-2.5 py-0.5 border-2 border-[#14101C] -rotate-1 my-1">
                MELARIKAN DIRI
              </span>
              <br />
              LEWAT JALUR SEPEDA.
            </h1>
            <p className="text-base text-[#362F42] max-w-xl leading-relaxed mb-7">
              Ruang cerita, arsip rute, dan rumah digital 50–100+ pesepeda lintas genre.
              Dari <strong>Raboo-Raboo</strong> malam hari, <strong>Sporty Edition</strong>{" "}
              Sabtu, <strong>Sunday Morning Pol</strong>, sampai catatan{" "}
              <strong>Ngelayap</strong> untuk menginspirasi pesepeda di seluruh Indonesia.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/zine"
                onClick={() => boostWheel(20)}
                className="riso-shadow font-stamp text-xs sm:text-sm font-bold uppercase px-5 py-3 bg-[#8E47EE] text-white border-2 border-[#14101C]"
              >
                Baca Zine PedalPol →
              </Link>
              <Link
                href="/agenda"
                onClick={() => boostWheel(20)}
                className="riso-shadow font-stamp text-xs sm:text-sm font-bold uppercase px-5 py-3 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C]"
              >
                Upcoming Agenda
              </Link>
              <button
                type="button"
                onClick={handleSpawn}
                className="font-stamp text-xs font-bold uppercase px-4 py-3 border-2 border-[#14101C] bg-transparent hover:bg-[#14101C] hover:text-[#F5F0E6] transition-colors"
              >
                + Tempel Stiker
              </button>
            </div>
          </div>

          {/* Interactive Sticker Wall */}
          <div className="lg:col-span-5">
            <div
              key={resetKey}
              ref={stageRef}
              className="relative w-full h-[380px] sm:h-[405px] bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow overflow-hidden halftone-corner"
            >
              <div className="absolute top-0 inset-x-0 px-3.5 py-2 bg-[#14101C] text-[#F5F0E6] font-stamp text-[11px] uppercase flex items-center justify-between z-20">
                <span>ZINE STICKER WALL — GESER STIKER!</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[#92FA66] hover:underline"
                >
                  Reset
                </button>
              </div>

              <svg
                id="kinetic-wheel"
                viewBox="0 0 260 260"
                className="absolute -right-14 -bottom-14 w-64 h-64 opacity-25 pointer-events-none"
                aria-hidden="true"
              >
                <circle cx="130" cy="130" r="118" fill="none" stroke="#14101C" strokeWidth="10" />
                <circle
                  cx="130"
                  cy="130"
                  r="105"
                  fill="none"
                  stroke="#8E47EE"
                  strokeWidth="3"
                  strokeDasharray="14 8"
                />
                <circle cx="130" cy="130" r="20" fill="#14101C" />
                <circle cx="130" cy="130" r="8" fill="#92FA66" />
                <g stroke="#14101C" strokeWidth="2">
                  <line x1="130" y1="18" x2="130" y2="242" />
                  <line x1="18" y1="130" x2="242" y2="130" />
                  <line x1="51" y1="51" x2="209" y2="209" />
                  <line x1="209" y1="51" x2="51" y2="209" />
                  <line x1="88" y1="26" x2="172" y2="234" />
                  <line x1="26" y1="88" x2="234" y2="172" />
                  <line x1="172" y1="26" x2="88" y2="234" />
                  <line x1="234" y1="88" x2="26" y2="172" />
                </g>
              </svg>

              {/* Sticker 1: REAL SUNDAY MORNING POL transparent artwork */}
              <div
                ref={attachDrag}
                className="sticker-item animate-float absolute"
                style={{
                  left: "18px",
                  top: "48px",
                  ["--rot" as string]: "-3deg",
                }}
              >
                <img
                  src="/logos/sunday-morning-pol.webp"
                  alt="Stiker Sunday Morning Pol"
                  draggable={false}
                  className="w-40 sm:w-44 h-auto select-none pointer-events-none"
                />
              </div>

              {/* Sticker 2: REAL OFFICIAL PEDAL POL Logo */}
              <div
                ref={attachDrag}
                className="sticker-item animate-float-delay absolute"
                style={{
                  left: "152px",
                  top: "186px",
                  ["--rot" as string]: "3deg",
                }}
              >
                <img
                  src="/logos/pedalpol-logo.webp"
                  alt="Stiker Logo Resmi Pedal Pol"
                  draggable={false}
                  className="w-40 sm:w-44 h-auto select-none pointer-events-none drop-shadow-[3px_4px_0_#14101C]"
                />
              </div>

              {/* Sticker 3: RABOO-RABOO */}
              <div
                ref={attachDrag}
                className="sticker-item absolute"
                style={{ left: "22px", top: "260px", transform: "rotate(-6deg)" }}
              >
                <div className="px-3.5 py-2 bg-[#14101C] text-[#92FA66] border-2 border-white font-stamp text-xs font-bold uppercase shadow-md">
                  <div>★ RABOO-RABOO</div>
                  <div className="text-[10px] text-[#F5F0E6]">NIGHT RIDE • MENTENG</div>
                </div>
              </div>

              {/* Sticker 4: FOR REST FOREST */}
              <div
                ref={attachDrag}
                className="sticker-item absolute"
                style={{ left: "212px", top: "56px", transform: "rotate(8deg)" }}
              >
                <svg
                  width="102"
                  height="102"
                  viewBox="0 0 110 110"
                  aria-label="Stamp For Rest Forest"
                >
                  <circle cx="55" cy="55" r="50" fill="#176B3F" stroke="#FFFFFF" strokeWidth="4" />
                  <circle
                    cx="55"
                    cy="55"
                    r="42"
                    fill="none"
                    stroke="#92FA66"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M55 24 L37 58 L48 58 L41 75 L69 75 L62 58 L73 58 Z"
                    fill="#92FA66"
                  />
                  <rect x="52" y="75" width="6" height="11" fill="#F5F0E6" />
                  <text
                    x="55"
                    y="96"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="monospace"
                    fontSize="8.5"
                    fontWeight="bold"
                  >
                    FOR REST FOREST
                  </text>
                </svg>
              </div>

              {/* Spawned extra stickers */}
              {spawned.map((stk) => (
                <div
                  key={stk.id}
                  ref={attachDrag}
                  className="sticker-item absolute"
                  style={{
                    left: `${stk.left}px`,
                    top: `${stk.top}px`,
                    transform: `rotate(${stk.rot}deg)`,
                  }}
                >
                  {stk.img ? (
                    <div
                      className="p-1.5 bg-white border-2 border-[#14101C]"
                      style={{ boxShadow: "4px 4px 0 #14101C" }}
                    >
                      <img
                        src={stk.img}
                        alt={stk.caption || "Stiker komunitas"}
                        className="w-20 h-20 object-cover block border border-[#14101C]"
                        draggable={false}
                      />
                      <div className="font-stamp text-[9px] font-bold text-center text-[#14101C] mt-1">
                        {stk.caption}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="px-3.5 py-2 border-2 border-[#14101C] font-stamp text-xs font-bold uppercase"
                      style={{
                        background: stk.bg,
                        color: stk.fg,
                        boxShadow: "3px 3px 0 #14101C",
                      }}
                    >
                      <div>✦ {stk.label}</div>
                      <div className="text-[10px] opacity-85">{stk.sub}</div>
                    </div>
                  )}
                </div>
              ))}

              <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                <span className="font-stamp text-[11px] font-bold bg-[#F5F0E6]/90 px-2 py-0.5 border border-[#14101C]">
                  DRAG &amp; SUSUN STIKER
                </span>
                <span className="font-stamp text-[11px] font-bold bg-[#92FA66] px-2 py-0.5 border border-[#14101C]">
                  {4 + spawned.length} STIKER
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kinetic Marquee */}
      <div className="marquee-wrap border-t-2 border-[#14101C] bg-[#14101C] text-[#92FA66] py-3 overflow-hidden">
        <div className="marquee-track font-poster text-xl sm:text-2xl uppercase tracking-wide">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              <span className="mx-4">ZINE PEDALPOL</span>
              <span className="text-[#8E47EE]">✦</span>
              <span className="mx-4">RABOO-RABOO NIGHT RIDE</span>
              <span className="text-[#F5F0E6]">✦</span>
              <span className="mx-4">PEDALPOL SPORTY EDITION</span>
              <span className="text-[#8E47EE]">✦</span>
              <span className="mx-4">SUNDAY MORNING POL</span>
              <span className="text-[#F5F0E6]">✦</span>
              <span className="mx-4">NGELAYAP LONG RIDE</span>
              <span className="text-[#8E47EE]">✦</span>
              <span className="mx-4">FOR REST FOREST × LINDUNGIHUTAN</span>
              <span className="text-[#F5F0E6]">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
