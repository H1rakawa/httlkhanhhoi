import type { Metadata } from "next";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import { vietnamDateKey, type AssignmentItem } from "@/com/assignment/assignmentData";
import DashboardBackdrop from "@/com/dashboard/DashboardBackdrop";
import DashboardInfoPanel from "@/com/dashboard/DashboardInfoPanel";
import QuickStats from "@/com/dashboard/QuickStats";
import RecentNotifications from "@/com/dashboard/RecentNotifications";
import ShortcutsPanel from "@/com/dashboard/ShortcutsPanel";
import UpcomingAssignments from "@/com/dashboard/UpcomingAssignments";
import WelcomePanel from "@/com/dashboard/WelcomePanel";
import type { LibraryResource } from "@/com/library/libraryData";
import type { PrayerRequest } from "@/com/pray/prayData";
import { redirect } from "next/navigation";
import { getMemberAssignments } from "@/lib/assignments/assignments";
import { getNotifications, type MemberNotification } from "@/lib/dashboard/notifications";
import { getLibraryResources } from "@/lib/library/resources";
import { getPrayerFeed } from "@/lib/pray/prayers";
import { getAccessToken, getCurrentAccount } from "@/lib/supabase/auth";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/supabase/user-display";

export const metadata: Metadata = {
  title: "Trang cá nhân",
  description: "Bảng điều khiển của thành viên.",
  robots: { index: false, follow: false },
};

async function settle<T>(promise: Promise<T>, fallback: T) {
  try {
    return { data: await promise, failed: false };
  } catch {
    return { data: fallback, failed: true };
  }
}

export default async function DashboardPage() {
  const account = await getCurrentAccount();
  const accessToken = await getAccessToken();
  if (!account || !accessToken) redirect("/auth");

  const userId = account.user.id;
  const [assignments, notifications, library, prayers] = await Promise.all([
    settle(getMemberAssignments(userId, accessToken), [] as AssignmentItem[]),
    settle(getNotifications(userId, accessToken, 20), [] as MemberNotification[]),
    settle(
      getLibraryResources().then((result) => result.resources),
      [] as LibraryResource[],
    ),
    settle(getPrayerFeed(12, accessToken), [] as PrayerRequest[]),
  ]);

  const today = vietnamDateKey();
  const nextWeek = vietnamDateKey(7);
  const upcoming = assignments.data
    .filter((item) => item.dueDate && item.dueDate >= today && item.dueDate <= nextWeek)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  const completed = assignments.data.filter(
    (item) => item.status === "Đã nộp" || item.status === "Đã chấm",
  ).length;
  const grades = assignments.data
    .map((item) => item.grade)
    .filter((grade): grade is number => grade != null);
  const average = grades.length
    ? (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(1)
    : null;
  const unread = notifications.data.filter((item) => !item.isRead).length;

  // Lời cầu thay công khai đã duyệt của người khác.
  const communityPrayers = prayers.data
    .filter(
      (prayer) =>
        !prayer.isMine &&
        prayer.privacy === "public" &&
        (prayer.status === "approved" || prayer.status === "answered"),
    )
    .slice(0, 2);

  const displayName = getUserDisplayName(account.user, account.profile);
  const email = account.profile?.email || account.user.email || "";
  const avatarUrl = getUserAvatarUrl(account.user, account.profile);

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <DashboardBackdrop />
      <Header activePath="/dashboard" />
      <div className="relative z-10 mx-auto w-[calc(100%_-_2rem)] max-w-7xl pb-20 pt-24 md:pb-28 md:pt-28">
        <div>
          <WelcomePanel
            displayName={displayName}
            email={email}
            avatarUrl={avatarUrl}
            status={account.profile?.status || "active"}
            role={account.profile?.role || "member"}
          />

          <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-[1.65fr_0.8fr]">
            <div id="assignments" className="h-full">
              <UpcomingAssignments
                assignments={upcoming}
                error={assignments.failed ? "Không thể tải bài tập sắp tới." : null}
              />
            </div>
            <QuickStats completed={completed} average={average} unread={unread} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.65fr_0.8fr]">
            <DashboardInfoPanel
              resources={library.data.slice(0, 2)}
              prayers={communityPrayers}
              prayersFailed={prayers.failed}
            />
            <div className="grid content-start gap-8">
              <RecentNotifications
                notifications={notifications.data.slice(0, 5)}
                failed={notifications.failed}
              />
              <ShortcutsPanel />
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
