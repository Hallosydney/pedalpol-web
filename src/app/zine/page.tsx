import type { Metadata } from "next";
import { ZineClient } from "@/components/ZineClient";
import { listArticles, listDocItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zine PedalPol & Contact Sheet Reels",
  description:
    "Majalah indie komunitas sepeda PedalPol: cerita jalan Rabo-Rabo, catatan Ngelayap, Bike Check, Contact Sheet foto asli & Street Reels Sudirman.",
};

export default async function ZinePage() {
  const [articles, docs] = await Promise.all([listArticles(), listDocItems()]);
  return <ZineClient articles={articles} docs={docs} />;
}
