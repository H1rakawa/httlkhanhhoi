import { ClockIcon, PinIcon } from "@/com/shared/Icons";
import EventCover from "@/com/events/EventCover";
import AdminActionMenu from "@/com/preachout/AdminActionMenu";
import PreachoutFilterSearchBar from "@/com/preachout/PreachoutFilterSearchBar";
import RegisterAction from "@/com/preachout/RegisterAction";
import type { ChurchEvent } from "@/lib/events/types";
import {
  EVENT_STATUS_LABELS,
  formatEventDateTime,
  formatEventTimeRange,
} from "@/lib/events/types";

export function capacityLabel(event: ChurchEvent) {
  if (event.capacity === null) {
    return event.registered > 0 ? `${event.registered} người đã đăng ký` : "Không giới hạn số lượng";
  }
  return `${event.registered}/${event.capacity} người đã đăng ký`;
}

type EvangelismEventsListProps = {
  events: ChurchEvent[];
  hasAnyEvents: boolean;
  categories: string[];
  activeCategory: string;
  query: string;
  isStaff: boolean;
  isRegistered: (eventId: string) => boolean;
  onCategoryChange: (category: string) => void;
  onQueryChange: (query: string) => void;
  onSelect: (event: ChurchEvent) => void;
  onRegister: (event: ChurchEvent) => void;
};

export default function EvangelismEventsList({
  events,
  hasAnyEvents,
  categories,
  activeCategory,
  query,
  isStaff,
  isRegistered,
  onCategoryChange,
  onQueryChange,
  onSelect,
  onRegister,
}: EvangelismEventsListProps) {
  return (
    <section id="events" className="relative z-10 px-5 py-8 md:py-12">
      <div className="liquid-glass mx-auto max-w-7xl p-4 md:p-5">
        <PreachoutFilterSearchBar
          categories={categories}
          activeCategory={activeCategory}
          query={query}
          onCategoryChange={onCategoryChange}
          onQueryChange={onQueryChange}
        />

        {events.length === 0 ? (
          <p className="liquid-readable mt-7 p-8 text-center text-sm text-[#626a75]">
            {hasAnyEvents
              ? "Không tìm thấy hoạt động phù hợp."
              : "Hiện chưa có hoạt động truyền giảng nào. Vui lòng quay lại sau."}
          </p>
        ) : (
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {events.map((event) => (
              <article key={event.id} className="liquid-readable overflow-hidden p-0">
                <EventCover
                  event={event}
                  className="h-56"
                  sizes="(min-width: 768px) 33vw, 100vw"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.72))]" />
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <span className="rounded-full bg-[#5f43ff] px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                      {EVENT_STATUS_LABELS[event.status]}
                    </span>
                    {isStaff && <AdminActionMenu />}
                  </div>
                </EventCover>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0066cc]">
                    {event.category}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold">{event.title}</h2>
                  <div className="mt-4 space-y-2 text-sm text-[#626a75]">
                    <p className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      {formatEventDateTime(event.startsAt, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      • {formatEventTimeRange(event)}
                    </p>
                    <p className="flex items-center gap-2">
                      <PinIcon className="h-4 w-4" />
                      {event.location}
                    </p>
                  </div>
                  <p className="mt-4 rounded-[12px] bg-white/52 px-3 py-2 text-xs font-semibold text-[#626a75]">
                    {capacityLabel(event)}
                  </p>
                  <div className="mt-6 grid gap-2">
                    <RegisterAction
                      event={event}
                      isRegistered={isRegistered(event.id)}
                      featured={event.featured}
                      onRegister={onRegister}
                    />
                    <button
                      type="button"
                      onClick={() => onSelect(event)}
                      className="h-10 text-sm font-semibold text-[#0066cc] hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
