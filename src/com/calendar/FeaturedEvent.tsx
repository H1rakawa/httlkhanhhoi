import { Button } from "@heroui/react";
import EventCover from "@/com/events/EventCover";
import type { ChurchEvent } from "@/lib/events/types";
import { canRegister, formatEventDateTime, formatEventTimeRange } from "@/lib/events/types";

type FeaturedEventProps = {
  event: ChurchEvent;
  isRegistered: boolean;
  onSelect: (event: ChurchEvent) => void;
  onRegister: (event: ChurchEvent) => void;
};

export default function FeaturedEvent({
  event,
  isRegistered,
  onSelect,
  onRegister,
}: FeaturedEventProps) {
  const open = canRegister(event);

  return (
    <section className="liquid-glass mx-auto w-[calc(100%_-_2rem)] max-w-7xl p-6 md:p-10">
      <div className="grid items-center gap-12 md:grid-cols-[0.95fr_0.85fr]">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <span className="h-px w-12 bg-[#0066cc]" />
            <p className="text-sm font-medium text-[#424245]">Sự Kiện Tiêu Điểm</p>
          </div>
          <h2 className="text-3xl font-semibold tracking-normal">{event.title}</h2>
          {event.description && (
            <p className="mt-6 line-clamp-5 max-w-xl text-base leading-8 text-[#6e6e73]">
              {event.description}
            </p>
          )}

          <div className="mt-8 space-y-4 text-sm text-[#424245]">
            <p className="font-semibold">{event.location}</p>
            <p>
              {formatEventDateTime(event.startsAt, {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              {" · "}
              {formatEventTimeRange(event)}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {(open || isRegistered) && (
              <Button
                onPress={() => onRegister(event)}
                isDisabled={isRegistered}
                className="h-12 rounded-full bg-[#0066cc] px-12 font-semibold text-white disabled:opacity-60"
              >
                {isRegistered ? "Đã đăng ký" : "Tham gia ngay"}
              </Button>
            )}
            <Button
              onPress={() => onSelect(event)}
              className="h-12 rounded-full border border-[#d6d6d8] bg-white px-10 font-semibold text-[#1d1d1f]"
            >
              Xem chi tiết
            </Button>
          </div>
        </div>

        <div className="liquid-readable p-2">
          <EventCover
            event={event}
            className="min-h-[460px] rounded-[14px] shadow-[0_18px_44px_rgba(0,0,0,0.14)]"
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
