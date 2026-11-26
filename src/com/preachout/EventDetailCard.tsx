import { ClockIcon, PinIcon } from "@/com/shared/Icons";
import EventCover from "@/com/events/EventCover";
import { capacityLabel } from "@/com/preachout/EvangelismEventsList";
import RegisterAction from "@/com/preachout/RegisterAction";
import type { ChurchEvent } from "@/lib/events/types";
import {
  EVENT_STATUS_LABELS,
  formatEventDateTime,
  formatEventTimeRange,
  googleCalendarUrl,
} from "@/lib/events/types";

type EventDetailCardProps = {
  event: ChurchEvent;
  isRegistered: boolean;
  onRegister: (event: ChurchEvent) => void;
};

export default function EventDetailCard({ event, isRegistered, onRegister }: EventDetailCardProps) {
  return (
    <article className="liquid-glass grid gap-6 p-5 lg:grid-cols-[0.95fr_1fr] md:p-6">
      <EventCover
        event={event}
        className="min-h-72 rounded-[20px]"
        sizes="(min-width: 1024px) 45vw, 100vw"
        imageClassName="object-cover opacity-86"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.44))]" />
        <span className="absolute left-5 top-5 rounded-full bg-[#5f43ff] px-4 py-1.5 text-xs font-bold text-white shadow-lg">
          {event.featured ? "Hoạt động nổi bật" : EVENT_STATUS_LABELS[event.status]}
        </span>
      </EventCover>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0066cc]">
          Chi tiết hoạt động · {event.category}
        </p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight">{event.title}</h2>
        {event.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#626a75]">
            {event.description}
          </p>
        )}
        <div className="mt-5 grid gap-3 text-sm text-[#626a75] sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            {formatEventDateTime(event.startsAt, {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            • {formatEventTimeRange(event)}
          </p>
          <p className="flex items-center gap-2">
            <PinIcon className="h-4 w-4" />
            {event.location}
          </p>
        </div>
        {event.schedule.length > 0 && (
          <div className="mt-6 rounded-[18px] border border-white/80 bg-white/50 p-4">
            <p className="text-sm font-semibold">Lịch trình dự kiến</p>
            <div className="mt-3 grid gap-2">
              {event.schedule.map((item) => (
                <span key={item} className="rounded-[12px] bg-white/62 px-4 py-2 text-sm text-[#626a75]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-col flex-wrap gap-3 sm:flex-row">
          <RegisterAction event={event} isRegistered={isRegistered} onRegister={onRegister} compact />
          <span className="inline-flex h-10 items-center justify-center rounded-[12px] border border-white/80 bg-white/54 px-5 text-sm font-semibold text-[#626a75]">
            {capacityLabel(event)}
          </span>
          {event.status !== "ended" && (
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-[12px] border border-white/80 bg-white/54 px-5 text-sm font-semibold text-[#0066cc] no-underline"
            >
              Thêm vào lịch
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
