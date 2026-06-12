import Header from "@/com/Header";
import Footer from "@/com/Footer";
import AboutHero from "@/com/about/AboutHero";
import AboutParallaxBackdrop from "@/com/about/AboutParallaxBackdrop";
import ChurchStory from "@/com/about/ChurchStory";
import HistoryTimeline from "@/com/about/HistoryTimeline";
import LeadershipTeam from "@/com/about/LeadershipTeam";
import MissionVision from "@/com/about/MissionVision";
import QuickContact from "@/com/about/QuickContact";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <AboutParallaxBackdrop />
      <Header activePath="/about" />
      <AboutHero />
      <div className="relative z-10">
        <div className="space-y-16 px-0 py-16 md:space-y-24 md:py-24">
          <ChurchStory />
          <MissionVision />
          <HistoryTimeline />
          <LeadershipTeam />
          <QuickContact />
        </div>
        <Footer />
      </div>
    </main>
  );
}
