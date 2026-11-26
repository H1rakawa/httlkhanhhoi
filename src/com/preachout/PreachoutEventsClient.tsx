"use client";

import { useMemo, useState } from "react";
import EventRegistrationDialog from "@/com/events/EventRegistrationDialog";
import { useEventRegistrations } from "@/com/events/useEventRegistrations";
import EvangelismEventsList from "@/com/preachout/EvangelismEventsList";
import EventDetailCard from "@/com/preachout/EventDetailCard";
import type { ChurchEvent, EventViewer } from "@/lib/events/types";

const ALL = "Tất cả sự kiện";

function isFinished(event: ChurchEvent, now: number) {
  return event.status === "ended" || new Date(event.endsAt ?? event.startsAt).getTime() < now;
}

type PreachoutEventsClientProps = {
  events: ChurchEvent[];
  viewer: EventViewer;
  registeredEventIds: string[];
};

export default function PreachoutEventsClient({
  events: initialEvents,
  viewer,
  registeredEventIds,
}: PreachoutEventsClientProps) {
  const registrations = useEventRegistrations(initialEvents, registeredEventIds);
  const [now] = useState(() => Date.now());
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Hoạt động sắp tới lên trước (gần nhất trước), hoạt động đã xong xuống cuối.
  const orderedEvents = useMemo(() => {
    const upcoming = registrations.events.filter((event) => !isFinished(event, now));
    const finished = registrations.events.filter((event) => isFinished(event, now)).reverse();
    return [...upcoming, ...finished];
  }, [registrations.events, now]);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(orderedEvents.map((event) => event.category)))],
    [orderedEvents],
  );

  const visibleEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orderedEvents
      .filter((event) => category === ALL || event.category === category)
      .filter(
        (event) =>
          !normalized ||
          [event.title, event.location, event.description, event.category]
            .join(" ")
            .toLowerCase()
            .includes(normalized),
      );
  }, [orderedEvents, category, query]);

  const highlightedEvent =
    orderedEvents.find((event) => event.id === selectedId) ??
    orderedEvents.find((event) => event.featured && !isFinished(event, now)) ??
    orderedEvents[0] ??
    null;

  const selectEvent = (event: ChurchEvent) => {
    setSelectedId(event.id);
    document.getElementById("event-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <EvangelismEventsList
        events={visibleEvents}
        hasAnyEvents={orderedEvents.length > 0}
        categories={categories}
        activeCategory={category}
        query={query}
        isStaff={viewer.isStaff}
        isRegistered={registrations.isRegistered}
        onCategoryChange={setCategory}
        onQueryChange={setQuery}
        onSelect={selectEvent}
        onRegister={registrations.openRegistration}
      />

      {highlightedEvent && (
        <section id="event-detail" className="relative z-10 scroll-mt-24 px-5 py-8">
          <div className="mx-auto max-w-7xl">
            <EventDetailCard
              event={highlightedEvent}
              isRegistered={registrations.isRegistered(highlightedEvent.id)}
              onRegister={registrations.openRegistration}
            />
          </div>
        </section>
      )}

      <EventRegistrationDialog
        event={registrations.registeringEvent}
        viewer={viewer}
        onClose={registrations.closeRegistration}
        onRegistered={registrations.onRegistered}
      />
    </>
  );
}
