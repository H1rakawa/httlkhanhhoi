import LatestPrayerRequests from "@/com/dashboard/LatestPrayerRequests";
import SuggestedResources from "@/com/dashboard/SuggestedResources";
import type { LibraryResource } from "@/com/library/libraryData";
import type { PrayerRequest } from "@/com/pray/prayData";

export default function DashboardInfoPanel({
  resources,
  prayers,
  prayersFailed,
}: {
  resources: LibraryResource[];
  prayers: PrayerRequest[];
  prayersFailed: boolean;
}) {
  return (
    <section className="liquid-readable p-5 md:p-6">
      <SuggestedResources resources={resources} />
      <LatestPrayerRequests prayers={prayers} failed={prayersFailed} />
    </section>
  );
}
