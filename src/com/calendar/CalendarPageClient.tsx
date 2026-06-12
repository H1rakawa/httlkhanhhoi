"use client";

import { useEffect, useMemo, useState } from "react";
import CalendarGrid from "@/com/calendar/CalendarGrid";
import EventCard from "@/com/calendar/EventCard";
import EventDetailDialog from "@/com/calendar/EventDetailDialog";
import FeaturedEvent from "@/com/calendar/FeaturedEvent";
import FilterSearchBar from "@/com/calendar/FilterSearchBar";
import {
  CalendarEvent,
  getLiveCalendarEvents,
} from "@/com/calendar/calendarData";

function eventMatchesMonth(event: CalendarEvent, month: string) {
  return event.date.slice(0, 7) === month;
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function CalendarPageClient() {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState(() => formatMonth(currentTime));
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const calendarEvents = useMemo(
    () => getLiveCalendarEvents(currentTime),
    [currentTime],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(new Date()), 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return calendarEvents
      .filter((event) => category === "Tất cả" || event.category === category)
      .filter((event) => eventMatchesMonth(event, month))
      .filter((event) => {
        if (!normalizedQuery) return true;

        return [event.title, event.category, event.location, event.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort(
        (eventA, eventB) =>
          new Date(eventA.date).getTime() - new Date(eventB.date).getTime(),
      );
  }, [calendarEvents, category, month, query]);

  const upcomingEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return calendarEvents
      .filter((event) => new Date(event.date).getTime() >= currentTime.getTime())
      .filter((event) => category === "Tất cả" || event.category === category)
      .filter((event) => {
        if (!normalizedQuery) return true;
        return [event.title, event.category, event.location]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort(
        (eventA, eventB) =>
          new Date(eventA.date).getTime() - new Date(eventB.date).getTime(),
      )
      .slice(0, 3);
  }, [calendarEvents, category, currentTime, query]);

  const featuredEvent = upcomingEvents[0] || calendarEvents[0];

  const registerEvent = (event: CalendarEvent) => {
    setRegisteredIds((currentIds) =>
      currentIds.includes(event.id) ? currentIds : [...currentIds, event.id],
    );
  };

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

      <section className="py-16 md:py-24">
        <div className="liquid-glass mx-auto grid w-[calc(100%_-_2rem)] max-w-7xl gap-8 p-5 lg:grid-cols-[1.25fr_0.85fr] md:p-8">
          {viewMode === "calendar" ? (
            <CalendarGrid
              month={month}
              events={filteredEvents}
              today={currentTime}
              selectedEventId={selectedEvent?.id}
              onSelect={setSelectedEvent}
              onMonthChange={setMonth}
            />
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={setSelectedEvent}
                />
              ))}
            </div>
          )}

          <aside>
            <h2 className="mb-5 text-base font-semibold text-[#1d1d1f]">
              Sắp diễn ra
            </h2>
            <div className="grid gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  compact
                  onSelect={setSelectedEvent}
                />
              ))}
              {upcomingEvents.length === 0 && (
                <div className="liquid-readable p-6 text-sm text-[#6e6e73]">
                  Không tìm thấy sự kiện phù hợp.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <div className="pb-16 md:pb-24">
        <FeaturedEvent
          event={featuredEvent}
          isRegistered={registeredIds.includes(featuredEvent.id)}
          onSelect={setSelectedEvent}
          onRegister={registerEvent}
        />
      </div>

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
        isRegistered={
          selectedEvent ? registeredIds.includes(selectedEvent.id) : false
        }
        onClose={() => setSelectedEvent(null)}
        onRegister={registerEvent}
      />
    </>
  );
}
