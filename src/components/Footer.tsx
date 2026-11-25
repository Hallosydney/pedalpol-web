import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#14101C] text-[#F5F0E6] border-t-2 border-[#92FA66] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="font-poster text-3xl text-[#92FA66] uppercase tracking-wide">
            PEDAL POL
          </div>
          <p className="font-stamp text-xs text-[#BEB5CA] mt-1">
            Menteng, Jakarta Pusat • Budak Korporat yang Melarikan Diri Lewat Jalur Sepeda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-stamp text-xs uppercase">
          <Link
            href="/zine"
            className="px-3 py-1.5 border border-[#F5F0E6]/40 hover:border-[#92FA66] transition-colors"
          >
            Zine PedalPol
          </Link>
          <a
            href="https://www.instagram.com/pedalpol/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-[#92FA66] text-[#92FA66] hover:bg-[#92FA66] hover:text-[#14101C] transition-colors"
          >
            Instagram @pedalpol ↗
          </a>
          <a
            href="https://lindungihutan.com/pedalhijauuntukbumi"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-[#F5F0E6]/40 hover:border-[#92FA66] transition-colors"
          >
            LindungiHutan ↗
          </a>
          <Link
            href="/admin"
            className="px-2.5 py-1.5 border border-[#F5F0E6]/20 text-[#BEB5CA] hover:border-[#92FA66] hover:text-[#92FA66] transition-colors"
          >
            🔒 Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
