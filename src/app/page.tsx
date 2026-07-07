import Header from "@/com/Header";
import Footer from "@/com/Footer";
import AboutSummary from "@/com/home/AboutSummary";
import CallToAction from "@/com/home/CallToAction";
import FeaturedTeasers, { EventList } from "@/com/home/FeaturedTeasers";
import HeroBanner from "@/com/home/HeroBanner";
import HomeParallaxBackdrop from "@/com/home/HomeParallaxBackdrop";
import KeyMessages from "@/com/home/KeyMessages";
import SermonVideos from "@/com/news/SermonVideos";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <HomeParallaxBackdrop />
      <Header activePath="/" showNotice />
      <HeroBanner />
      <div className="relative z-10 space-y-16 px-4 py-14 md:space-y-24 md:px-6 md:py-20">
        <AboutSummary />
        <KeyMessages />
        <SermonVideos />
        <FeaturedTeasers />
        <EventList />
        <CallToAction />
      </div>
      <div id="contact" className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
