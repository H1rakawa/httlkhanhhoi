import Link from "next/link";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import PrayerAvatar from "@/com/pray/PrayerAvatar";
import { prayerAuthorLabel, type PrayerRequest } from "@/com/pray/prayData";

export default function LatestPrayerRequests({
  prayers,
  failed,
}: {
  prayers: PrayerRequest[];
  failed: boolean;
}) {
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

      {prayers.length === 0 ? (
        <p className="liquid-glass-item border-white/80 p-5 text-sm leading-6 text-[#6e6e73]">
          {failed
            ? "Chưa tải được lời cầu thay."
            : "Chưa có lời cầu thay nào được chia sẻ. Bạn có thể gửi ý nguyện để cộng đồng cùng cầu thay."}
        </p>
      ) : (
        <div className="grid gap-5">
          {prayers.map((request) => (
            <article key={request.id} className="liquid-glass-item border-white/80 p-5 md:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-4">
                  <PrayerAvatar
                    name={request.authorName}
                    src={request.authorAvatar}
                    size={44}
                    anonymous={request.isAnonymous}
                  />
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-6">
                      {prayerAuthorLabel(request)}
                    </h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.04em] text-[#0066cc]">
                      {request.category} · {request.title}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/pray?prayer=${request.id}`}
                  className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-full bg-[#eef5ff] px-4 text-xs font-bold uppercase text-[#0066cc] no-underline"
                >
                  <DashboardIcon name="heart" className="h-4 w-4" />
                  {request.hasInterceded ? "Đã cầu thay" : "Cầu thay"} · {request.intercessionCount}
                </Link>
              </div>

              <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#6e6e73]">{request.content}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
