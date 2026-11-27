import { PRAYER_STATUS_LABELS, type PrayerStatus } from "@/com/pray/prayData";

const tones: Record<PrayerStatus, string> = {
  pending: "border-[#ff9f0a]/30 bg-[#fff4df] text-[#9a5f00]",
  approved: "border-[#6c4cff]/22 bg-[#f0ecff] text-[#6c4cff]",
  answered: "border-[#34c759]/22 bg-[#e9f9ef] text-[#1b8f45]",
  rejected: "border-[#ff3b30]/20 bg-[#fff1f0] text-[#b42318]",
};

export default function PrayerStatusBadge({ status }: { status: PrayerStatus }) {
  return (
    <span className={`rounded-full border px-4 py-1.5 text-xs font-bold ${tones[status]}`}>
      {PRAYER_STATUS_LABELS[status]}
    </span>
  );
}
