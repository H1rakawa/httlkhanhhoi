import Header from "@/com/Header";
import Footer from "@/com/Footer";
import ContactBackdrop from "@/com/contact/ContactBackdrop";
import ContactHero from "@/com/contact/ContactHero";
import ContactInfo from "@/com/contact/ContactInfo";
import ContactMain from "@/com/contact/ContactMain";
import ContactMap from "@/com/contact/ContactMap";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <ContactBackdrop />
      <Header activePath="/contact" />
      <ContactHero />
      <div className="relative z-10">
        <div className="space-y-16 px-4 py-16 md:space-y-24 md:px-6 md:py-24">
          <ContactMain />
          <ContactMap />
          <ContactInfo />
        </div>
        <Footer />
      </div>
    </main>
  );
}
