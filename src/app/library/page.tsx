import Footer from "@/com/Footer";
import Header from "@/com/Header";
import LibraryBackdrop from "@/com/library/LibraryBackdrop";
import LibraryPageClient from "@/com/library/LibraryPageClient";

export default function LibraryPage() {
  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <LibraryBackdrop />
      <Header activePath="/library" />
      <LibraryPageClient />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
