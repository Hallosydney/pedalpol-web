"use client";

import Link from "next/link";
import { useState } from "react";
import { MerchCoverArt } from "@/components/ArtIllustrations";
import { getSavedRiderProfile } from "@/lib/device";
import type { MerchCategory, MerchItem } from "@/lib/types";

export function MerchClient({
  items,
  whatsappAdmin,
}: {
  items: MerchItem[];
  whatsappAdmin: string;
}) {
  const [cat, setCat] = useState<"all" | MerchCategory>("all");
  const [activeItem, setActiveItem] = useState<MerchItem | null>(null);
  const [buyer, setBuyer] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [waReadyText, setWaReadyText] = useState<string | null>(null);

  const filtered = cat === "all" ? items : items.filter((m) => m.cat === cat);

  const openModal = (item: MerchItem) => {
    setActiveItem(item);
    setSize(item.sizes[0] || "All Size");
    setQty(1);
    setWaReadyText(null);
    const saved = getSavedRiderProfile();
    if (!buyer && saved.handle) setBuyer(saved.handle);
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !buyer.trim()) return;
    const text = `Halo Admin PedalPol! Saya ${buyer.trim()} mau pesan ${activeItem.title} (Ukuran: ${size}, Qty: ${qty} pcs). Terima kasih!`;
    setWaReadyText(text);
  };

  const cleanWa = whatsappAdmin.replace(/[^0-9]/g, "") || "6281234567890";

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="border-b-2 border-[#14101C] pb-7 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <span className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C] inline-block mb-3">
            PEDALPOL SUPPLY // LIMITED DROP &amp; CO-BRAND ARCHIVE
          </span>
          <h1 className="font-poster text-5xl sm:text-6xl uppercase text-[#14101C]">
            MERCH &amp; SUPPLY
          </h1>
          <p className="text-sm sm:text-base text-[#362F42] max-w-2xl mt-2">
            Rilisan terbatas buat gowes harian, <em>Sporty Edition</em>, sampai koleksi stiker
            frame. Sebagian hasil penjualan mendukung kas agenda <em>Ngelayap</em> &amp; donasi
            pohon <strong>For Rest Forest</strong>.
          </p>
        </div>
        <Link
          href="/kolab"
          className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-3 bg-[#14101C] text-[#92FA66] border-2 border-[#14101C] shrink-0 w-fit"
        >
          Brand Mau Co-Brand Merch? →
        </Link>
      </div>

      {/* Merch Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: "all", label: `Semua Drop (${items.length})` },
          { id: "apparel", label: "Apparel & Jersey" },
          { id: "gear", label: "Bag & Gear" },
          { id: "art", label: "Sticker & Zine" },
          { id: "archive", label: "Sold Out / Collab Archive" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setCat(f.id as "all" | MerchCategory)}
            className={`font-stamp text-xs font-bold uppercase px-3.5 py-2 border-2 border-[#14101C] transition-colors ${
              cat === f.id
                ? "bg-[#14101C] text-[#92FA66]"
                : "bg-[#F5F0E6] text-[#14101C] hover:bg-[#EBE3D3]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {filtered.map((item) => (
          <article
            key={item.id}
            onClick={() => openModal(item)}
            className={`bg-[#F5F0E6] border-2 border-[#14101C] riso-shadow flex flex-col justify-between overflow-hidden cursor-pointer group ${
              item.soldOut ? "opacity-90" : ""
            }`}
          >
            <div>
              <div className="relative h-48 border-b-2 border-[#14101C] overflow-hidden">
                <MerchCoverArt
                  artKey={item.artKey}
                  imageUrl={item.imageUrl}
                  title={item.title}
                />
                <span
                  className="absolute top-2.5 left-2.5 px-2.5 py-1 border-2 border-[#14101C] font-stamp text-[10px] font-bold uppercase"
                  style={{ background: item.statusBg, color: item.statusFg }}
                >
                  {item.status}
                </span>
              </div>
              <div className="p-5">
                <div className="font-stamp text-[11px] font-bold text-[#176B3F] uppercase mb-1">
                  {item.impactNote}
                </div>
                <h3 className="font-poster text-2xl uppercase text-[#14101C] group-hover:text-[#8E47EE] transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#362F42] leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="px-5 py-3.5 bg-[#EBE3D3] border-t-2 border-[#14101C] flex items-center justify-between gap-2 font-stamp text-xs">
              <strong className="text-sm text-[#14101C]">{item.price}</strong>
              <span
                className={`px-3 py-1 border border-[#14101C] font-bold uppercase ${
                  item.soldOut
                    ? "bg-[#14101C] text-[#F5F0E6]"
                    : "bg-[#92FA66] text-[#14101C]"
                }`}
              >
                {item.soldOut ? "Lihat Arsip →" : "Pesan / PO →"}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Order Info Strip */}
      <div className="bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-stamp text-xs">
        <div>
          <strong className="uppercase text-[#14101C]">SISTEM DROP / PRE-ORDER ANTI RIBET:</strong>
          <span className="text-[#362F42]">
            {" "}
            Pilih ukuran &amp; jumlah → klik pesan untuk langsung membuka chat WhatsApp admin
            PedalPol (bisa ambil langsung saat Raboo-Raboo / Sunday Morning Pol atau kirim kurir).
          </span>
        </div>
        <span className="shrink-0 px-3 py-1.5 bg-[#92FA66] border border-[#14101C] font-bold uppercase">
          100% Kas &amp; Impact
        </span>
      </div>

      {/* MERCH ORDER MODAL */}
      {activeItem && (
        <div
          className="fixed inset-0 z-[125] bg-[#14101C]/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveItem(null);
          }}
        >
          <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow-lime max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 font-stamp text-xs font-bold px-2.5 py-1 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#14101C] hover:text-[#92FA66]"
            >
              ESC ✕
            </button>

            {activeItem.soldOut ? (
              <>
                <div className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#14101C] text-[#F5F0E6] inline-block mb-3">
                  {activeItem.status}
                </div>
                <h3 className="font-poster text-3xl uppercase text-[#14101C] mb-2 pr-14">
                  {activeItem.title}
                </h3>
                <div className="h-44 border-2 border-[#14101C] mb-4 overflow-hidden">
                  <MerchCoverArt
                    artKey={activeItem.artKey}
                    imageUrl={activeItem.imageUrl}
                    title={activeItem.title}
                  />
                </div>
                <p className="text-sm text-[#362F42] mb-4">{activeItem.description}</p>
                <div className="p-4 bg-[#EBE3D3] border-2 border-[#14101C] flex flex-wrap items-center justify-between gap-3">
                  <span className="font-stamp text-xs font-bold">
                    Tertarik bikin rilisan co-branded serupa?
                  </span>
                  <Link
                    href="/kolab"
                    className="riso-shadow font-stamp text-xs font-bold uppercase px-4 py-2 bg-[#8E47EE] text-white border-2 border-[#14101C]"
                  >
                    Diskusi Co-Brand →
                  </Link>
                </div>
              </>
            ) : waReadyText ? (
              <>
                <div className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#92FA66] border-2 border-[#14101C] inline-block mb-3">
                  FORMAT ORDER SIAP KIRIM
                </div>
                <h3 className="font-poster text-3xl uppercase mb-2">
                  LANJUT KE WHATSAPP ADMIN
                </h3>
                <div className="p-4 bg-white border-2 border-[#14101C] font-stamp text-xs text-[#14101C] mb-4">
                  {waReadyText}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(waReadyText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-2.5 bg-[#176B3F] text-[#92FA66] border-2 border-[#14101C]"
                  >
                    Buka WhatsApp Sekarang ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => setWaReadyText(null)}
                    className="font-stamp text-xs font-bold uppercase px-4 py-2.5 border-2 border-[#14101C]"
                  >
                    Ubah Pesanan
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className="font-stamp text-xs font-bold uppercase px-2.5 py-1 border-2 border-[#14101C] inline-block mb-2"
                  style={{ background: activeItem.statusBg, color: activeItem.statusFg }}
                >
                  {activeItem.status}
                </div>
                <h3 className="font-poster text-3xl uppercase text-[#14101C] mb-1 pr-14">
                  {activeItem.title}
                </h3>
                <div className="font-stamp text-sm font-bold text-[#6C2BD9] mb-3">
                  {activeItem.price} • {activeItem.impactNote}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
                  <div className="sm:col-span-5 h-40 border-2 border-[#14101C] overflow-hidden">
                    <MerchCoverArt
                      artKey={activeItem.artKey}
                      imageUrl={activeItem.imageUrl}
                      title={activeItem.title}
                    />
                  </div>
                  <div className="sm:col-span-7 text-sm text-[#362F42] leading-relaxed">
                    {activeItem.description}
                  </div>
                </div>
                <form
                  onSubmit={handleOrder}
                  className="p-4 bg-[#EBE3D3] border-2 border-[#14101C] space-y-3"
                >
                  <div className="font-stamp text-xs font-bold uppercase">
                    FORM ORDER / PRE-ORDER CEPAT (VIA WA ADMIN)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      required
                      type="text"
                      value={buyer}
                      onChange={(e) => setBuyer(e.target.value)}
                      placeholder="Nama / @username IG"
                      className="px-3 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                    />
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="px-3 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                    >
                      {activeItem.sizes.map((s) => (
                        <option key={s} value={s}>
                          Ukuran: {s}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value || 1))}
                      className="px-3 py-2 bg-white border-2 border-[#14101C] text-xs font-stamp"
                    />
                  </div>
                  <button
                    type="submit"
                    className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-2.5 bg-[#176B3F] text-[#92FA66] border-2 border-[#14101C]"
                  >
                    Buat Format Pesanan WhatsApp →
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
