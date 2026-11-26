"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChurchEvent } from "@/lib/events/types";

/** Trạng thái đăng ký dùng chung cho /calendar và /preachout. */
export function useEventRegistrations(
  initialEvents: ChurchEvent[],
  initialRegisteredIds: string[],
) {
  const router = useRouter();
  const [registeredIds, setRegisteredIds] = useState(initialRegisteredIds);
  const [extraSeats, setExtraSeats] = useState<Record<string, number>>({});
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);
  const [previousEvents, setPreviousEvents] = useState(initialEvents);

  // Khi server gửi dữ liệu mới (sau router.refresh) thì số đếm đã bao gồm lượt vừa đăng ký.
  if (previousEvents !== initialEvents) {
    setPreviousEvents(initialEvents);
    setExtraSeats({});
    setRegisteredIds((ids) => Array.from(new Set([...initialRegisteredIds, ...ids])));
  }

  const events = useMemo(
    () =>
      initialEvents.map((event) =>
        extraSeats[event.id]
          ? { ...event, registered: event.registered + extraSeats[event.id] }
          : event,
      ),
    [initialEvents, extraSeats],
  );

  const registeringEvent = events.find((event) => event.id === registeringEventId) ?? null;

  const onRegistered = useCallback(
    (event: ChurchEvent, attendees: number) => {
      setRegisteredIds((ids) => (ids.includes(event.id) ? ids : [...ids, event.id]));
      setExtraSeats((seats) => ({ ...seats, [event.id]: (seats[event.id] ?? 0) + attendees }));
      // Lấy lại số liệu thật từ Supabase ở lần render server kế tiếp.
      router.refresh();
    },
    [router],
  );

  return {
    events,
    registeredIds,
    isRegistered: (eventId: string) => registeredIds.includes(eventId),
    registeringEvent,
    openRegistration: (event: ChurchEvent) => setRegisteringEventId(event.id),
    closeRegistration: () => setRegisteringEventId(null),
    onRegistered,
  };
}
