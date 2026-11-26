"use client";

import {
  BookOpen,
  Calendar,
  Compass,
  Handshake,
  Home,
  Leaf,
  Menu,
  PenTool,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMotion } from "@/components/MotionProvider";

const NAV_ITEMS = [
  {
    num: "01",
    href: "/",
    label: "Beranda",
    sub: "Sticker Wall, Filmstrip & All Bikes",
    accent: "#8E47EE",
    icon: Home,
  },
  {
    num: "02",
    href: "/zine",
    label: "Zine",
    sub: "Cerita Jalan & Street Reels",
    accent: "#92FA66",
    icon: BookOpen,
  },
  {
    num: "03",
    href: "/agenda",
    label: "Agenda",
    sub: "Raboo-Raboo, Sunday Pol & Join",
    accent: "#14101C",
    icon: Calendar,
  },
  {
    num: "04",
    href: "/kampanye",
    label: "Kampanye",
    sub: "For Rest Forest × LindungiHutan",
    accent: "#176B3F",
    icon: Leaf,
  },
  {
    num: "05",
    href: "/merch",
    label: "Merch",
    sub: "PedalPol Supply & Limited Drop",
    accent: "#FF5B37",
    icon: ShoppingBag,
  },
  {
    num: "06",
    href: "/kolab",
    label: "Kolab",
    sub: "3 Komunitas Gandeng & Brand Kit",
    accent: "#8E47EE",
    icon: Handshake,
  },
];

const MOBILE_DOCK_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/zine", label: "Zine", icon: BookOpen },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/kolab", label: "Kolab", icon: Handshake },
];

