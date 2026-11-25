import type { Metadata } from "next";
import { MerchClient } from "@/components/MerchClient";
import { getSiteSettings, listMerchItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merch & Supply",
  description:
    "PedalPol Supply: Jersey Sporty Edition, Sunday Morning Pol Graphic Tee, Commuter 26\" Musette, Sticker Bomb Pack, dan Co-Branded Archive.",
};

export default async function MerchPage() {
  const [items, settings] = await Promise.all([
    listMerchItems(),
    getSiteSettings(),
  ]);
  return <MerchClient items={items} whatsappAdmin={settings.whatsappAdmin} />;
}
