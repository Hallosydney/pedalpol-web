"use client";

import { useState } from "react";
import { useMotion } from "@/components/MotionProvider";

type BikeKey = "fixie" | "gravel" | "road" | "commuter";

const BIKES: Record<
  BikeKey,
  {
    tab: string;
    tag: string;
    wheelBadge: string;
    vibe: string;
    title: string;
    quote: string;
    desc: string;
    bestFor: string;
    stats: [number, number, number];
    tireWidth: number;
    rimColor: string;
    barPath: string;
    showBag: boolean;
    showCommuter: boolean;
    wheelTransform: string;
    framePoints: string;
    forkY2: number;
  }
> = {
  fixie: {
    tab: "Fixie",
    tag: "SPEC SHEET // FIXED GEAR",
    wheelBadge: "BAN 700C",
    vibe: "RABOO-RABOO FAVORITE",
    title: "FIXED GEAR / FIXIE",
    quote: '"Simpel, lincah, dan selalu bikin Raboo-Raboo kerasa hidup."',
    desc: "Primadona skena malam Menteng–Sudirman. Tanpa operan gigi ribet, langsung nyatu sama jalanan kota. Cocok banget buat Raboo-Raboo, Sunday Morning Pol, sampai strolling bareng brand.",
    bestFor: "Raboo-Raboo • Sunday Morning Pol • Menyapa Museum",
    stats: [98, 68, 82],
    tireWidth: 9,
    rimColor: "#8E47EE",
    barPath: "M 309,62 L 335,62 C 352,62 356,88 336,92",
    showBag: false,
    showCommuter: false,
    wheelTransform: "translate(0px, 0px) scale(1)",
    framePoints: "112,168 182,82 316,84 218,168",
    forkY2: 168,
  },
  gravel: {
    tab: "Gravel",
    tag: "SPEC SHEET // GRAVEL ADVENTURE",
    wheelBadge: "BAN 700C / 650B",
    vibe: "NGELAYAP READY",
    title: "GRAVEL BIKE",
    quote: '"Dari aspal Menteng langsung kabur ke jalur tanah tanpa mikir panjang."',
    desc: "Ban lebar, frame bag siap logistik, nyaman buat segala medan. Jagoan utama waktu PedalPol bikin agenda jauh Ngelayap, eksplorasi jalur pinggir kota, atau bikepacking santai.",
    bestFor: "Ngelayap Long Ride • Sunday Morning Pol • Strolling",
    stats: [88, 99, 80],
    tireWidth: 13,
    rimColor: "#176B3F",
    barPath: "M 309,62 L 338,60 C 356,60 364,86 342,96",
    showBag: true,
    showCommuter: false,
    wheelTransform: "translate(0px, 0px) scale(1)",
    framePoints: "112,168 182,82 316,84 218,168",
    forkY2: 168,
  },
  road: {
    tab: "Road Bike",
    tag: "SPEC SHEET // ROAD BIKE",
    wheelBadge: "BAN 700C",
    vibe: "SPORTY EDITION LEADER",
    title: "ROAD BIKE",
    quote: '"Kejar pace Sabtu pagi sebelum deadline Senin datang lagi."',
    desc: "Ringan, aerodinamis, dan siap tarik peloton di PedalPol Sporty Edition hari Sabtu serta Brick Session bareng @pegipeda. Tetap santai waktu ikut kopi-kopi Minggu pagi!",
    bestFor: "PedalPol Sporty Edition • Brick Session • Ngelayap Aspal",
    stats: [82, 74, 99],
    tireWidth: 7,
    rimColor: "#FF5B37",
    barPath: "M 309,62 L 336,64 C 352,64 352,92 332,92",
    showBag: false,
    showCommuter: false,
    wheelTransform: "translate(0px, 0px) scale(1)",
    framePoints: "112,168 182,82 316,84 218,168",
    forkY2: 168,
  },
  commuter: {
    tab: 'Commuter 26"',
    tag: 'SPEC SHEET // COMMUTER 26"',
    wheelBadge: 'BAN 26"',
    vibe: "BIKE TO WORK & CHILL",
    title: 'COMMUTER BIKE (BAN 26")',
    quote: '"Dari berangkat kerja pagi-pagi sampai nongkrong santai—ban 26 selalu siap nemenin."',
    desc: 'Andalan teman-teman PedalPol untuk mobilitas harian: berangkat kantor, ke kedai kopi, sampai gowes santai keliling kota. Ban 26" yang lincah & empuk di jalanan Jakarta plus rak depan buat tas kerja bikin sepeda benar-benar jadi bagian keseharian.',
    bestFor: "Bike to Work • Raboo-Raboo • Sunday Morning Pol • Menyapa Museum",
    stats: [95, 86, 66],
    tireWidth: 14,
    rimColor: "#D99B38",
    barPath: "M 309,62 L 296,49 L 274,53",
    showBag: false,
    showCommuter: true,
    wheelTransform: "translate(0px, 8px) scale(0.85)",
    framePoints: "112,176 182,86 316,84 218,168",
    forkY2: 176,
  },
};

