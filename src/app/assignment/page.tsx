import { redirect } from "next/navigation";
import AssignmentBackdrop from "@/com/assignment/AssignmentBackdrop";
import AssignmentPageClient from "@/com/assignment/AssignmentPageClient";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function AssignmentPage() {
  if (!(await getCurrentUser())) redirect("/auth");

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <AssignmentBackdrop />
      <Header activePath="/assignment" />
      <AssignmentPageClient />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
