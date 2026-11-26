import EventCover from "@/com/events/EventCover";
import type { ChurchEvent, EventCategory } from "@/lib/events/types";
import { formatEventDateTime, remainingSeats } from "@/lib/events/types";

const categoryStyles: Record<EventCategory, string> = {
  "Thờ phượng": "text-[#0066cc]",
  "Đào tạo": "text-[#7b61ff]",
  "Thiện nguyện": "text-[#178a45]",
  "Giới trẻ": "text-[#d06b00]",
};

type EventCardProps = {
  event: ChurchEvent;
  compact?: boolean;
  onSelect: (event: ChurchEvent) => void;
};

export default function EventCard({ event, compact = false, onSelect }: EventCardProps) {
  const remaining = remainingSeats(event);

  return (
    <article className={["liquid-readable", compact ? "p-3" : "p-5"].join(" ")}>
      <div className={compact ? "grid grid-cols-[86px_1fr] gap-4" : "grid gap-4"}>
        <button
          type="button"
          onClick={() => onSelect(event)}
          className="block min-h-20 overflow-hidden rounded-[8px]"
          aria-label={`Xem chi tiết ${event.title}`}
        >
          <EventCover event={event} className="h-full min-h-20" sizes="200px" />
        </button>
        <div>
          <p className={`text-xs font-bold uppercase ${categoryStyles[event.category]}`}>
            {event.category}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[#1d1d1f]">{event.title}</h3>
          <p className="mt-2 text-xs text-[#6e6e73]">
            {formatEventDateTime(event.startsAt, {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "long",
            })}{" "}
            · {event.location}
          </p>
          {remaining !== null && event.registrationOpen && (
            <p
              className={[
                "mt-2 text-xs font-medium",
                remaining > 0 ? "text-[#178a45]" : "text-[#c0263a]",
              ].join(" ")}
            >
              {remaining > 0 ? `Còn ${remaining} chỗ tham gia` : "Đã đủ chỗ"}
            </p>
          )}
          <button
            type="button"
            onClick={() => onSelect(event)}
            className="mt-3 text-xs font-semibold text-[#0066cc] hover:underline"
          >
            Xem chi tiết →
          </button>
        </div>
      </div>
    </article>
  );
}
