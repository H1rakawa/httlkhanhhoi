import PrayerAvatar from "@/com/pray/PrayerAvatar";
import PrayerStatusBadge from "@/com/pray/PrayerStatusBadge";
import PrivacyIndicator from "@/com/pray/PrivacyIndicator";
import {
  isPrayerOpen,
  prayerAuthorLabel,
  relativeTime,
  type PrayerRequest,
} from "@/com/pray/prayData";

type PrayerRequestCardProps = {
  request: PrayerRequest;
  onOpen: (request: PrayerRequest) => void;
  onToggleIntercession: (request: PrayerRequest) => void;
};

export default function PrayerRequestCard({
  request,
  onOpen,
  onToggleIntercession,
}: PrayerRequestCardProps) {
  const author = prayerAuthorLabel(request);
  const open = isPrayerOpen(request);

  return (
    <article className="liquid-glass p-7 md:p-8">
      <div className="flex items-start gap-4">
        <PrayerAvatar
          name={request.authorName}
          src={request.authorAvatar}
          size={56}
          anonymous={request.isAnonymous}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{author}</p>
              <p className="mt-1 text-sm text-[#7b8490]" suppressHydrationWarning>
                {relativeTime(request.createdAt)} · {request.category}
              </p>
            </div>
            <PrayerStatusBadge status={request.status} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold leading-tight">{request.title}</h2>
          <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-7 text-[#424a55]">
            {request.content}
          </p>
          <div className="mt-6 border-t border-white/70 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={!open}
                  aria-pressed={request.hasInterceded}
                  onClick={() => onToggleIntercession(request)}
                  title={open ? undefined : "Lời cầu thay đang chờ ban mục vụ duyệt"}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed",
                    request.hasInterceded
                      ? "bg-[#6c4cff] text-white"
                      : "bg-white/58 text-[#1d1d1f] hover:bg-white/80",
                  ].join(" ")}
                >
                  {request.hasInterceded ? "♥" : "♡"} {request.intercessionCount} đã cầu nguyện
                </button>
                <PrivacyIndicator privacy={request.privacy} />
                {request.commentCount > 0 && (
                  <span className="text-sm text-[#626a75]">
                    {request.commentCount} lời động viên
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onOpen(request)}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold text-[#1d1d1f] transition-colors hover:bg-white/58"
              >
                Xem chi tiết →
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
