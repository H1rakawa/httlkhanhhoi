import { Button } from "@heroui/react";
import EventCover from "@/com/events/EventCover";
import type { ChurchEvent } from "@/lib/events/types";
import {
  EVENT_STATUS_LABELS,
  canRegister,
  formatEventDateTime,
  formatEventTimeRange,
  googleCalendarUrl,
} from "@/lib/events/types";

type EventDetailDialogProps = {
  event: ChurchEvent | null;
  isRegistered: boolean;
  onClose: () => void;
  onRegister: (event: ChurchEvent) => void;
};

function registerLabel(event: ChurchEvent, isRegistered: boolean) {
  if (isRegistered) return "Đã đăng ký";
  if (event.status === "ended") return "Đã kết thúc";
  if (!event.registrationOpen) return "Chưa mở đăng ký";
  if (!canRegister(event)) return "Đã đủ chỗ";
  return "Tham gia ngay";
}

export default function EventDetailDialog({
  event,
  isRegistered,
  onClose,
  onRegister,
}: EventDetailDialogProps) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-5 py-8">
      <div className="liquid-glass max-h-[92vh] w-full max-w-2xl overflow-auto p-6 text-[#1d1d1f] md:p-8">
        <EventCover event={event} className="min-h-56 rounded-[12px]" sizes="672px" />
        <div className="mt-7 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase text-[#0066cc]">
              {event.category} · {EVENT_STATUS_LABELS[event.status]}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">{event.title}</h2>
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
            {formatEventDateTime(event.startsAt, {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            , {formatEventTimeRange(event)}
          </p>
          <p>
            <span className="font-semibold">Địa điểm:</span> {event.location}
          </p>
          {event.capacity !== null && (
            <p>
              <span className="font-semibold">Số lượng:</span> {event.registered}/
              {event.capacity} người đã đăng ký
            </p>
          )}
        </div>

        {event.description && (
          <p className="mt-6 whitespace-pre-line text-base leading-8 text-[#6e6e73]">
            {event.description}
          </p>
        )}

        {event.schedule.length > 0 && (
          <div className="mt-6 rounded-[16px] border border-white/80 bg-white/50 p-4">
            <p className="text-sm font-semibold">Lịch trình</p>
            <ul className="mt-3 grid gap-2">
              {event.schedule.map((item) => (
                <li key={item} className="rounded-[10px] bg-white/62 px-4 py-2 text-sm text-[#626a75]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onPress={() => onRegister(event)}
            isDisabled={isRegistered || !canRegister(event)}
            className="h-11 rounded-full bg-[#0066cc] px-7 font-semibold text-white disabled:opacity-50"
          >
            {registerLabel(event, isRegistered)}
          </Button>
          {event.status !== "ended" && (
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#d6d6d8] bg-white px-7 text-sm font-semibold text-[#1d1d1f] no-underline"
            >
              Thêm vào Google Calendar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
