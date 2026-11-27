import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import AdminPasswordSecurity from "@/com/admin/AdminPasswordSecurity";
import type { AssignmentItem } from "@/com/assignment/assignmentData";
import DashboardBackdrop from "@/com/dashboard/DashboardBackdrop";
import type { PrayerRequest } from "@/com/pray/prayData";
import ProfileActivity from "@/com/profile/ProfileActivity";
import ProfileEditor from "@/com/profile/ProfileEditor";
import { getMemberAssignments } from "@/lib/assignments/assignments";
import { getPrayerFeed } from "@/lib/pray/prayers";
import { getAccessToken, getCurrentAccount } from "@/lib/supabase/auth";
import {
  getUserAvatarUrl,
  getUserDisplayEmail,
  getUserDisplayName,
} from "@/lib/supabase/user-display";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | HTTL Khánh Hội",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Quản trị viên",
  teacher: "Giáo viên",
  member: "Thành viên",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Đang hoạt động",
  inactive: "Tạm ngưng",
  blocked: "Đã khóa",
};

const PROVIDER_LABELS: Record<string, string> = {
  email: "Email và mật khẩu",
  google: "Google",
  facebook: "Facebook",
};

async function settle<T>(promise: Promise<T>, fallback: T) {
  try {
    return { data: await promise, failed: false };
  } catch {
    return { data: fallback, failed: true };
  }
}

export default async function ProfilePage() {
  const account = await getCurrentAccount();
  const accessToken = await getAccessToken();
  if (!account || !accessToken) redirect("/auth");

  const { user, profile } = account;
  const [assignments, prayers] = await Promise.all([
    settle(getMemberAssignments(user.id, accessToken), [] as AssignmentItem[]),
    settle(getPrayerFeed(undefined, accessToken), [] as PrayerRequest[]),
  ]);

  const providers = user.app_metadata?.providers ?? [user.app_metadata?.provider ?? "email"];
  const hasPassword = providers.includes("email");
  const joinedAt = profile?.created_at ?? user.created_at;
  const joinedLabel = joinedAt
    ? new Intl.DateTimeFormat("vi-VN", {
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date(joinedAt))
    : null;

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <DashboardBackdrop />
      <Header activePath="/profile" />
      <div className="relative z-10 mx-auto grid w-[calc(100%_-_2rem)] max-w-7xl gap-8 pb-20 pt-24 md:pb-28 md:pt-28 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)] lg:items-start">
        <div className="grid min-w-0 gap-8">
          <ProfileEditor
            name={getUserDisplayName(user, profile)}
            email={getUserDisplayEmail(user, profile)}
            phone={profile?.phone ?? null}
            avatarUrl={getUserAvatarUrl(user, profile)}
            roleLabel={ROLE_LABELS[profile?.role ?? "member"] ?? "Thành viên"}
            statusLabel={STATUS_LABELS[profile?.status ?? "active"] ?? "Đang hoạt động"}
            joinedLabel={joinedLabel}
            providerLabel={providers.map((item) => PROVIDER_LABELS[item] ?? item).join(", ")}
          />
          <ProfileActivity
            assignments={assignments.data}
            assignmentsFailed={assignments.failed}
            prayers={prayers.data.filter((prayer) => prayer.isMine)}
            prayersFailed={prayers.failed}
          />
        </div>

        <aside className="grid content-start gap-8 lg:sticky lg:top-28">
          <section className="liquid-readable p-6">
            <h2 className="mb-6 text-lg font-semibold">Bảo mật</h2>
            {hasPassword ? (
              <AdminPasswordSecurity endpoint="/api/profile/password" accountLabel="tài khoản" />
            ) : (
              <p className="text-sm leading-6 text-[#6e6e73]">
                Bạn đăng nhập bằng{" "}
                {providers.map((item) => PROVIDER_LABELS[item] ?? item).join(", ")}, nên tài
                khoản không dùng mật khẩu riêng. Bảo mật đăng nhập do nhà cung cấp đó quản lý.
              </p>
            )}
          </section>

          <section className="liquid-readable p-6">
            <h2 className="text-lg font-semibold">Quyền riêng tư</h2>
            <p className="mt-3 text-sm leading-6 text-[#6e6e73]">
              Số điện thoại của bạn chỉ bạn, giáo viên và ban quản trị xem được. Bạn có thể yêu cầu xóa tài khoản và dữ
              liệu theo hướng dẫn trong{" "}
              <a href="/privacy" className="font-semibold text-[#0066cc] hover:underline">
                Chính sách quyền riêng tư
              </a>
              .
            </p>
          </section>
        </aside>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