export function Navbar({ articleCount = 5 }: { articleCount?: number }) {
  const pathname = usePathname();
  const { calmMotion, toggleMotion, openStoryModal, boostWheel } = useMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Lock body scroll & support Escape when full-screen zine drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const handleMobileNav = () => {
    setDrawerOpen(false);
    boostWheel(22);
  };

  const handleOpenStoryFromDrawer = () => {
    setDrawerOpen(false);
    openStoryModal();
  };

  const activeNav = NAV_ITEMS.find((item) => isActive(item.href));

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#F5F0E6]/95 backdrop-blur-md border-b-2 border-[#14101C]">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
          {/* Official PEDAL POL Logo */}
          <Link
            href="/"
            onClick={handleMobileNav}
            className="flex items-center gap-2.5 group focus:outline-none text-left shrink-0"
            aria-label="Beranda PedalPol"
          >
            <img
              src="/logos/pedalpol-logo.webp"
              alt="Logo PEDAL POL"
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105 drop-shadow-[2px_2px_0_#14101C]"
            />
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

          {/* Right Actions (Desktop + Mobile Street-Art Trigger) */}
          <div className="flex items-center gap-2">
            {/* Compact Mobile Active Page Stamp (shows context cleanly without scrollbar) */}
            {activeNav && (
              <span className="md:hidden">
                <span className="hidden min-[390px]:inline-flex items-center px-2 py-1 bg-[#EBE3D3] border border-[#14101C] font-stamp text-[10px] font-bold uppercase text-[#14101C]">
                  {activeNav.num}•{activeNav.label}
                </span>
              </span>
            )}

            <button
              type="button"
              onClick={toggleMotion}
              className="font-stamp text-[10px] sm:text-[11px] font-bold uppercase px-2 sm:px-2.5 py-1.5 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#92FA66] transition-colors flex items-center gap-1.5"
              title="Ubah mode animasi"
              aria-label="Ubah mode animasi"
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: calmMotion ? "#8E47EE" : "#176B3F" }}
              />
              <span className="hidden sm:inline">
                {calmMotion ? "Motion: CALM" : "Motion: ON"}
              </span>
              <span className="sm:hidden">{calmMotion ? "CALM" : "ART"}</span>
            </button>

            <button
              type="button"
              onClick={openStoryModal}
              className="hidden md:inline-flex font-stamp text-[11px] font-bold uppercase px-3 py-1.5 border-2 border-[#14101C] bg-[#8E47EE] text-white hover:bg-[#14101C] hover:text-[#92FA66] transition-colors"
            >
              + Kirim Cerita
            </button>

            {/* Mobile Street-Art Zine Drawer Trigger */}
            <button
              type="button"
              onClick={() => {
                setDrawerOpen((o) => !o);
                boostWheel(24);
              }}
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              className={`md:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-[#14101C] font-stamp text-[11px] font-bold uppercase transition-transform active:translate-y-0.5 ${
                drawerOpen
                  ? "bg-[#14101C] text-[#FF5B37] shadow-[3px_3px_0_#FF5B37]"
                  : "bg-[#92FA66] text-[#14101C] shadow-[3px_3px_0_#14101C]"
              }`}
            >
              {drawerOpen ? <X className="w-3.5 h-3.5 stroke-[2.6]" /> : <Menu className="w-3.5 h-3.5 stroke-[2.6]" />}
              <span>{drawerOpen ? "Tutup" : "Menu"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* FULL-SCREEN RISOGRAPH "ZINE ISSUE INDEX" MOBILE POSTER DRAWER      */}
      {/* ================================================================== */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[110] bg-[#F5F0E6] riso-grain halftone-corner flex flex-col overflow-hidden mobile-drawer-enter"
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi Zine PedalPol"
        >
          {/* Decorative Giant Spoked Bike Wheel Watermark */}
          <svg
            viewBox="0 0 260 260"
            className="drawer-wheel-spin fixed -right-20 -bottom-16 w-72 h-72 opacity-[0.11] pointer-events-none"
            aria-hidden="true"
          >
            <circle cx="130" cy="130" r="118" fill="none" stroke="#14101C" strokeWidth="10" />
            <circle
              cx="130"
              cy="130"
              r="102"
              fill="none"
              stroke="#8E47EE"
              strokeWidth="4"
              strokeDasharray="16 8"
            />
            <circle cx="130" cy="130" r="18" fill="#14101C" />
            <circle cx="130" cy="130" r="7" fill="#92FA66" />
            <g stroke="#14101C" strokeWidth="2.2">
              <line x1="130" y1="16" x2="130" y2="244" />
              <line x1="16" y1="130" x2="244" y2="130" />
              <line x1="49" y1="49" x2="211" y2="211" />
              <line x1="211" y1="49" x2="49" y2="211" />
              <line x1="86" y1="24" x2="174" y2="236" />
              <line x1="24" y1="86" x2="236" y2="174" />
            </g>
          </svg>

          {/* Top Zine Masthead Strip */}
          <div className="bg-[#14101C] text-[#F5F0E6] px-4 py-3 border-b-2 border-[#92FA66] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 font-stamp text-[11px] font-bold uppercase">
              <Compass className="w-3.5 h-3.5 text-[#92FA66]" />
              <span className="text-[#92FA66]">PEDALPOL INDEX</span>
              <span className="text-[#BEB5CA]">• MENTENG JKT</span>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#92FA66] text-[#14101C] border-2 border-[#92FA66] font-stamp text-[11px] font-bold uppercase"
            >
              <X className="w-3.5 h-3.5 stroke-[2.8]" />
              <span>Tutup</span>
            </button>
          </div>

          {/* Scrollable Editorial Poster Menu Tickets */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
            <div className="font-stamp text-[10px] font-bold uppercase text-[#5B5269] tracking-widest mb-1">
              PILIH HALAMAN // ALL BIKES WELCOME
            </div>

            {NAV_ITEMS.map((item, idx) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleMobileNav}
                  style={{ animationDelay: `${idx * 35}ms` }}
                  className={`mobile-ticket-in flex items-center justify-between gap-3 p-3 border-2 border-[#14101C] transition-colors ${
                    active
                      ? "bg-[#92FA66] text-[#14101C] shadow-[4px_4px_0_#14101C]"
                      : "bg-[#F5F0E6] text-[#14101C] shadow-[3px_3px_0_#14101C] active:translate-x-0.5 active:translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-10 h-10 shrink-0 border-2 border-[#14101C] flex flex-col items-center justify-center font-stamp text-[10px] font-bold leading-none"
                      style={{
                        backgroundColor: active ? "#14101C" : item.accent,
                        color:
                          active
                            ? "#92FA66"
                            : item.accent === "#92FA66"
                              ? "#14101C"
                              : "#FFFFFF",
                      }}
                    >
                      <Icon className="w-4 h-4 mb-0.5" />
                      <span>{item.num}</span>
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-poster text-2xl uppercase tracking-wide leading-none">
                          {item.label}
                        </span>
                        {item.href === "/zine" && (
                          <span className="px-1.5 py-0.5 bg-[#14101C] text-[#92FA66] font-stamp text-[10px] font-bold leading-none">
                            {articleCount} ARTIKEL
                          </span>
                        )}
                      </div>
                      <div
                        className={`font-stamp text-[10px] truncate mt-1 ${
                          active ? "text-[#14101C]/80 font-bold" : "text-[#4B4258]"
                        }`}
                      >
                        {item.sub}
                      </div>
                    </div>
                  </div>

                  {active ? (
                    <span className="shrink-0 -rotate-3 px-2 py-1 bg-[#14101C] text-[#92FA66] font-stamp text-[9px] font-bold uppercase border border-[#14101C]">
                      ★ AKTIF
                    </span>
                  ) : (
                    <span className="shrink-0 font-poster text-xl text-[#8E47EE]">→</span>
                  )}
                </Link>
              );
            })}

            {/* Kirim Cerita Action Card inside Mobile Menu */}
            <button
              type="button"
              onClick={handleOpenStoryFromDrawer}
              className="w-full mt-2 p-3.5 bg-[#8E47EE] text-white border-2 border-[#14101C] shadow-[4px_4px_0_#14101C] flex items-center justify-between gap-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] flex items-center justify-center shrink-0">
                  <PenTool className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-poster text-xl uppercase leading-none">
                    KIRIM CERITAMU KE ZINE
                  </div>
                  <div className="font-stamp text-[10px] text-white/85 mt-1">
                    Raboo-Raboo, Bike Check &amp; Ngelayap
                  </div>
                </div>
              </div>
              <span className="font-poster text-xl text-[#92FA66]">+</span>
            </button>
          </div>

          {/* Bottom 3-Community Alliance Stamp Footer inside Drawer */}
          <div className="relative z-10 bg-[#EBE3D3] border-t-2 border-[#14101C] px-4 py-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img
                    src="/logos/pedalpol.webp"
                    alt="PedalPol"
                    className="w-8 h-8 object-cover border-2 border-[#14101C] bg-[#14101C]"
                  />
                  <img
                    src="/logos/bikebaik.webp"
                    alt="BikeBaik"
                    className="w-8 h-8 object-cover border-2 border-[#14101C] bg-[#19498A]"
                  />
                  <img
                    src="/logos/bike2ngonten.webp"
                    alt="Bike2Ngonten"
                    className="w-8 h-8 object-cover border-2 border-[#14101C] bg-[#FAD1D8]"
                  />
                </div>
                <div className="font-stamp text-[9px] leading-tight uppercase">
                  <div className="font-bold text-[#14101C]">3 KOMUNITAS GANDENG</div>
                  <div className="text-[#4B4258]">@pedalpol × @bikebaik × @bike2ngonten</div>
                </div>
              </div>
              <Link
                href="/admin"
                onClick={handleMobileNav}
                className="shrink-0 px-2 py-1 border border-[#14101C] bg-[#F5F0E6] font-stamp text-[10px] font-bold uppercase"
              >
                🔒 Admin
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* FLOATING MOBILE BOTTOM "HANDLEBAR DOCK" (NO SCROLLBAR, 1-THUMB!)   */}
      {/* ================================================================== */}
      <nav
        aria-label="Navigasi Cepat Mobile"
        className="md:hidden fixed bottom-3 inset-x-3 z-50 bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] shadow-[4px_4px_0_#92FA66] px-1.5 py-1.5"
      >
        <div className="grid grid-cols-5 gap-1 items-stretch">
          {MOBILE_DOCK_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMobileNav}
                className={`flex flex-col items-center justify-center py-1.5 px-1 font-stamp text-[9px] font-bold uppercase transition-transform ${
                  active
                    ? "bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] -translate-y-1 shadow-[2px_2px_0_#8E47EE]"
                    : "text-[#D6CFE0] hover:text-[#92FA66]"
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}

          {/* 5th Slot: Street-Art Full Menu Drawer Button (opens Merch, Kampanye, Kirim Cerita, etc.) */}
          <button
            type="button"
            onClick={() => {
              setDrawerOpen((o) => !o);
              boostWheel(24);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-1 font-stamp text-[9px] font-bold uppercase border-2 transition-transform ${
              drawerOpen
                ? "bg-[#FF5B37] text-white border-[#F5F0E6] -translate-y-1"
                : pathname.startsWith("/merch") || pathname.startsWith("/kampanye")
                  ? "bg-[#92FA66] text-[#14101C] border-[#14101C] -translate-y-1"
                  : "bg-[#8E47EE] text-white border-[#92FA66]"
            }`}
          >
            {drawerOpen ? <X className="w-4 h-4 mb-0.5" /> : <Menu className="w-4 h-4 mb-0.5" />}
            <span className="leading-none">{drawerOpen ? "Tutup" : "Menu"}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
