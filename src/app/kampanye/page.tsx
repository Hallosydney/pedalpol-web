import type { Metadata } from "next";
import { KampanyeClient } from "@/components/KampanyeClient";
import { getSiteSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kampanye For Rest Forest × LindungiHutan",
  description:
    "Dari setiap kayuhan, tumbuh kepedulian untuk menjaga hutan Indonesia. Simulasi tanam pohon For Rest Forest bersama LindungiHutan & agenda sosial PedalPol.",
};

export default async function KampanyePage() {
  const settings = await getSiteSettings();
  return <KampanyeClient initialTreeCount={settings.treeCount} />;
}
