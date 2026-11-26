import Footer from "@/com/Footer";
import Header from "@/com/Header";
import LibraryBackdrop from "@/com/library/LibraryBackdrop";
import LibraryPageClient from "@/com/library/LibraryPageClient";
import { getLibraryResources } from "@/lib/library/resources";

export default async function LibraryPage() {
  const { resources, error } = await getLibraryResources();

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <LibraryBackdrop />
      <Header activePath="/library" />
      <LibraryPageClient resources={resources} loadError={error} />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
