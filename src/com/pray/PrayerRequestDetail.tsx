import Image from "next/image";
import EncouragementBox from "@/com/pray/EncouragementBox";
import PrivacyIndicator from "@/com/pray/PrivacyIndicator";
import { PrayerRequest } from "@/com/pray/prayData";

type PrayerRequestDetailProps = {
  request: PrayerRequest | null;
  onClose: () => void;
};

export default function PrayerRequestDetail({
  request,
  onClose,
}: PrayerRequestDetailProps) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[#07111f]/22 backdrop-blur-[6px]">
      <aside className="absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[-28px_0_80px_rgba(31,48,70,0.2)] md:w-[min(560px,42vw)]">
        <div className="flex items-center justify-between border-b border-[#ececf0] px-8 py-6">
          <h2 className="text-xl font-semibold">Chi tiết cầu thay</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-3xl font-light transition-colors hover:bg-[#f5f5f7]"
            aria-label="Đóng chi tiết cầu thay"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="flex items-center gap-4">
            <Image
              src={request.image}
              alt={request.author}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{request.author}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#7b8490]">
                <span>{request.time}</span>
                <span>•</span>
                <PrivacyIndicator privacy={request.privacy} />
              </div>
            </div>
          </div>

          <h3 className="mt-6 text-3xl font-semibold leading-tight">
            {request.title}
          </h3>
          <p className="mt-5 text-base leading-8 text-[#2f3338]">{request.content}</p>

          <div className="mt-7 flex gap-3">
            <button className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-[14px] bg-[#6c4cff] text-sm font-bold text-white shadow-[0_16px_30px_rgba(108,76,255,0.3)]">
              ♡ Tôi đã cầu nguyện
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#f1f1f3] text-xl">
              ⤴
            </button>
          </div>

          <div className="mt-8 border-t border-[#ececf0] pt-7">
            <h4 className="font-semibold">Lời động viên ({request.comments.length})</h4>
            <div className="mt-5 grid gap-4">
              {request.comments.length ? (
                request.comments.map((comment) => (
                  <article key={`${comment.name}-${comment.time}`} className="flex gap-3">
                    {comment.image ? (
                      <Image
                        src={comment.image}
                        alt={comment.name}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111113] text-sm font-bold text-white">
                        {comment.name.charAt(0)}
                      </span>
                    )}
                    <div className="flex-1 rounded-[18px] bg-[#f1f1f3] px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{comment.name}</p>
                        <p className="text-sm text-[#7b8490]">{comment.time}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#424a55]">
                        {comment.message}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-[18px] bg-[#f5f5f7] p-5 text-sm text-[#626a75]">
                  Chưa có lời động viên. Hãy là người đầu tiên đồng hành trong lời cầu nguyện.
                </p>
              )}
            </div>
          </div>
        </div>

        <EncouragementBox />
      </aside>
    </div>
  );
}
