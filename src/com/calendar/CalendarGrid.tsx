import { CalendarEvent } from "@/com/calendar/calendarData";

const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function sameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function buildCalendarDays(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const firstDay = new Date(year, monthIndex - 1, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

type CalendarGridProps = {
  month: string;
  events: CalendarEvent[];
  today: Date;
  selectedEventId?: string;
  onSelect: (event: CalendarEvent) => void;
  onMonthChange: (month: string) => void;
};

export default function CalendarGrid({
  month,
  events,
  today,
  selectedEventId,
  onSelect,
  onMonthChange,
}: CalendarGridProps) {
  const days = buildCalendarDays(month);
  const activeMonth = Number(month.split("-")[1]) - 1;
  const changeMonth = (offset: number) => {
    const [year, monthNumber] = month.split("-").map(Number);
    const nextMonth = new Date(year, monthNumber - 1 + offset, 1);
    onMonthChange(
      `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const goToToday = () => {
    onMonthChange(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  return (
    <div className="rounded-[14px] border border-[#dedee3] bg-white p-6 shadow-sm md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-[#1d1d1f]">
            {new Intl.DateTimeFormat("vi-VN", {
              month: "long",
              year: "numeric",
            }).format(new Date(`${month}-01T00:00:00`))}
          </p>
          <p className="mt-1 text-xs text-[#6e6e73]">
            Hôm nay:{" "}
            {new Intl.DateTimeFormat("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(today)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[#1d1d1f]">
          <button
            type="button"
            onClick={goToToday}
            className="h-8 rounded-full bg-[#f5f5f7] px-4 text-xs font-semibold text-[#0066cc] hover:bg-[#e8f2ff]"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f5f5f7]"
            aria-label="Tháng trước"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#f5f5f7]"
            aria-label="Tháng sau"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {weekdays.map((day) => (
          <p key={day} className="pb-3 text-xs font-medium text-[#6e6e73]">
            {day}
          </p>
        ))}

        {days.map((day) => {
          const dayEvents = events.filter((event) =>
            sameDay(new Date(event.date), day),
          );
          const isOutsideMonth = day.getMonth() !== activeMonth;
          const isSelected = dayEvents.some((event) => event.id === selectedEventId);
          const isToday = sameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              className={[
                "relative flex aspect-square items-center justify-center rounded-[10px] text-sm transition-colors",
                isOutsideMonth ? "text-[#d0d0d4]" : "text-[#8a8a8f]",
                isSelected ? "bg-[#242426] text-white" : "hover:bg-[#f5f5f7]",
                isToday && !isSelected
                  ? "ring-2 ring-[#0066cc] ring-offset-2 text-[#0066cc] font-semibold"
                  : "",
              ].join(" ")}
            >
              {dayEvents.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onSelect(dayEvents[0])}
                  className="flex h-full w-full flex-col items-center justify-center rounded-[10px]"
                >
                  <span>{day.getDate()}</span>
                  <span
                    className={[
                      "mt-1 h-1 w-1 rounded-full",
                      isSelected ? "bg-[#2997ff]" : "bg-[#0066cc]",
                    ].join(" ")}
                  />
                </button>
              ) : (
                <span>{day.getDate()}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
