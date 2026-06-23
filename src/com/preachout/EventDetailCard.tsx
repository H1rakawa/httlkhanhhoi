import Image from "next/image";
import { ClockIcon, PinIcon } from "@/com/shared/Icons";
import RegisterAction from "@/com/preachout/RegisterAction";
import { OutreachEvent } from "@/com/preachout/preachoutData";

type EventDetailCardProps = {
  event: OutreachEvent;
};

export default function EventDetailCard({ event }: EventDetailCardProps) {
  return (
    <article className="liquid-glass grid gap-6 p-5 lg:grid-cols-[0.95fr_1fr] md:p-6">
      <div className="relative min-h-72 overflow-hidden rounded-[20px] bg-[#111113]">
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover opacity-86"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.44))]" />
        <span className="absolute left-5 top-5 rounded-full bg-[#5f43ff] px-4 py-1.5 text-xs font-bold text-white shadow-lg">
          Hoạt động nổi bật
        </span>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0066cc]">
          Chi tiết hoạt động
        </p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight">{event.title}</h2>
        <p className="mt-4 text-sm leading-7 text-[#626a75]">{event.description}</p>
        <div className="mt-5 grid gap-3 text-sm text-[#626a75] sm:grid-cols-2">
          <p className="flex items-center gap-2"><ClockIcon className="h-4 w-4" />{event.date} • {event.time}</p>
          <p className="flex items-center gap-2"><PinIcon className="h-4 w-4" />{event.location}</p>
        </div>
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
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <RegisterAction label={event.action} featured compact />
          <span className="inline-flex h-10 items-center justify-center rounded-[12px] border border-white/80 bg-white/54 px-5 text-sm font-semibold text-[#626a75]">
            {event.capacity}
          </span>
        </div>
      </div>
    </article>
  );
}
