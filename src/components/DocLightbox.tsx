"use client";

import { useEffect } from "react";
import type { DocItem } from "@/lib/types";

export function DocLightbox({
  items,
  activeId,
  onSelect,
  onClose,
}: {
  items: DocItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const idx = activeId ? items.findIndex((d) => d.id === activeId) : -1;
  const item = idx >= 0 ? items[idx] : null;

  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        onSelect(items[(idx + 1) % items.length].id);
      }
      if (e.key === "ArrowLeft") {
        onSelect(items[(idx - 1 + items.length) % items.length].id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, idx, items, onSelect, onClose]);

  if (!item) return null;

  const prevItem = items[(idx - 1 + items.length) % items.length];
  const nextItem = items[(idx + 1) % items.length];

  return (
    <div
      className="fixed inset-0 z-[130] bg-[#14101C]/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow-lime max-w-2xl w-full p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 font-stamp text-xs font-bold px-2.5 py-1 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#14101C] hover:text-[#92FA66]"
        >
          ESC ✕
        </button>

        {/* Clean Opsi 1 Header: Category + Location */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pr-16 font-stamp text-[11px] font-bold uppercase">
          <span className="px-2 py-0.5 bg-[#14101C] text-[#92FA66]">{item.catLabel}</span>
          <span className="px-2 py-0.5 bg-[#EBE3D3] border border-[#14101C] text-[#6C2BD9]">
            📍 {item.location}
          </span>
        </div>

        {item.type === "video" ? (
          <div className="relative bg-black border-2 border-[#14101C] flex items-center justify-center max-h-[62vh] overflow-hidden">
            <video
              key={item.id}
              src={item.mediaUrl}
              poster={item.posterUrl}
              controls
              autoPlay
              playsInline
              loop
              className="max-h-[62vh] w-auto max-w-full block"
            />
          </div>
        ) : (
          <div className="relative bg-[#14101C] border-2 border-[#14101C] flex items-center justify-center max-h-[62vh] overflow-hidden">
            <img
              src={item.mediaUrl}
              alt={item.title}
              className="max-h-[62vh] w-auto max-w-full object-contain block"
            />
            <span className="absolute bottom-3 right-3.5 date-stamp text-sm font-bold pointer-events-none">
              {item.dateStamp}
            </span>
          </div>
        )}

        <div className="mt-3.5">
          <h3 className="font-poster text-2xl sm:text-3xl uppercase text-[#14101C] leading-tight">
            {item.title}
          </h3>
          <p className="text-sm text-[#362F42] mt-1 leading-relaxed">{item.caption}</p>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-[#14101C] flex flex-wrap items-center justify-between gap-2 font-stamp text-xs font-bold uppercase">
          <button
            type="button"
            onClick={() => onSelect(prevItem.id)}
            className="px-3 py-1.5 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#14101C] hover:text-[#92FA66] transition-colors"
          >
            ← Sebelumnya
          </button>
          <span className="text-[10px] text-[#5B5269]">
            DOKS: @PEDALPOL × @BIKE2NGONTEN ({idx + 1}/{items.length})
          </span>
          <button
            type="button"
            onClick={() => onSelect(nextItem.id)}
            className="px-3 py-1.5 border-2 border-[#14101C] bg-[#92FA66] text-[#14101C] hover:bg-[#14101C] hover:text-[#92FA66] transition-colors"
          >
            Berikutnya →
          </button>
        </div>
      </div>
    </div>
  );
}
