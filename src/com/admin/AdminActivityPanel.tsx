import Image from "next/image";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { recentAdminActivities } from "@/com/admin/adminData";

const statusClassName: Record<string, string> = {
  green: "bg-[#dff3e5] text-[#23774a]",
  slate: "bg-[#e7ecef] text-[#66717a]",
  violet: "bg-[#e7ddff] text-[#7047e8]",
};

export default function AdminActivityPanel() {
  return (
    <section className="min-h-[520px] rounded-[28px] border border-white/72 bg-white/32 p-6 shadow-[0_24px_72px_rgba(31,48,70,0.14)] backdrop-blur-2xl md:p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-[#35404a]">
          Hoạt động gần đây
        </h2>
        <button
          type="button"
          className="rounded-full px-4 py-2 text-sm font-bold text-[#5b6570] transition-colors hover:bg-white/50"
        >
          Xem tất cả
        </button>
      </div>

      <div className="grid gap-4">
        {recentAdminActivities.map((activity) => (
          <article
            key={`${activity.name}-${activity.time}`}
            className="flex items-center gap-4 rounded-[18px] border border-white/78 bg-white/42 p-4 shadow-[0_12px_34px_rgba(31,48,70,0.08)] backdrop-blur-xl md:p-5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e7edf1] text-[#334155]">
              {activity.avatar ? (
                <Image
                  src={activity.avatar}
                  alt=""
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <DashboardIcon name="community" className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-6 text-[#27313a]">
                <span>{activity.name}</span>{" "}
                <span className="font-semibold">{activity.body}</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-[#6f7a84]">
                {activity.time}
              </p>
            </div>
            <span
              className={[
                "hidden rounded-full px-4 py-2 text-xs font-extrabold sm:inline-flex",
                statusClassName[activity.tone],
              ].join(" ")}
            >
              {activity.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
