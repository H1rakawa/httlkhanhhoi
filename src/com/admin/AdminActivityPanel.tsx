import Link from "next/link";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { relativeTime } from "@/com/pray/prayData";
import type { AdminActivity, AdminActivityTone } from "@/lib/admin/overview";

const statusClassName: Record<AdminActivityTone, string> = {
  green: "bg-[#dff3e5] text-[#23774a]",
  slate: "bg-[#e7ecef] text-[#66717a]",
  violet: "bg-[#e7ddff] text-[#7047e8]",
  blue: "bg-[#e1edff] text-[#0066cc]",
  gold: "bg-[#fff2c9] text-[#8a6110]",
};

function ActivityRow({ activity }: { activity: AdminActivity }) {
  return (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e7edf1] text-[#334155]">
        {activity.avatarUrl ? (
          <span
            className="block h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url("${activity.avatarUrl}")` }}
          />
        ) : (
          <DashboardIcon name="community" className="h-5 w-5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-6 text-[#27313a]">
          <span>{activity.name}</span> <span className="font-semibold">{activity.body}</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-[#6f7a84]" suppressHydrationWarning>
          {relativeTime(activity.createdAt)}
        </p>
      </div>
      <span
        className={[
          "hidden shrink-0 rounded-full px-4 py-2 text-xs font-extrabold sm:inline-flex",
          statusClassName[activity.tone],
        ].join(" ")}
      >
        {activity.status}
      </span>
    </>
  );
}

export default function AdminActivityPanel({ activities }: { activities: AdminActivity[] }) {
  const rowClassName =
    "flex items-center gap-4 rounded-[18px] border border-white/78 bg-white/42 p-4 text-inherit no-underline shadow-[0_12px_34px_rgba(31,48,70,0.08)] backdrop-blur-xl md:p-5";

  return (
    <section className="min-h-[520px] rounded-[28px] border border-white/72 bg-white/32 p-6 shadow-[0_24px_72px_rgba(31,48,70,0.14)] backdrop-blur-2xl md:p-7">
      <h2 className="mb-6 text-base font-extrabold text-[#35404a]">Hoạt động gần đây</h2>

      {activities.length === 0 ? (
        <p className="rounded-[18px] border border-white/78 bg-white/42 p-5 text-sm font-semibold leading-6 text-[#6f7a84]">
          Chưa có hoạt động nào. Thành viên mới, bài nộp, lời cầu thay, đăng ký sự kiện và lời
          nhắn liên hệ sẽ hiện ở đây.
        </p>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity) =>
            activity.href ? (
              <Link
                key={activity.id}
                href={activity.href}
                className={`${rowClassName} transition-colors hover:bg-white/60`}
              >
                <ActivityRow activity={activity} />
              </Link>
            ) : (
              <article key={activity.id} className={rowClassName}>
                <ActivityRow activity={activity} />
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}
