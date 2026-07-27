import LatestPrayerRequests from "@/com/dashboard/LatestPrayerRequests";
import SuggestedResources from "@/com/dashboard/SuggestedResources";

export default function DashboardInfoPanel() {
  return (
    <section className="liquid-readable p-5 md:p-6">
      <SuggestedResources />
      <LatestPrayerRequests />
    </section>
  );
}
