import Link from "next/link";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { dashboardPrayerRequests } from "@/com/dashboard/dashboardInfoData";

export default function LatestPrayerRequests() {
  return (
    <section className="mt-9">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-normal text-[#25262b]">
          Lời cầu thay mới nhất
        </h2>
        <Link
          href="/pray"
          className="shrink-0 text-sm font-semibold text-[#0066cc] hover:underline"
        >
          Gửi yêu cầu
        </Link>
      </div>

      <div className="grid gap-5">
        {dashboardPrayerRequests.map((request) => (
          <article
            key={request.id}
            className="liquid-glass-item border-white/80 p-5 md:p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8eef5] text-sm font-semibold text-[#7b8794]">
                  {request.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-6">
                    {request.author}
                  </h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.04em] text-[#0066cc]">
                    {request.category}
                  </p>
                </div>
              </div>

              <Link
                href={request.href}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-full bg-[#eef5ff] px-4 text-xs font-bold uppercase text-[#0066cc] no-underline"
              >
                <DashboardIcon name="heart" className="h-4 w-4" />
                Amen
              </Link>
            </div>

            <p className="mt-5 text-sm leading-7 text-[#6e6e73]">
              {request.excerpt}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
