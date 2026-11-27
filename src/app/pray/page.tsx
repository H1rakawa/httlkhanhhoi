import Footer from "@/com/Footer";
import Header from "@/com/Header";
import PrayPageContent from "@/com/pray/PrayPageContent";
import type { PrayerRequest } from "@/com/pray/prayData";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";
import { getPrayerFeed } from "@/lib/pray/prayers";
import { getAccessToken, getCurrentUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

type PrayPageProps = {
  searchParams: Promise<{ prayer?: string }>;
};

export default async function PrayPage({ searchParams }: PrayPageProps) {
  if (!(await getCurrentUser())) redirect("/auth");

  let requests: PrayerRequest[] = [];
  let loadError: string | null = null;
  try {
    requests = await getPrayerFeed(undefined, await getAccessToken());
  } catch {
    loadError = "Chưa tải được lời cầu thay từ máy chủ. Vui lòng thử tải lại trang.";
  }
  const { prayer } = await searchParams;

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <SiteParallaxBackdrop imageOpacity="opacity-58" overlayClassName="bg-white/38 backdrop-blur-[1px]" />
      <Header activePath="/pray" />
      <PrayPageContent
        initialRequests={requests}
        loadError={loadError}
        initialOpenId={prayer ?? null}
      />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