export function AllBikesDeck() {
  const { calmMotion } = useMotion();
  const [selected, setSelected] = useState<BikeKey>("fixie");
  const [wheelRot, setWheelRot] = useState(0);
  const b = BIKES[selected];

  const spin = () => {
    if (!calmMotion) setWheelRot((r) => r + 360);
  };

  const handleSelect = (key: BikeKey) => {
    setSelected(key);
    spin();
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] inline-block mb-2.5">
            ALL BIKES ART DECK
          </span>
          <h2 className="font-poster text-4xl uppercase text-[#14101C]">
            SATU BARISAN, BEDA KARAKTER
          </h2>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Pilih jenis sepeda">
          {(Object.keys(BIKES) as BikeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className={`font-stamp text-xs font-bold uppercase px-4 py-2 border-2 border-[#14101C] transition-colors ${
                selected === key
                  ? "bg-[#8E47EE] text-white"
                  : "bg-[#F5F0E6] text-[#14101C] hover:bg-[#EBE3D3]"
              }`}
            >
              {BIKES[key].tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 font-stamp text-xs uppercase mb-4">
            <span className="px-2.5 py-1 bg-[#14101C] text-[#92FA66] font-bold">
              {b.tag}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 border-2 border-[#14101C] bg-[#92FA66] text-[#14101C] font-bold">
                {b.wheelBadge}
              </span>
              <span className="text-[#4B4258] font-bold">{b.vibe}</span>
            </div>
          </div>

          <div className="my-2 flex items-center justify-center">
            <svg
              viewBox="0 0 460 250"
              className="w-full max-w-md h-auto"
              aria-label={`Ilustrasi ${b.title}`}
            >
              <ellipse cx="230" cy="222" rx="175" ry="10" fill="rgba(20,16,28,0.12)" />

              {/* Rear Wheel */}
              <g
                style={{
                  transformOrigin: "112px 168px",
                  transform: b.wheelTransform,
                  transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <g
                  className="bike-wheel"
                  style={{
                    transform: `rotate(${wheelRot}deg)`,
                    transition: calmMotion
                      ? "none"
                      : "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <circle cx="112" cy="168" r="54" fill="none" stroke="#14101C" strokeWidth={b.tireWidth} />
                  <circle cx="112" cy="168" r="44" fill="none" stroke={b.rimColor} strokeWidth="5" />
                  <g stroke="#14101C" strokeWidth="1.6" opacity="0.65">
                    <line x1="112" y1="124" x2="112" y2="212" />
                    <line x1="68" y1="168" x2="156" y2="168" />
                    <line x1="81" y1="137" x2="143" y2="199" />
                    <line x1="143" y1="137" x2="81" y2="199" />
                  </g>
                  <circle cx="112" cy="168" r="8" fill="#14101C" />
                </g>
              </g>

              {/* Front Wheel */}
              <g
                style={{
                  transformOrigin: "348px 168px",
                  transform: b.wheelTransform,
                  transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <g
                  className="bike-wheel"
                  style={{
                    transform: `rotate(${wheelRot}deg)`,
                    transition: calmMotion
                      ? "none"
                      : "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <circle cx="348" cy="168" r="54" fill="none" stroke="#14101C" strokeWidth={b.tireWidth} />
                  <circle cx="348" cy="168" r="44" fill="none" stroke={b.rimColor} strokeWidth="5" />
                  <g stroke="#14101C" strokeWidth="1.6" opacity="0.65">
                    <line x1="348" y1="124" x2="348" y2="212" />
                    <line x1="304" y1="168" x2="392" y2="168" />
                    <line x1="317" y1="137" x2="379" y2="199" />
                    <line x1="379" y1="137" x2="317" y2="199" />
                  </g>
                  <circle cx="348" cy="168" r="8" fill="#14101C" />
                </g>
              </g>

              {/* Commuter 26" Kit */}
              <g
                opacity={b.showCommuter ? 1 : 0}
                style={{ transition: "opacity 0.35s ease" }}
              >
                <path d="M 60,174 A 52,52 0 0 1 156,144" fill="none" stroke="#14101C" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 304,142 A 52,52 0 0 1 398,166" fill="none" stroke="#14101C" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="348" y1="175" x2="352" y2="112" stroke="#14101C" strokeWidth="3" />
                <line x1="318" y1="98" x2="386" y2="112" stroke="#14101C" strokeWidth="3" />
                <rect x="336" y="75" width="46" height="34" rx="3" fill="#8E47EE" stroke="#14101C" strokeWidth="3" />
                <path d="M 349,75 C 349,64 369,64 369,75" fill="none" stroke="#14101C" strokeWidth="3" />
                <line x1="344" y1="88" x2="374" y2="88" stroke="#92FA66" strokeWidth="3" />
                <polygon points="328,88 392,88 386,114 334,114" fill="none" stroke="#14101C" strokeWidth="3.5" strokeLinejoin="round" />
                <line x1="348" y1="88" x2="350" y2="114" stroke="#14101C" strokeWidth="2" />
                <line x1="370" y1="88" x2="368" y2="114" stroke="#14101C" strokeWidth="2" />
                <rect x="315" y="198" width="66" height="17" fill="#92FA66" stroke="#14101C" strokeWidth="1.8" />
                <text x="348" y="210" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="bold" fill="#14101C">
                  26&quot; TIRE
                </text>
              </g>

              <g stroke="#14101C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <polygon points={b.framePoints} />
                <line x1="182" y1="82" x2="218" y2="168" />
                <line x1="316" y1="84" x2="348" y2={b.forkY2} />
                <line x1="182" y1="82" x2="172" y2="58" strokeWidth="5" />
                <path d="M 152,58 L 194,58" strokeWidth="9" />
                <line x1="316" y1="84" x2="309" y2="62" strokeWidth="5" />
                <path d={b.barPath} strokeWidth="6" />
              </g>

              <polygon
                points="196,92 302,93 266,126 206,118"
                fill="#176B3F"
                stroke="#14101C"
                strokeWidth="3"
                opacity={b.showBag ? 1 : 0}
                style={{ transition: "opacity 0.35s ease" }}
              />
              <circle cx="218" cy="168" r="18" fill="#92FA66" stroke="#14101C" strokeWidth="4" />
              <circle cx="218" cy="168" r="5" fill="#14101C" />
              <g transform="translate(242, 134) rotate(-40)">
                <rect x="0" y="-10" width="54" height="14" fill="#92FA66" stroke="#14101C" strokeWidth="1.5" />
                <text x="27" y="0" textAnchor="middle" fontFamily="Impact, sans-serif" fontSize="9" fill="#14101C">
                  PEDAL POL
                </text>
              </g>
            </svg>
          </div>

          <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-[#14101C]/35 font-stamp text-xs">
            <span>SEMUA SEPEDA SATU PELOTON</span>
            <button
              type="button"
              onClick={spin}
              className="px-3 py-1 bg-[#14101C] text-[#92FA66] hover:bg-[#8E47EE] hover:text-white transition-colors"
            >
              Kayuh Roda ↻
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow-purple p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-poster text-3xl uppercase text-[#14101C] mb-2">{b.title}</h3>
            <p className="font-stamp text-xs text-[#6C2BD9] font-bold uppercase mb-4">
              {b.quote}
            </p>
            <p className="text-sm text-[#362F42] leading-relaxed mb-5">{b.desc}</p>
            <div className="space-y-3 mb-5">
              {[
                { label: "URBAN NIGHT VIBE", val: b.stats[0], color: "#8E47EE" },
                { label: "NGELAYAP / ALL-TERRAIN", val: b.stats[1], color: "#92FA66" },
                { label: "SPORTY SPEED", val: b.stats[2], color: "#14101C" },
              ].map((st) => (
                <div key={st.label}>
                  <div className="flex justify-between font-stamp text-xs font-bold mb-1">
                    <span>{st.label}</span>
                    <span>{st.val}%</span>
                  </div>
                  <div className="h-3 bg-[#EBE3D3] border-2 border-[#14101C]">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${st.val}%`, backgroundColor: st.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3.5 bg-[#EBE3D3] border-2 border-[#14101C] font-stamp text-xs">
            <div className="font-bold uppercase text-[#14101C] mb-1">AGENDA PALING PAS:</div>
            <div className="text-[#362F42]">{b.bestFor}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
