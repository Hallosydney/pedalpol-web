"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ArticleCategory } from "@/lib/types";

interface MotionContextValue {
  calmMotion: boolean;
  toggleMotion: () => void;
  cadenceRpm: number;
  wheelAngleRef: React.MutableRefObject<number>;
  boostWheel: (amount: number) => void;
  triggerShutterFlash: () => void;
  openStoryModal: () => void;
}

const MotionContext = createContext<MotionContextValue>({
  calmMotion: false,
  toggleMotion: () => {},
  cadenceRpm: 72,
  wheelAngleRef: { current: 0 },
  boostWheel: () => {},
  triggerShutterFlash: () => {},
  openStoryModal: () => {},
});

export function useMotion() {
  return useContext(MotionContext);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [calmMotion, setCalmMotion] = useState(false);
  const [cadenceRpm, setCadenceRpm] = useState(72);
  const [shutterActive, setShutterActive] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  // Story modal state
  const [sfTitle, setSfTitle] = useState("");
  const [sfAuthor, setSfAuthor] = useState("");
  const [sfCat, setSfCat] = useState<ArticleCategory>("cerita");
  const [sfBody, setSfBody] = useState("");
  const [sfSubmitting, setSfSubmitting] = useState(false);
  const [sfSuccess, setSfSuccess] = useState(false);
  const [sfError, setSfError] = useState("");

  const calmRef = useRef(false);
  const wheelAngleRef = useRef(0);
  const wheelVelocityRef = useRef(0.6);
  const scrollTapeRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    calmRef.current = calmMotion;
    document.body.classList.toggle("calm-motion", calmMotion);
  }, [calmMotion]);

  // Respect OS prefers-reduced-motion cleanly
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setCalmMotion(e.matches);
    mq.addEventListener("change", onChange);
    const rafId = requestAnimationFrame(() => {
      if (mq.matches) setCalmMotion(true);
    });
    return () => {
      cancelAnimationFrame(rafId);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const boostWheel = useCallback((amount: number) => {
    if (calmRef.current) return;
    wheelVelocityRef.current = Math.min(18, wheelVelocityRef.current + amount * 0.25);
  }, []);

  const triggerShutterFlash = useCallback(() => {
    if (calmRef.current) return;
    setShutterActive(false);
    requestAnimationFrame(() => setShutterActive(true));
  }, []);

  // Scroll tape + cadence physics + ink cursor
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let frameId = 0;
    let rpmTick = 0;

    const onScroll = () => {
      const curr = window.scrollY;
      boostWheel(Math.min(Math.abs(curr - lastScrollY), 40));
      lastScrollY = curr;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTapeRef.current) {
        const pct = maxScroll > 0 ? Math.min(100, (curr / maxScroll) * 100) : 0;
        scrollTapeRef.current.style.width = `${pct}%`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    let cx = -40;
    let cy = -40;
    let tx = -40;
    let ty = -40;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    const onPointerMove = (e: PointerEvent) => {
      if (calmRef.current || !cursorRef.current) return;
      tx = e.clientX;
      ty = e.clientY;
      cursorRef.current.style.opacity = "0.9";
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest("button, a, .sticker-item, .art-tilt");
      cursorRef.current.classList.toggle("is-active", Boolean(interactive));
    };

    const onMouseLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    if (isFinePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("mouseleave", onMouseLeave);
    }

    const tick = () => {
      if (!calmRef.current) {
        wheelAngleRef.current =
          (wheelAngleRef.current + wheelVelocityRef.current) % 360;
        wheelVelocityRef.current = Math.max(0.55, wheelVelocityRef.current * 0.965);

        const wheelEl = document.getElementById("kinetic-wheel");
        if (wheelEl) {
          wheelEl.style.transform = `rotate(${wheelAngleRef.current.toFixed(1)}deg)`;
        }

        rpmTick++;
        if (rpmTick % 6 === 0) {
          setCadenceRpm(Math.round(62 + wheelVelocityRef.current * 4.5));
        }

        if (isFinePointer && cursorRef.current) {
          cx += (tx - cx) * 0.22;
          cy += (ty - cy) * 0.22;
          cursorRef.current.style.left = `${cx.toFixed(1)}px`;
          cursorRef.current.style.top = `${cy.toFixed(1)}px`;
        }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      if (isFinePointer) {
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [boostWheel]);

  const toggleMotion = useCallback(() => {
    setCalmMotion((prev) => !prev);
  }, []);

  const openStoryModal = useCallback(() => {
    setSfSuccess(false);
    setSfError("");
    setStoryOpen(true);
  }, []);

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSfSubmitting(true);
    setSfError("");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sfTitle,
          author: sfAuthor,
          cat: sfCat,
          body: sfBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim cerita.");
      setSfSuccess(true);
      setSfTitle("");
      setSfAuthor("");
      setSfBody("");
      boostWheel(24);
    } catch (err) {
      setSfError(err instanceof Error ? err.message : "Gagal mengirim cerita.");
    } finally {
      setSfSubmitting(false);
    }
  };

  return (
    <MotionContext.Provider
      value={{
        calmMotion,
        toggleMotion,
        cadenceRpm,
        wheelAngleRef,
        boostWheel,
        triggerShutterFlash,
        openStoryModal,
      }}
    >
      {/* Scroll progress tape */}
      <div
        ref={scrollTapeRef}
        aria-hidden="true"
        className="fixed top-0 left-0 h-1 w-0 z-[100] transition-[width] duration-75"
        style={{
          background: "linear-gradient(90deg, var(--pp-purple) 0%, var(--pp-lime) 100%)",
        }}
      />
      {/* Desktop fine-pointer ink cursor */}
      <div id="ink-cursor" ref={cursorRef} aria-hidden="true" />
      {/* Analog shutter flash */}
      <div
        aria-hidden="true"
        onAnimationEnd={() => setShutterActive(false)}
        className={`fixed inset-0 bg-[#F5F0E6] z-[150] pointer-events-none opacity-0 ${
          shutterActive ? "shutter-flashing" : ""
        }`}
      />

      {children}

      {/* Global Kirim Cerita Modal */}
      {storyOpen && (
        <div
          className="fixed inset-0 z-[120] bg-[#14101C]/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setStoryOpen(false);
          }}
        >
          <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow-lime max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setStoryOpen(false)}
              className="absolute top-4 right-4 font-stamp text-xs font-bold px-2.5 py-1 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#14101C] hover:text-[#92FA66]"
            >
              ESC ✕
            </button>

            {sfSuccess ? (
              <div className="py-6 text-center">
                <span className="inline-block px-3 py-1 bg-[#92FA66] border-2 border-[#14101C] font-stamp text-xs font-bold uppercase mb-3">
                  ✓ CERITA MASUK REDAKSI ZINE
                </span>
                <h3 className="font-poster text-3xl uppercase mb-2">
                  TERIMA KASIH SUDAH BERBAGI!
                </h3>
                <p className="text-sm text-[#362F42] mb-5 max-w-md mx-auto">
                  Ceritamu sudah tersimpan di antrean redaksi Panel Admin PedalPol dan siap
                  diterbitkan ke halaman <strong>Zine PedalPol</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setStoryOpen(false)}
                  className="font-stamp text-xs font-bold uppercase px-5 py-2.5 bg-[#14101C] text-[#92FA66] border-2 border-[#14101C]"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <div className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#92FA66] border-2 border-[#14101C] inline-block mb-3">
                  OPEN SUBMISSION • ZINE PEDALPOL
                </div>
                <h3 className="font-poster text-3xl uppercase text-[#14101C] mb-2 pr-14">
                  KIRIM CERITA GOWESMU!
                </h3>
                <p className="text-sm text-[#362F42] mb-4">
                  Punya cerita seru dari Rabo-Rabo, Ngelayap, atau kisah sepedamu yang bisa
                  menginspirasi pesepeda di Indonesia? Kirim langsung ke meja redaksi PedalPol.
                </p>
                {sfError && (
                  <div className="mb-3 p-2.5 bg-[#FF5B37]/15 border-2 border-[#FF5B37] font-stamp text-xs text-[#14101C]">
                    {sfError}
                  </div>
                )}
                <form onSubmit={handleSubmitStory} className="space-y-3">
                  <div>
                    <label className="block font-stamp text-xs font-bold uppercase mb-1">
                      Judul Cerita
                    </label>
                    <input
                      required
                      type="text"
                      value={sfTitle}
                      onChange={(e) => setSfTitle(e.target.value)}
                      placeholder="cth. Pertama Kali Ikut Rabo-Rabo Pakai Sepeda Lipat..."
                      className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-stamp text-xs font-bold uppercase mb-1">
                        Nama / IG Kamu
                      </label>
                      <input
                        required
                        type="text"
                        value={sfAuthor}
                        onChange={(e) => setSfAuthor(e.target.value)}
                        placeholder="@nama_kamu"
                        className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-sm font-stamp"
                      />
                    </div>
                    <div>
                      <label className="block font-stamp text-xs font-bold uppercase mb-1">
                        Rubrik
                      </label>
                      <select
                        value={sfCat}
                        onChange={(e) => setSfCat(e.target.value as ArticleCategory)}
                        className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-sm font-stamp"
                      >
                        <option value="cerita">Cerita Jalan</option>
                        <option value="ngelayap">Catatan Ngelayap</option>
                        <option value="bikecheck">Bike Check</option>
                        <option value="budaya">Skena &amp; Budaya</option>
                        <option value="impact">Pedal for Impact</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-stamp text-xs font-bold uppercase mb-1">
                      Cerita Singkatmu
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={sfBody}
                      onChange={(e) => setSfBody(e.target.value)}
                      placeholder="Ceritain momen paling berkesan pas gowes..."
                      className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sfSubmitting}
                    className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-2.5 bg-[#8E47EE] text-white border-2 border-[#14101C] disabled:opacity-50"
                  >
                    {sfSubmitting ? "Mengirim..." : "Kirim ke Redaksi Zine →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </MotionContext.Provider>
  );
}
