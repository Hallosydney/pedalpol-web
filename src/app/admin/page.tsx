import type { Metadata } from "next";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getSiteSettings,
  getStorageMode,
  listArticles,
  listCollabInquiries,
  listDocItems,
  listMerchItems,
  listRides,
  listStorySubmissions,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  const storageMode = getStorageMode();

  if (!authed) {
    return (
      <AdminDashboardClient
        initialAuthenticated={false}
        storageMode={storageMode}
        initialRides={[]}
        initialArticles={[]}
        initialDocs={[]}
        initialMerch={[]}
        initialSubmissions={[]}
        initialInquiries={[]}
        initialSettings={{ whatsappAdmin: "6281234567890", treeCount: 25 }}
      />
    );
  }

  const [rides, articles, docs, merch, submissions, inquiries, settings] =
    await Promise.all([
      listRides(),
      listArticles(),
      listDocItems(),
      listMerchItems(),
      listStorySubmissions(),
      listCollabInquiries(),
      getSiteSettings(),
    ]);

  return (
    <AdminDashboardClient
      initialAuthenticated={true}
      storageMode={storageMode}
      initialRides={rides}
      initialArticles={articles}
      initialDocs={docs}
      initialMerch={merch}
      initialSubmissions={submissions}
      initialInquiries={inquiries}
      initialSettings={settings}
    />
  );
}
