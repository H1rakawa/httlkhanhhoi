"use client";

import { useEffect, useMemo, useState } from "react";
import CalendarGrid from "@/com/calendar/CalendarGrid";
import EventCard from "@/com/calendar/EventCard";
import EventDetailDialog from "@/com/calendar/EventDetailDialog";
import FeaturedEvent from "@/com/calendar/FeaturedEvent";
import FilterSearchBar from "@/com/calendar/FilterSearchBar";
import EventRegistrationDialog from "@/com/events/EventRegistrationDialog";
import { useEventRegistrations } from "@/com/events/useEventRegistrations";
import type { ChurchEvent, EventViewer } from "@/lib/events/types";
import { eventMonthKey } from "@/lib/events/types";

function matchesQuery(event: ChurchEvent, query: string) {
  if (!query) return true;
  return [event.title, event.category, event.location, event.description]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

type CalendarPageClientProps = {
  events: ChurchEvent[];
  viewer: EventViewer;
  registeredEventIds: string[];
  loadError?: string | null;
};

export default function CalendarPageClient({
  events: initialEvents,
  viewer,
  registeredEventIds,
  loadError,
}: CalendarPageClientProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState(() => eventMonthKey(new Date()));
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const registrations = useEventRegistrations(initialEvents, registeredEventIds);
  const { events } = registrations;
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const categoryEvents = useMemo(
    () =>
      events
        .filter((event) => category === "Tất cả" || event.category === category)
        .filter((event) => matchesQuery(event, normalizedQuery)),
    [events, category, normalizedQuery],
  );

  const monthEvents = useMemo(
    () => categoryEvents.filter((event) => eventMonthKey(event.startsAt) === month),
    [categoryEvents, month],
  );

  const upcomingEvents = useMemo(
    () =>
      categoryEvents
        .filter(
          (event) =>
            new Date(event.endsAt ?? event.startsAt).getTime() >= currentTime.getTime() &&
            event.status !== "ended",
        )
        .slice(0, 3),
    [categoryEvents, currentTime],
  );

  const featuredEvent = useMemo(() => {
    const upcoming = events.filter(
      (event) =>
        new Date(event.endsAt ?? event.startsAt).getTime() >= currentTime.getTime() &&
        event.status !== "ended",
    );
    return upcoming.find((event) => event.featured) ?? upcoming[0] ?? null;
  }, [events, currentTime]);

  const selectEvent = (event: ChurchEvent) => setSelectedEventId(event.id);

  return (
    <>
      <FilterSearchBar
        activeCategory={category}
        query={query}
        month={month}
        viewMode={viewMode}
        onCategoryChange={setCategory}
        onQueryChange={setQuery}
        onMonthChange={setMonth}
        onViewModeChange={setViewMode}
      />

      {loadError && (
        <p className="mx-auto mt-6 w-[calc(100%_-_2rem)] max-w-7xl rounded-[14px] bg-[#fff0f1] px-5 py-4 text-sm text-[#c0263a]">
          {loadError}
        </p>
      )}

      <section className="py-16 md:py-24">
        <div className="liquid-glass mx-auto grid w-[calc(100%_-_2rem)] max-w-7xl gap-8 p-5 lg:grid-cols-[1.25fr_0.85fr] md:p-8">
          {viewMode === "calendar" ? (
            <CalendarGrid
              month={month}
              events={monthEvents}
              today={currentTime}
              selectedEventId={selectedEvent?.id}
              onSelect={selectEvent}
              onMonthChange={setMonth}
            />
          ) : (
            <div className="grid content-start gap-4">
              {monthEvents.map((event) => (
                <EventCard key={event.id} event={event} onSelect={selectEvent} />
              ))}
              {monthEvents.length === 0 && (
                <div className="liquid-readable p-6 text-sm text-[#6e6e73]">
                  Tháng này chưa có sự kiện nào phù hợp.
                </div>
              )}
            </div>
          )}

          <aside>
            <h2 className="mb-5 text-base font-semibold text-[#1d1d1f]">Sắp diễn ra</h2>
            <div className="grid gap-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} compact onSelect={selectEvent} />
              ))}
              {upcomingEvents.length === 0 && (
                <div className="liquid-readable p-6 text-sm text-[#6e6e73]">
                  {events.length === 0
                    ? "Hiện chưa có sự kiện nào được lên lịch."
                    : "Không tìm thấy sự kiện phù hợp."}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {featuredEvent && (
        <div className="pb-16 md:pb-24">
          <FeaturedEvent
            event={featuredEvent}
            isRegistered={registrations.isRegistered(featuredEvent.id)}
            onSelect={selectEvent}
            onRegister={registrations.openRegistration}
          />
        </div>
      )}

      <section className="px-5 py-24 text-center">
        <div className="liquid-glass mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-xl font-semibold">Đừng bỏ lỡ bất kỳ hoạt động nào</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#6e6e73]">
            Đăng ký nhận bản tin hằng tuần để luôn cập nhật những sự kiện mới nhất
            từ HTTL. Khánh Hội.
          </p>
          <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="h-12 flex-1 rounded-full border border-white/90 bg-white/76 px-6 text-sm outline-none focus:border-[#0066cc]"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-[#0066cc] px-8 text-sm font-semibold text-white"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>

      <EventDetailDialog
        event={selectedEvent}
        isRegistered={selectedEvent ? registrations.isRegistered(selectedEvent.id) : false}
        onClose={() => setSelectedEventId(null)}
        onRegister={(event) => {
          setSelectedEventId(null);
          registrations.openRegistration(event);
        }}
      />

      <EventRegistrationDialog
        event={registrations.registeringEvent}
        viewer={viewer}
        onClose={registrations.closeRegistration}
        onRegistered={registrations.onRegistered}
      />
    </>
  );
}
