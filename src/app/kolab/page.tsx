import type { Metadata } from "next";
import { KolabClient } from "@/components/KolabClient";
import { listDocItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kolab Brand & Aliansi 3 Komunitas",
  description:
    "Portofolio kolaborasi brand & Media Kit aliansi 3 komunitas sepeda Jakarta: @pedalpol × @bikebaik.dijalan × @bike2ngonten.",
};

export default async function KolabPage() {
  const docs = await listDocItems();
  return <KolabClient docCount={docs.length} />;
}
