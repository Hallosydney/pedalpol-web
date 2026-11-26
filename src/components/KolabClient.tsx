"use client";

import Link from "next/link";
import { useState } from "react";
import { useMotion } from "@/components/MotionProvider";

export function KolabClient({ docCount }: { docCount: number }) {
  const { openStoryModal } = useMotion();
  const [collabTopic, setCollabTopic] = useState<string | null>(null);
  const [mediaKitOpen, setMediaKitOpen] = useState(false);

  const [brandName, setBrandName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const openCollab = (topic: string) => {
    setMediaKitOpen(false);
    setCollabTopic(topic);
    setSent(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabTopic) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: collabTopic,
          brandName,
          contact,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim brief.");
      setSent(true);
      setBrandName("");
      setContact("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim brief.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-[#8E47EE] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <span className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#14101C] text-[#92FA66] border-2 border-[#92FA66] inline-block mb-3">
              BRAND PORTFOLIO • MEDIA KIT • 3-COMMUNITY ALLIANCE
            </span>
            <h1 className="font-poster text-5xl sm:text-6xl uppercase">
              BIKIN GERAKAN BARENG PEDALPOL
            </h1>
            <p className="text-base text-white/92 max-w-2xl mt-2">
              Bukan sekadar satu klub sepeda—kami bergerak bersama{" "}
              <strong>aliansi 3 komunitas yang selalu gandeng</strong> di jantung Jakarta,
              siap menjadi partner organik untuk aktivasi brand, kampanye sosial, hingga{" "}
              <em>co-branded drop</em>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => openCollab("Request Media Kit & Brand Activation")}
              className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-3 bg-[#92FA66] text-[#14101C] border-2 border-[#14101C]"
            >
              Ajukan Kolaborasi Brand →
            </button>
            <button
              type="button"
              onClick={() => setMediaKitOpen(true)}
              className="font-stamp text-xs font-bold uppercase px-4 py-3 bg-[#14101C] text-[#F5F0E6] border-2 border-[#F5F0E6] hover:border-[#92FA66] hover:text-[#92FA66] transition-colors"
            >
              📄 Preview Media Kit
            </button>
          </div>
        </div>

        {/* Brand Reach Snapshot */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { num: "3", title: "Komunitas Gandeng", sub: "Cross-cycling & creator" },
            { num: "200+", title: "Gabungan Anggota Aktif", sub: "Urban professionals JKT" },
            { num: "4+", title: "Agenda Rutin / Minggu", sub: "Raboo-Raboo, Sabtu, Minggu, Ngelayap" },
            { num: "100%", title: "All-Bike & Organik", sub: 'Fixie • Gravel • Road • 26"' },
          ].map((m) => (
            <div
              key={m.title}
              className="bg-[#14101C] border-2 border-[#14101C] riso-shadow-lime p-5"
            >
              <div className="font-poster text-4xl sm:text-5xl text-[#92FA66]">{m.num}</div>
              <div className="font-stamp text-xs uppercase font-bold mt-1">{m.title}</div>
              <div className="font-stamp text-[11px] text-[#BEB5CA] mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* CORE CIRCLE: 3 KOMUNITAS GANDENG */}
        <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow p-6 sm:p-7 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-4 border-b-2 border-dashed border-[#14101C]/35">
            <div>
              <span className="font-stamp text-[11px] font-bold uppercase px-2 py-0.5 bg-[#92FA66] border border-[#14101C] inline-block mb-1.5">
                CORE ALLIANCE • TRIO KOLEKTIF
              </span>
              <h2 className="font-poster text-3xl sm:text-4xl uppercase">
                3 KOMUNITAS GANDENG TERUS
              </h2>
            </div>
            <p className="font-stamp text-xs text-[#4B4258] max-w-md">
              Satu kolaborasi langsung menggerakkan ekosistem 3 pilar:{" "}
              <strong>Massa &amp; Agenda</strong> (PedalPol) +{" "}
              <strong>Street Culture</strong> (BikeBaik) +{" "}
              <strong>Mesin Konten Visual</strong> (Bike2Ngonten).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 01 PEDALPOL */}
            <div className="art-tilt p-5 bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <img
                    src="/logos/pedalpol.webp"
                    alt="Logo PedalPol"
                    className="w-16 h-16 object-cover border-2 border-[#14101C] bg-[#14101C]"
                  />
                  <span className="font-stamp text-[10px] font-bold uppercase px-2 py-1 bg-[#8E47EE] text-white border border-[#14101C]">
                    01 / COMMUNITY CORE
                  </span>
                </div>
                <h3 className="font-poster text-2xl uppercase mb-1">PEDALPOL</h3>
                <a
                  href="https://www.instagram.com/pedalpol/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-stamp text-xs font-bold text-[#6C2BD9] hover:underline inline-block mb-2"
                >
                  @pedalpol ↗
                </a>
                <p className="text-xs text-[#362F42] leading-relaxed">
                  Basis Menteng lintas sepeda (Fixie, Gravel, Road, Commuter 26&quot;). Motor{" "}
                  <em>Raboo-Raboo</em>, <em>Sporty Edition</em>, <em>Sunday Morning Pol</em>,{" "}
                  <em>Ngelayap</em> &amp; Zine.
                </p>
              </div>
              <div className="mt-4 pt-2.5 border-t border-[#14101C]/25 font-stamp text-[10px] font-bold uppercase text-[#14101C]">
                PERAN BRAND: MASSA • RUTE • ZINE &amp; ESG
              </div>
            </div>

            {/* 02 BIKEBAIK */}
            <div className="art-tilt p-5 bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <img
                    src="/logos/bikebaik.webp"
                    alt="Logo BikeBaik di Jalan"
                    className="w-16 h-16 object-cover border-2 border-[#14101C] bg-[#19498A]"
                  />
                  <span className="font-stamp text-[10px] font-bold uppercase px-2 py-1 bg-[#19498A] text-[#92FA66] border border-[#14101C]">
                    02 / ROAD CULTURE
                  </span>
                </div>
                <h3 className="font-poster text-2xl uppercase mb-1">BIKEBAIK DIJALAN</h3>
                <a
                  href="https://www.instagram.com/bikebaik.dijalan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-stamp text-xs font-bold text-[#19498A] hover:underline inline-block mb-2"
                >
                  @bikebaik.dijalan ↗
                </a>
                <p className="text-xs text-[#362F42] leading-relaxed">
                  Penggerak budaya bersepeda yang baik, aman, dan ramah di jalan raya—memastikan
                  setiap aktivasi kolaborasi selalu positif &amp; <em>brand-safe</em>.
                </p>
              </div>
              <div className="mt-4 pt-2.5 border-t border-[#14101C]/25 font-stamp text-[10px] font-bold uppercase text-[#19498A]">
                PERAN BRAND: STREET CULTURE • SAFETY
              </div>
            </div>

            {/* 03 BIKE2NGONTEN */}
            <div className="art-tilt p-5 bg-[#EBE3D3] border-2 border-[#14101C] riso-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <img
                    src="/logos/bike2ngonten.webp"
                    alt="Logo Bike2Ngonten"
                    className="w-16 h-16 object-cover border-2 border-[#14101C] bg-[#FAD1D8]"
                  />
                  <span className="font-stamp text-[10px] font-bold uppercase px-2 py-1 bg-[#FAD1D8] text-[#14101C] border border-[#14101C]">
                    03 / CONTENT ENGINE
                  </span>
                </div>
                <h3 className="font-poster text-2xl uppercase mb-1">BIKE2NGONTEN</h3>
                <a
                  href="https://www.instagram.com/bike2ngonten/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-stamp text-xs font-bold text-[#B83265] hover:underline inline-block mb-2"
                >
                  @bike2ngonten ↗
                </a>
                <p className="text-xs text-[#362F42] leading-relaxed">
                  Kolektif pesepeda + kreator kamera yang memproduksi dokumentasi foto,{" "}
                  <em>Reels</em>, dan cerita visual autentik langsung dari atas sadel.
                </p>
              </div>
              <div className="mt-4 pt-2.5 border-t border-[#14101C]/25 font-stamp text-[10px] font-bold uppercase text-[#B83265]">
                PERAN BRAND: UGC • REELS • FOTO PRODUK
              </div>
            </div>
          </div>
        </div>

        {/* BRAND CASE STUDIES */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <div className="font-stamp text-xs font-bold uppercase text-[#92FA66] mb-2">
                REKAM JEJAK &amp; STUDI KASUS
              </div>
              <h2 className="font-poster text-3xl sm:text-4xl uppercase">
                PORTOFOLIO KOLABORASI SEBELUMNYA
              </h2>
            </div>
            <Link
              href="/zine#zine-contact-sheet"
              className="font-stamp text-xs font-bold uppercase px-4 py-2 border-2 border-[#92FA66] text-[#92FA66] hover:bg-[#92FA66] hover:text-[#14101C] transition-colors w-fit"
            >
              🎞 Lihat Foto &amp; Video Reels Asli ({docCount}) →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="art-tilt bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-lime p-5 flex flex-col justify-between">
              <div>
                <span className="font-stamp text-[10px] font-bold uppercase px-2 py-0.5 bg-[#176B3F] text-[#92FA66] border border-[#92FA66]">
                  ECO / ESG CAMPAIGN
                </span>
                <h3 className="font-poster text-2xl uppercase mt-3 mb-2">
                  FOR REST FOREST × LINDUNGIHUTAN
                </h3>
                <p className="text-xs text-[#D6CFE0] leading-relaxed mb-4">
                  Kampanye donasi pohon komunitas &amp; ambassador. Bukti bahwa audiens
                  PedalPol peduli aksi nyata dan keberlanjutan.
                </p>
              </div>
              <div className="pt-3 border-t border-[#F5F0E6]/20 flex items-center justify-between font-stamp text-[11px]">
                <span className="text-[#92FA66] font-bold">52+ Riders • 25+ Pohon</span>
                <Link href="/zine/for-rest-forest" className="underline hover:text-[#92FA66]">
                  Lihat di Zine →
                </Link>
              </div>
            </div>

            <div className="art-tilt bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-lime p-5 flex flex-col justify-between">
              <div>
                <span className="font-stamp text-[10px] font-bold uppercase px-2 py-0.5 bg-[#FF5B37] text-white">
                  CULTURAL INSTITUTION
                </span>
                <h3 className="font-poster text-2xl uppercase mt-3 mb-2">
                  MENYAPA MUSEUM × MUSKITNAS
                </h3>
                <p className="text-xs text-[#D6CFE0] leading-relaxed mb-4">
                  Tur sepeda budaya resmi bersama Museum Kebangkitan Nasional—format{" "}
                  <em>storytelling</em> organik yang ramah keluarga &amp; media.
                </p>
              </div>
              <div className="pt-3 border-t border-[#F5F0E6]/20 flex items-center justify-between font-stamp text-[11px]">
                <span className="text-[#92FA66] font-bold">74 Riders • Sept 2026</span>
                <Link href="/zine/menyapa-museum" className="underline hover:text-[#92FA66]">
                  Lihat di Zine →
                </Link>
              </div>
            </div>

            <div className="art-tilt bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-lime p-5 flex flex-col justify-between">
              <div>
                <span className="font-stamp text-[10px] font-bold uppercase px-2 py-0.5 bg-[#8E47EE] text-white">
                  TRIO &amp; CROSS-SPORT
                </span>
                <h3 className="font-poster text-2xl uppercase mt-3 mb-2">
                  STROLLING BRAND &amp; BRICK SESSION
                </h3>
                <p className="text-xs text-[#D6CFE0] leading-relaxed mb-4">
                  Aktivasi bersama brand lokal, sesi gabungan bareng <code>@pegipeda</code>,
                  serta dokumentasi konten lintas <code>@bikebaik.dijalan</code> &amp;{" "}
                  <code>@bike2ngonten</code>.
                </p>
              </div>
              <div className="pt-3 border-t border-[#F5F0E6]/20 flex items-center justify-between font-stamp text-[11px]">
                <span className="text-[#92FA66] font-bold">3 Komunitas • High UGC</span>
                <Link href="/agenda?tab=archive" className="underline hover:text-[#92FA66]">
                  Arsip Buletin →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FORMAT AKTIVASI BRAND + UNDANGAN KOMUNITAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow p-7 flex flex-col justify-between">
            <div>
              <span className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#92FA66] border-2 border-[#14101C] inline-block mb-4">
                MENU AKTIVASI BRAND
              </span>
              <h2 className="font-poster text-3xl uppercase mb-3">
                CARA BRAND BISA MASUK &amp; KOLABORASI
              </h2>
              <ul className="text-sm text-[#362F42] space-y-2 mb-6 list-disc pl-5">
                <li>
                  <strong>Strolling &amp; Pop-Up Finish:</strong> Arahkan peloton 50–150+ rider
                  dari 3 komunitas ke kafe/toko/event brand kamu.
                </li>
                <li>
                  <strong>Product Test &amp; Zine Feature:</strong> Uji coba produk (apparel,
                  kopi, helm, minuman, gear) + liputan editorial di <em>Zine PedalPol</em>.
                </li>
                <li>
                  <strong>Co-Branded Limited Merch:</strong> Rilis jersey, tote bag, atau bidon
                  edisi kolaborasi di halaman <em>Merch</em>.
                </li>
                <li>
                  <strong>CSR / Eco-Ride:</strong> Sponsori sesi gowes + donasi pohon{" "}
                  <em>For Rest Forest</em>.
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => openCollab("Brand Activation / Strolling")}
              className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-3 bg-[#14101C] text-[#92FA66] border-2 border-[#14101C] w-fit"
            >
              Diskusi Kolaborasi Brand →
            </button>
          </div>

          <div className="bg-[#14101C] text-[#F5F0E6] border-2 border-[#14101C] riso-shadow-lime p-7 flex flex-col justify-between">
            <div>
              <span className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#8E47EE] text-white border-2 border-[#F5F0E6] inline-block mb-4">
                SOLIDARITAS KOMUNITAS
              </span>
              <h2 className="font-poster text-3xl uppercase mb-3">
                UNDANG PEDALPOL SUPPORT ACARAMU!
              </h2>
              <p className="text-sm text-[#D6CFE0] leading-relaxed mb-5">
                Punya acara <em>anniversary</em>, gowes amal, <em>brick session</em>, atau{" "}
                <em>alleycat</em>? Kirim undangannya—barisan Fixie, Gravel, Road Bike, dan
                Commuter 26&quot; PedalPol siap hadir dan ikut meramaikan dokumentasi di Zine
                kami.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openCollab("Support Event Komunitas")}
                className="font-stamp text-xs font-bold uppercase px-5 py-3 bg-[#92FA66] text-[#14101C] border-2 border-[#92FA66] hover:bg-white transition-colors"
              >
                Kirim Undangan Komunitas →
              </button>
              <button
                type="button"
                onClick={openStoryModal}
                className="font-stamp text-xs font-bold uppercase px-4 py-3 border border-[#F5F0E6]/45 text-[#F5F0E6] hover:border-[#92FA66]"
              >
                ✍ Kirim Cerita ke Zine
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MEDIA KIT MODAL */}
      {mediaKitOpen && (
        <div
          className="fixed inset-0 z-[125] bg-[#14101C]/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMediaKitOpen(false);
          }}
        >
          <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow-lime max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setMediaKitOpen(false)}
              className="absolute top-4 right-4 font-stamp text-xs font-bold px-2.5 py-1 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#14101C] hover:text-[#92FA66]"
            >
              ESC ✕
            </button>
            <div className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#92FA66] border-2 border-[#14101C] inline-block mb-3">
              MEDIA KIT SNAPSHOT // 2026
            </div>
            <h3 className="font-poster text-3xl uppercase text-[#14101C] mb-2 pr-14">
              PEDALPOL × BIKEBAIK × BIKE2NGONTEN
            </h3>
            <p className="text-sm text-[#362F42] mb-4">
              Ringkasan Media Kit kolaborasi aliansi 3 komunitas sepeda Jakarta untuk Brand
              Manager &amp; Agency:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
              {[
                { img: "/logos/pedalpol.webp", label: "@pedalpol" },
                { img: "/logos/bikebaik.webp", label: "@bikebaik.dijalan" },
                { img: "/logos/bike2ngonten.webp", label: "@bike2ngonten" },
              ].map((l) => (
                <div
                  key={l.label}
                  className="p-2 bg-[#EBE3D3] border-2 border-[#14101C] flex items-center gap-2"
                >
                  <img
                    src={l.img}
                    alt={l.label}
                    className="w-9 h-9 object-cover border border-[#14101C]"
                  />
                  <span className="font-stamp text-[10px] font-bold truncate">{l.label}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2.5 font-stamp text-xs mb-5">
              <div className="p-3 bg-[#EBE3D3] border-2 border-[#14101C]">
                <strong>AUDIENS INTI:</strong> 200+ gabungan anggota aktif (usia 22–38 thn,
                pekerja kreatif &amp; korporat Jakarta Pusat–Selatan).
              </div>
              <div className="p-3 bg-[#EBE3D3] border-2 border-[#14101C]">
                <strong>KEKUATAN TRIO:</strong> Massa &amp; agenda <code>@pedalpol</code> +
                kampanye jalan aman <code>@bikebaik.dijalan</code> + produksi Reels/foto organik{" "}
                <code>@bike2ngonten</code> + artikel permanen di <em>Zine PedalPol</em>.
              </div>
              <div className="p-3 bg-[#EBE3D3] border-2 border-[#14101C]">
                <strong>REKAM JEJAK:</strong> LindungiHutan (<em>For Rest Forest</em>), Museum
                Kebangkitan Nasional, <code>@pegipeda</code>, &amp; brand lokal.
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => openCollab("Request Full PDF Media Kit & Ratecard")}
                className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-2.5 bg-[#8E47EE] text-white border-2 border-[#14101C]"
              >
                Minta PDF Lengkap &amp; Ratecard →
              </button>
              <button
                type="button"
                onClick={() => setMediaKitOpen(false)}
                className="font-stamp text-xs font-bold uppercase px-4 py-2.5 border-2 border-[#14101C]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLLAB INQUIRY MODAL */}
      {collabTopic && (
        <div
          className="fixed inset-0 z-[125] bg-[#14101C]/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCollabTopic(null);
          }}
        >
          <div className="bg-[#F5F0E6] text-[#14101C] border-2 border-[#14101C] riso-shadow-lime max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setCollabTopic(null)}
              className="absolute top-4 right-4 font-stamp text-xs font-bold px-2.5 py-1 border-2 border-[#14101C] bg-[#EBE3D3] hover:bg-[#14101C] hover:text-[#92FA66]"
            >
              ESC ✕
            </button>

            {sent ? (
              <div className="py-6 text-center">
                <span className="inline-block px-3 py-1 bg-[#92FA66] border-2 border-[#14101C] font-stamp text-xs font-bold uppercase mb-3">
                  ✓ BRIEF MASUK KE INBOX PEDALPOL
                </span>
                <h3 className="font-poster text-3xl uppercase mb-2">
                  GAS POL! SAMPAI KETEMU DI JALAN
                </h3>
                <p className="text-sm text-[#362F42] mb-5">
                  Brief kolaborasimu sudah tersimpan di Inbox Panel Admin PedalPol. Tim PIC kami
                  akan segera menghubungi balik!
                </p>
                <button
                  type="button"
                  onClick={() => setCollabTopic(null)}
                  className="font-stamp text-xs font-bold uppercase px-5 py-2.5 bg-[#14101C] text-[#92FA66] border-2 border-[#14101C]"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <div className="font-stamp text-xs font-bold uppercase px-2.5 py-1 bg-[#92FA66] border-2 border-[#14101C] inline-block mb-3">
                  {collabTopic}
                </div>
                <h3 className="font-poster text-3xl uppercase text-[#14101C] mb-2 pr-14">
                  YUK BIKIN GERAKAN BARENG!
                </h3>
                {error && (
                  <div className="mb-3 p-2.5 bg-[#FF5B37]/15 border-2 border-[#FF5B37] font-stamp text-xs">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block font-stamp text-xs font-bold uppercase mb-1">
                      Nama Brand / Komunitas
                    </label>
                    <input
                      required
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="cth. Kopi Menteng / Komunitas Sepeda..."
                      className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-stamp text-xs font-bold uppercase mb-1">
                      Kontak WA / Email / IG PIC
                    </label>
                    <input
                      required
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="cth. 0812-xxxx / @brandkamu"
                      className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-sm font-stamp"
                    />
                  </div>
                  <div>
                    <label className="block font-stamp text-xs font-bold uppercase mb-1">
                      Ide Event / Tanggal Rencana
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Strolling weekend, pop-up booth, refreshment riders, atau undangan support..."
                      className="w-full px-3 py-2 bg-white border-2 border-[#14101C] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="riso-shadow font-stamp text-xs font-bold uppercase px-5 py-2.5 bg-[#8E47EE] text-white border-2 border-[#14101C] disabled:opacity-50"
                  >
                    {busy ? "Mengirim..." : "Kirim Brief Kolaborasi →"}
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
