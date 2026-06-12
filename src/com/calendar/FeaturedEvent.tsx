import { Button } from "@heroui/react";
import { CalendarEvent } from "@/com/calendar/calendarData";

type FeaturedEventProps = {
  event: CalendarEvent;
  isRegistered: boolean;
  onSelect: (event: CalendarEvent) => void;
  onRegister: (event: CalendarEvent) => void;
};

export default function FeaturedEvent({
  event,
  isRegistered,
  onSelect,
  onRegister,
}: FeaturedEventProps) {
  return (
    <section className="liquid-glass mx-auto w-[calc(100%_-_2rem)] max-w-7xl p-6 md:p-10">
      <div className="grid items-center gap-12 md:grid-cols-[0.95fr_0.85fr]">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <span className="h-px w-12 bg-[#0066cc]" />
            <p className="text-sm font-medium text-[#424245]">Sự Kiện Tiêu Điểm</p>
          </div>
          <h2 className="text-3xl font-semibold tracking-normal">
            {event.title}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#6e6e73]">
            {event.description}
          </p>

          <div className="mt-8 space-y-4 text-sm text-[#424245]">
            <p className="font-semibold">
              Hội trường chính · {event.location}
            </p>
            <p>
              {new Intl.DateTimeFormat("vi-VN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(new Date(event.date))}
              {" · "}
              {new Intl.DateTimeFormat("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(event.date))}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              onPress={() => onRegister(event)}
              className="h-12 rounded-full bg-[#0066cc] px-12 font-semibold text-white"
            >
              {isRegistered ? "Đã tham gia" : "Tham gia ngay"}
            </Button>
            <Button
              onPress={() => onSelect(event)}
              className="h-12 rounded-full border border-[#d6d6d8] bg-white px-10 font-semibold text-[#1d1d1f]"
            >
              Xem chi tiết
            </Button>
          </div>
        </div>

        <div className="liquid-readable p-2">
          <div className={`calendar-event-${event.image} min-h-[460px] rounded-[14px] shadow-[0_18px_44px_rgba(0,0,0,0.14)]`} />
        </div>
      </div>
    </section>
  );
}
