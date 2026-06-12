import DashboardFooter from "@/com/dashboard/DashboardFooter";
import DashboardHeader from "@/com/dashboard/DashboardHeader";
import QuickStats from "@/com/dashboard/QuickStats";
import RecentNotifications from "@/com/dashboard/RecentNotifications";
import ShortcutsPanel from "@/com/dashboard/ShortcutsPanel";
import UpcomingAssignments from "@/com/dashboard/UpcomingAssignments";
import WelcomePanel from "@/com/dashboard/WelcomePanel";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <DashboardHeader />
      <div className="mx-auto max-w-7xl px-5 py-10 md:py-12">
        <WelcomePanel />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.65fr_0.8fr]">
          <div className="grid gap-10">
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
      <div className="mt-20">
        <DashboardFooter />
      </div>
    </main>
  );
}
