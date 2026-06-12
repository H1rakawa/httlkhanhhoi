import Header from "@/com/Header";
import Footer from "@/com/Footer";
import ContactHero from "@/com/contact/ContactHero";
import ContactInfo from "@/com/contact/ContactInfo";
import ContactMain from "@/com/contact/ContactMain";
import ContactMap from "@/com/contact/ContactMap";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-[#1d1d1f]">
      <Header activePath="/contact" />
      <ContactHero />
      <ContactMain />
      <ContactMap />
      <ContactInfo />
      <Footer />
    </main>
  );
}
