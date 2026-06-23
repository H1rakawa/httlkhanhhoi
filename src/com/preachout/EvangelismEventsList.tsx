import Image from "next/image";
import { ClockIcon, PinIcon } from "@/com/shared/Icons";
import AdminActionMenu from "@/com/preachout/AdminActionMenu";
import PreachoutFilterSearchBar from "@/com/preachout/PreachoutFilterSearchBar";
import RegisterAction from "@/com/preachout/RegisterAction";
import { OutreachEvent } from "@/com/preachout/preachoutData";

type EvangelismEventsListProps = {
  events: OutreachEvent[];
};

export default function EvangelismEventsList({ events }: EvangelismEventsListProps) {
  return (
    <section id="events" className="relative z-10 px-5 py-8 md:py-12">
      <div className="liquid-glass mx-auto max-w-7xl p-4 md:p-5">
        <PreachoutFilterSearchBar />

        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <article key={event.title} className="liquid-readable overflow-hidden p-0">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.72))]" />
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <span className="rounded-full bg-[#5f43ff] px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                    {event.status}
                  </span>
                  <AdminActionMenu />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0066cc]">
                      {event.type}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold">{event.title}</h2>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-[#626a75]">
                  <p className="flex items-center gap-2"><ClockIcon className="h-4 w-4" />{event.date}</p>
                  <p className="flex items-center gap-2"><PinIcon className="h-4 w-4" />{event.location}</p>
                </div>
                <p className="mt-4 rounded-[12px] bg-white/52 px-3 py-2 text-xs font-semibold text-[#626a75]">
                  {event.capacity}
                </p>
                <div className="mt-6">
                  <RegisterAction label={event.action} featured={event.featured} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
