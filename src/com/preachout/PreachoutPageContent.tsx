import PreachoutEventsClient from "@/com/preachout/PreachoutEventsClient";
import PreachoutHero from "@/com/preachout/PreachoutHero";
import ProgressReportPanel from "@/com/preachout/ProgressReportPanel";
import ResourcesDownloadSection from "@/com/preachout/ResourcesDownloadSection";
import TestimoniesSharingSection from "@/com/preachout/TestimoniesSharingSection";
import type {
  OutreachResource,
  ProgressStat,
  Testimony,
} from "@/com/preachout/preachoutData";
import type { ChurchEvent, EventViewer } from "@/lib/events/types";

type PreachoutPageContentProps = {
  events: ChurchEvent[];
  resources: OutreachResource[];
  testimonies: Testimony[];
  stats: ProgressStat[];
  viewer: EventViewer;
  registeredEventIds: string[];
  loadError: string | null;
};

export default function PreachoutPageContent({
  events,
  resources,
  testimonies,
  stats,
  viewer,
  registeredEventIds,
  loadError,
}: PreachoutPageContentProps) {
  return (
    <>
      <PreachoutHero />
      {loadError && (
        <p className="relative z-10 mx-auto w-[calc(100%_-_2.5rem)] max-w-7xl rounded-[14px] bg-[#fff0f1] px-5 py-4 text-sm text-[#c0263a]">
          {loadError}
        </p>
      )}
      <PreachoutEventsClient
        events={events}
        viewer={viewer}
        registeredEventIds={registeredEventIds}
      />
      <ResourcesDownloadSection resources={resources} />
      <ProgressReportPanel stats={stats} />
      <TestimoniesSharingSection testimonies={testimonies} />
    </>
  );
}
