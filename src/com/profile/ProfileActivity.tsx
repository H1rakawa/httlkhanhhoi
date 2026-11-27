import Link from "next/link";
import {
  assignmentRouteId,
  statusClasses,
  type AssignmentItem,
} from "@/com/assignment/assignmentData";
import PrayerStatusBadge from "@/com/pray/PrayerStatusBadge";
import { relativeTime, type PrayerRequest } from "@/com/pray/prayData";

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="liquid-glass-item flex flex-col justify-center border-b-[3px] border-[#0066cc] p-5 text-[#1d1d1f] no-underline transition-transform hover:-translate-y-0.5"
    >
      <span className="text-sm text-[#8a8a8f]">{label}</span>
      <span className="mt-2 text-3xl font-semibold">{value}</span>
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[14px] border border-white/80 bg-white/46 p-5 text-sm leading-6 text-[#6e6e73]">
      {children}
    </p>
  );
}

export default function ProfileActivity({
  assignments,
  assignmentsFailed,
  prayers,
  prayersFailed,
}: {
  assignments: AssignmentItem[];
  assignmentsFailed: boolean;
  prayers: PrayerRequest[];
  prayersFailed: boolean;
}) {
  const done = assignments.filter(
    (item) => item.status === "Đã nộp" || item.status === "Đã chấm",
  );
  const grades = assignments
    .map((item) => item.grade)
    .filter((grade): grade is number => grade != null);
  const average = grades.length
    ? (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(1)
    : "—";
  const answered = prayers.filter((prayer) => prayer.status === "answered").length;
  const recentAssignments = done.slice(0, 4);
  const recentPrayers = prayers.slice(0, 4);

  return (
    <section className="liquid-readable p-6 md:p-8">
      <h2 className="text-lg font-semibold">Hoạt động của tôi</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Bài tập đã nộp" value={String(done.length)} href="/assignment" />
        <Stat label="Điểm trung bình" value={average} href="/assignment" />
        <Stat label="Lời cầu thay đã gửi" value={String(prayers.length)} href="/pray" />
        <Stat label="Đã được trả lời" value={String(answered)} href="/pray" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-base font-semibold">Bài tập gần đây</h3>
          {recentAssignments.length === 0 ? (
            <Empty>
              {assignmentsFailed
                ? "Chưa tải được danh sách bài tập."
                : "Bạn chưa nộp bài tập nào."}
            </Empty>
          ) : (
            <ul className="overflow-hidden rounded-[14px] border border-white/80 bg-white/46">
              {recentAssignments.map((item) => (
                <li key={item.rawId} className="border-b border-white/70 last:border-b-0">
                  <Link
                    href={`/assignment/${assignmentRouteId(item.rawId)}`}
                    className="flex items-center justify-between gap-4 p-4 text-[#1d1d1f] no-underline hover:bg-white/48"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{item.title}</span>
                      <span className="mt-1 block text-xs text-[#8a8a8f]">
                        {item.id} · {item.category}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusClasses(item.status)}`}
                    >
                      {item.grade != null ? `${item.grade} điểm` : item.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-base font-semibold">Lời cầu thay của tôi</h3>
          {recentPrayers.length === 0 ? (
            <Empty>
              {prayersFailed
                ? "Chưa tải được lời cầu thay."
                : "Bạn chưa gửi lời cầu thay nào."}
            </Empty>
          ) : (
            <ul className="overflow-hidden rounded-[14px] border border-white/80 bg-white/46">
              {recentPrayers.map((prayer) => (
                <li key={prayer.id} className="border-b border-white/70 last:border-b-0">
                  <Link
                    href={`/pray?prayer=${prayer.id}`}
                    className="flex items-center justify-between gap-4 p-4 text-[#1d1d1f] no-underline hover:bg-white/48"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{prayer.title}</span>
                      <span className="mt-1 block text-xs text-[#8a8a8f]" suppressHydrationWarning>
                        {prayer.category} · {relativeTime(prayer.createdAt)} ·{" "}
                        {prayer.intercessionCount} người cầu thay
                      </span>
                    </span>
                    <PrayerStatusBadge status={prayer.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
