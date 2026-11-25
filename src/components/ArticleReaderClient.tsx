"use client";

import { useState } from "react";
import { useMotion } from "@/components/MotionProvider";

export function ArticleReaderClient({
  slug,
  initialApplause,
}: {
  slug: string;
  initialApplause: number;
}) {
  const { boostWheel, openStoryModal } = useMotion();
  const [applause, setApplause] = useState(initialApplause);
  const [copied, setCopied] = useState(false);

  const handleApplause = async () => {
    setApplause((c) => c + 1);
    boostWheel(20);
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(slug)}/applause`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.applause === "number") setApplause(data.applause);
      }
    } catch {
      // Keep optimistic count
    }
  };

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://pedalpol.id/zine/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-5 bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow flex flex-wrap items-center justify-between gap-4 mb-10">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleApplause}
          className="font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] hover:bg-[#8E47EE] hover:text-white transition-colors"
        >
          👏 Tepuk Pedal (<span className="tabular-nums">{applause}</span>)
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="font-stamp text-xs font-bold uppercase px-4 py-2.5 bg-[#F5F0E6] border-2 border-[#14101C] hover:bg-[#14101C] hover:text-[#92FA66] transition-colors"
        >
          {copied ? "✓ Link Cerita Disalin!" : "↗ Bagikan Link Cerita"}
        </button>
      </div>
      <button
        type="button"
        onClick={openStoryModal}
        className="font-stamp text-xs font-bold uppercase underline text-[#6C2BD9]"
      >
        Punya cerita gowes serupa? Kirim yuk →
      </button>
    </div>
  );
}
