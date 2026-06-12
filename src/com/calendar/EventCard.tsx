import { CalendarEvent } from "@/com/calendar/calendarData";

const categoryStyles: Record<CalendarEvent["category"], string> = {
  "Thờ phượng": "text-[#0066cc]",
  "Đào tạo": "text-[#7b61ff]",
  "Thiện nguyện": "text-[#178a45]",
  "Giới trẻ": "text-[#d06b00]",
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "long",
  }).format(new Date(value));
}

type EventCardProps = {
  event: CalendarEvent;
  compact?: boolean;
  onSelect: (event: CalendarEvent) => void;
};

export default function EventCard({ event, compact = false, onSelect }: EventCardProps) {
  const remaining =
    event.capacity && event.registered ? event.capacity - event.registered : null;

  return (
    <article
      className={[
        "rounded-[12px] border border-[#dedee3] bg-white transition-transform hover:-translate-y-0.5 hover:shadow-sm",
        compact ? "p-3" : "p-5",
      ].join(" ")}
    >
      <div className={compact ? "grid grid-cols-[86px_1fr] gap-4" : "grid gap-4"}>
        <button
          type="button"
          onClick={() => onSelect(event)}
          className={`calendar-event-${event.image} min-h-20 rounded-[8px]`}
          aria-label={`Xem chi tiết ${event.title}`}
        />
        <div>
          <p className={`text-xs font-bold uppercase ${categoryStyles[event.category]}`}>
            {event.category}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[#1d1d1f]">
            {event.title}
          </h3>
          <p className="mt-2 text-xs text-[#6e6e73]">
            {formatEventDate(event.date)} · {event.location}
          </p>
          {remaining !== null && (
            <p className="mt-2 text-xs font-medium text-[#178a45]">
              Còn {remaining} chỗ tham gia
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
