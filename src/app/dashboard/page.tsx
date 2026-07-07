import Footer from "@/com/Footer";
import Header from "@/com/Header";
import DashboardBackdrop from "@/com/dashboard/DashboardBackdrop";
import QuickStats from "@/com/dashboard/QuickStats";
import RecentNotifications from "@/com/dashboard/RecentNotifications";
import ShortcutsPanel from "@/com/dashboard/ShortcutsPanel";
import UpcomingAssignments from "@/com/dashboard/UpcomingAssignments";
import WelcomePanel from "@/com/dashboard/WelcomePanel";
import { redirect } from "next/navigation";
import { getCurrentAccount } from "@/lib/supabase/auth";
import {
  getUserAvatarUrl,
  getUserDisplayName,
} from "@/lib/supabase/user-display";

export default async function DashboardPage() {
  const account = await getCurrentAccount();
  if (!account) redirect("/auth");

  const displayName = getUserDisplayName(account.user, account.profile);
  const email = account.profile?.email || account.user.email || "";
  const avatarUrl = getUserAvatarUrl(account.user, account.profile);

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <DashboardBackdrop />
      <Header activePath="/dashboard" />
      <div className="relative z-10 mx-auto max-w-7xl pb-20 pt-24 md:pb-28 md:pt-28">
        <div>
          <WelcomePanel
            displayName={displayName}
            email={email}
            avatarUrl={avatarUrl}
            status={account.profile?.status || "active"}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.65fr_0.8fr]">
            <div className="grid content-start gap-8">
              <div id="assignments">
                <UpcomingAssignments />
              </div>
              <RecentNotifications />
            </div>
            <aside className="grid content-start gap-8">
              <QuickStats />
              <ShortcutsPanel />
            </aside>
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
