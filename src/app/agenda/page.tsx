import type { Metadata } from "next";
import { AgendaClient } from "@/components/AgendaClient";
import { listRides } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda Gowes & Rute",
  description:
    "Jadwal gowes Upcoming PedalPol (Rabo-Rabo, Sporty Edition, Sunday Morning Pol, Ngelayap), Join barisan tanpa login dengan Digital Ride Pass, Informasi Brosur dinamis, dan Archive Buletin.",
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; ride?: string }>;
}) {
  const [rides, sp] = await Promise.all([listRides(), searchParams]);
  const initialTab = sp.tab === "archive" ? "archive" : "upcoming";
  const initialOpenRideId = sp.ride || null;

  return (
    <AgendaClient
      initialRides={rides}
      initialTab={initialTab}
      initialOpenRideId={initialOpenRideId}
    />
  );
}
