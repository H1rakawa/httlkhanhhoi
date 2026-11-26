import type { ChurchEvent } from "@/lib/events/types";
import { canRegister } from "@/lib/events/types";

type RegisterActionProps = {
  event: ChurchEvent;
  isRegistered: boolean;
  onRegister: (event: ChurchEvent) => void;
  featured?: boolean;
  compact?: boolean;
};

function actionLabel(event: ChurchEvent, isRegistered: boolean) {
  if (isRegistered) return "Đã đăng ký";
  if (event.status === "ended") return "Đã kết thúc";
  if (!event.registrationOpen) return "Chưa mở đăng ký";
  if (!canRegister(event)) return "Đã đủ chỗ";
  return "Đăng ký tham gia";
}

export default function RegisterAction({
  event,
  isRegistered,
  onRegister,
  featured = false,
  compact = false,
}: RegisterActionProps) {
  const enabled = !isRegistered && canRegister(event);

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={() => onRegister(event)}
      className={[
        "inline-flex items-center justify-center rounded-[12px] text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60",
        compact ? "h-10 px-5" : "h-11 w-full px-5",
        featured || compact
          ? "bg-[#111113] text-white"
          : "border border-white/90 bg-white/58 text-[#424245]",
      ].join(" ")}
    >
      {actionLabel(event, isRegistered)}
    </button>
  );
}
