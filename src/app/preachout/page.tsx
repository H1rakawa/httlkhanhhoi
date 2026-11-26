import Footer from "@/com/Footer";
import Header from "@/com/Header";
import PreachoutPageContent from "@/com/preachout/PreachoutPageContent";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";
import { getEventViewer } from "@/lib/events/events";
import { getPreachoutPageData } from "@/lib/events/preachout";

export default async function PreachoutPage() {
  const [data, { viewer, registeredEventIds }] = await Promise.all([
    getPreachoutPageData(),
    getEventViewer(),
  ]);

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <SiteParallaxBackdrop imageOpacity="opacity-62" overlayClassName="bg-white/32 backdrop-blur-[1px]" />
      <Header activePath="/preachout" />
      <PreachoutPageContent
        {...data}
        viewer={viewer}
        registeredEventIds={registeredEventIds}
      />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
