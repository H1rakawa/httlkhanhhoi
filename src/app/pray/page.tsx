import Footer from "@/com/Footer";
import Header from "@/com/Header";
import PrayPageContent from "@/com/pray/PrayPageContent";
import SiteParallaxBackdrop from "@/com/shared/SiteParallaxBackdrop";

export default function PrayPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <SiteParallaxBackdrop imageOpacity="opacity-58" overlayClassName="bg-white/38 backdrop-blur-[1px]" />
      <Header activePath="/pray" />
      <PrayPageContent />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
