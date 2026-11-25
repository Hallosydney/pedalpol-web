"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMotion } from "@/components/MotionProvider";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/zine", label: "Zine" },
  { href: "/agenda", label: "Agenda" },
  { href: "/kampanye", label: "Kampanye" },
  { href: "/merch", label: "Merch" },
  { href: "/kolab", label: "Kolab" },
];

export function Navbar({ articleCount = 5 }: { articleCount?: number }) {
  const pathname = usePathname();
  const { calmMotion, toggleMotion, openStoryModal, boostWheel } = useMotion();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F5F0E6]/95 backdrop-blur-md border-b-2 border-[#14101C]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* PEDAL POL Skewed Logo */}
        <Link
          href="/"
          onClick={() => boostWheel(20)}
          className="flex items-center gap-2.5 group focus:outline-none text-left"
          aria-label="Beranda PedalPol"
        >
          <svg
            width="110"
            height="40"
            viewBox="0 0 220 84"
            className="transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105"
            aria-hidden="true"
          >
            <polygon
              points="10,20 176,8 192,38 205,36 212,56 54,76 26,64"
              fill="#8E47EE"
              stroke="#14101C"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <polygon
              points="14,23 173,12 188,41 201,39 207,53 55,71 29,61"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeDasharray="90 5 60 5 120 4 80"
              strokeLinejoin="round"
            />
            <g transform="translate(36, 59) rotate(-7.5) skewX(-12)">
              <text
                x="0"
                y="0"
                fill="#92FA66"
                fontFamily="Impact, Arial Black, sans-serif"
                fontSize="37"
                fontWeight="900"
                letterSpacing="1.2"
              >
                PEDAL POL
              </text>
            </g>
          </svg>
          <div className="hidden lg:flex flex-col leading-tight">
            <span className="font-stamp text-[11px] font-bold uppercase text-[#14101C]">
              Menteng, Jakarta
            </span>
            <span className="font-stamp text-[10px] text-[#5B5269]">
              Zine &amp; Bike Club
            </span>
          </div>
        </Link>

        {/* Desktop Menu Bar */}
        <nav
          className="hidden md:flex items-center gap-1 font-stamp text-xs font-bold uppercase"
          aria-label="Menu Utama"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => boostWheel(18)}
                className={`px-2.5 py-1.5 border-2 transition-colors ${
                  active
                    ? "bg-[#14101C] text-[#92FA66] border-[#14101C]"
                    : "border-transparent hover:border-[#14101C] text-[#14101C]"
                }`}
              >
                {item.label}
                {item.href === "/zine" && (
                  <span className="ml-1 px-1 py-0.5 text-[10px] bg-[#92FA66] text-[#14101C] border border-[#14101C]">
                    {articleCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Motion Control + Submit Story */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMotion}
            className="font-stamp text-[11px] font-bold uppercase px-2.5 py-1.5 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#92FA66] transition-colors flex items-center gap-1.5"
            title="Ubah mode animasi"
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: calmMotion ? "#8E47EE" : "#176B3F" }}
            />
            <span>{calmMotion ? "Motion: CALM" : "Motion: ON"}</span>
          </button>
          <button
            type="button"
            onClick={openStoryModal}
            className="hidden sm:inline-flex font-stamp text-[11px] font-bold uppercase px-3 py-1.5 border-2 border-[#14101C] bg-[#8E47EE] text-white hover:bg-[#14101C] hover:text-[#92FA66] transition-colors"
          >
            + Kirim Cerita
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Menu Bar */}
      <div className="md:hidden border-t border-[#14101C]/25 px-3 py-2 flex items-center gap-1.5 overflow-x-auto font-stamp text-[11px] font-bold uppercase">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 px-2.5 py-1 border-2 ${
                active
                  ? "bg-[#14101C] text-[#92FA66] border-[#14101C]"
                  : "border-[#14101C]/30 text-[#14101C]"
              }`}
            >
              {item.label}
              {item.href === "/zine" ? ` (${articleCount})` : ""}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
