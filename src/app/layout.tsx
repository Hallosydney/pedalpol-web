import type { Metadata, Viewport } from "next";
import { Anton, Newsreader, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import { Navbar } from "@/components/Navbar";
import { listArticles } from "@/lib/store";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://pedalpol.id");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14101C",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PEDAL POL — Zine, Agenda & Komunitas Sepeda | Menteng, Jakarta",
    template: "%s | PEDAL POL",
  },
  description:
    'PedalPol (@pedalpol) — Komunitas sepeda lintas genre (Fixie, Gravel, Road Bike, Commuter 26") berbasis di Menteng, Jakarta Pusat. Zine cerita jalan, agenda gowes, merch, kampanye For Rest Forest, dan kolaborasi 3 komunitas.',
  openGraph: {
    title: "PEDAL POL — Zine & Komunitas Sepeda Menteng, Jakarta",
    description:
      "Budak Korporat yang Melarikan Diri Lewat Jalur Sepeda. Aliansi @pedalpol × @bikebaik.dijalan × @bike2ngonten.",
    type: "website",
    locale: "id_ID",
    images: [{ url: "/media/skyline-bikes.webp", width: 1200, height: 900, alt: "PedalPol Jakarta Cycling Community" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const articles = await listArticles();

  return (
    <html
      lang="id"
      className={`${anton.variable} ${jakarta.variable} ${newsreader.variable} ${spaceMono.variable} h-full`}
    >
      <body className="riso-grain antialiased selection:bg-[#92FA66] selection:text-[#14101C] min-h-full flex flex-col">
        <MotionProvider>
          <Navbar articleCount={articles.length} />
          <main className="flex-1">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
