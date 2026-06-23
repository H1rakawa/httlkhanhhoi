import Image from "next/image";
import PrayAdminActionMenu from "@/com/pray/PrayAdminActionMenu";
import PrivacyIndicator from "@/com/pray/PrivacyIndicator";
import { PrayerRequest } from "@/com/pray/prayData";

type PrayerRequestCardProps = {
  request: PrayerRequest;
  onOpen: (request: PrayerRequest) => void;
};

export default function PrayerRequestCard({
  request,
  onOpen,
}: PrayerRequestCardProps) {
  const answered = request.status === "Đã nhận lời";

  return (
    <article className="liquid-glass p-7 md:p-8">
      <div className="flex items-start gap-4">
        <Image
          src={request.image}
          alt={request.author}
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{request.author}</p>
              <p className="mt-1 text-sm text-[#7b8490]">{request.time}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full border px-4 py-1.5 text-xs font-bold",
                  answered
                    ? "border-[#34c759]/22 bg-[#e9f9ef] text-[#1b8f45]"
                    : "border-[#6c4cff]/22 bg-[#f0ecff] text-[#6c4cff]",
                ].join(" ")}
              >
                {request.status}
              </span>
              <PrayAdminActionMenu />
            </div>
          </div>
          <h2 className="mt-5 text-2xl font-semibold leading-tight">
            {request.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#424a55]">{request.excerpt}</p>
          <div className="mt-6 border-t border-white/70 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/58 px-4 py-2 text-sm font-bold">
                  ♡ {request.prayedCount} đã cầu nguyện
                </span>
                <PrivacyIndicator privacy={request.privacy} />
              </div>
              <button
                type="button"
                onClick={() => onOpen(request)}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold text-[#1d1d1f] transition-colors hover:bg-white/58"
              >
                🌐 Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
