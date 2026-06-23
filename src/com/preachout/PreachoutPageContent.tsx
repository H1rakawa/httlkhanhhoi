import EventDetailCard from "@/com/preachout/EventDetailCard";
import EvangelismEventsList from "@/com/preachout/EvangelismEventsList";
import PreachoutHero from "@/com/preachout/PreachoutHero";
import ProgressReportPanel from "@/com/preachout/ProgressReportPanel";
import ResourcesDownloadSection from "@/com/preachout/ResourcesDownloadSection";
import TestimoniesSharingSection from "@/com/preachout/TestimoniesSharingSection";
import {
  outreachEvents,
  progressStats,
  resources,
  testimonies,
} from "@/com/preachout/preachoutData";

export default function PreachoutPageContent() {
  return (
    <>
      <PreachoutHero />
      <EvangelismEventsList events={outreachEvents} />
      <section className="relative z-10 px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <EventDetailCard event={outreachEvents[0]} />
        </div>
      </section>
      <ResourcesDownloadSection resources={resources} />
      <ProgressReportPanel stats={progressStats} />
      <TestimoniesSharingSection testimonies={testimonies} />
    </>
  );
}
