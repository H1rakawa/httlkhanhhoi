import { Button } from "@heroui/react";
import { CalendarEvent } from "@/com/calendar/calendarData";

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type EventDetailDialogProps = {
  event: CalendarEvent | null;
  isRegistered: boolean;
  onClose: () => void;
  onRegister: (event: CalendarEvent) => void;
};

export default function EventDetailDialog({
  event,
  isRegistered,
  onClose,
  onRegister,
}: EventDetailDialogProps) {
  if (!event) return null;

  const isFull =
    typeof event.capacity === "number" &&
    typeof event.registered === "number" &&
    event.registered >= event.capacity;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-5 py-8">
      <div className="liquid-glass max-h-[92vh] w-full max-w-2xl overflow-auto p-6 text-[#1d1d1f] md:p-8">
        <div className={`calendar-event-${event.image} min-h-56 rounded-[12px]`} />
        <div className="mt-7 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase text-[#0066cc]">
              {event.category}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-xl"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-[#424245]">
          <p>
            <span className="font-semibold">Thời gian:</span>{" "}
            {formatFullDate(event.date)} - {event.endTime}
          </p>
          <p>
            <span className="font-semibold">Địa điểm:</span> {event.location}
          </p>
          {event.capacity && (
            <p>
              <span className="font-semibold">Số lượng:</span>{" "}
              {event.registered || 0}/{event.capacity} người đã đăng ký
            </p>
          )}
        </div>

        <p className="mt-6 text-base leading-8 text-[#6e6e73]">
          {event.description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onPress={() => onRegister(event)}
            isDisabled={isFull || isRegistered}
            className="h-11 rounded-full bg-[#0066cc] px-7 font-semibold text-white disabled:opacity-50"
          >
            {isRegistered ? "Đã đăng ký" : isFull ? "Đã đủ chỗ" : "Tham gia ngay"}
          </Button>
          {event.reminderAvailable && (
            <Button className="h-11 rounded-full border border-[#d6d6d8] bg-white px-7 font-semibold text-[#1d1d1f]">
              Bật nhắc lịch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
