import PrayerFilterBar from "@/com/pray/PrayerFilterBar";
import PrayerRequestCard from "@/com/pray/PrayerRequestCard";
import { PrayerRequest } from "@/com/pray/prayData";

type PrayerRequestListProps = {
  requests: PrayerRequest[];
  onOpen: (request: PrayerRequest) => void;
};

export default function PrayerRequestList({
  requests,
  onOpen,
}: PrayerRequestListProps) {
  return (
    <section className="grid gap-6">
      <PrayerFilterBar />
      <div className="grid gap-6">
        {requests.map((request) => (
          <PrayerRequestCard
            key={request.id}
            request={request}
            onOpen={onOpen}
          />
        ))}
      </div>
      <div className="liquid-readable flex items-center justify-center gap-2 p-3">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            className={[
              "h-10 w-10 rounded-full text-sm font-bold",
              page === 1 ? "bg-[#111113] text-white" : "bg-white/60 text-[#626a75]",
            ].join(" ")}
          >
            {page}
          </button>
        ))}
      </div>
    </section>
  );
}
