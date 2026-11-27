import { redirect } from "next/navigation";
import AssignmentBackdrop from "@/com/assignment/AssignmentBackdrop";
import AssignmentPageClient from "@/com/assignment/AssignmentPageClient";
import type { AssignmentItem } from "@/com/assignment/assignmentData";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import { getMemberAssignments } from "@/lib/assignments/assignments";
import { getAccessToken, getCurrentUser } from "@/lib/supabase/auth";

export default async function AssignmentPage() {
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();
  if (!user || !accessToken) redirect("/auth");

  let assignments: AssignmentItem[] = [];
  let loadError: string | null = null;
  try {
    assignments = await getMemberAssignments(user.id, accessToken);
  } catch {
    loadError = "Chưa tải được danh sách bài tập. Vui lòng thử tải lại trang.";
  }

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <AssignmentBackdrop />
      <Header activePath="/assignment" />
      <AssignmentPageClient assignments={assignments} loadError={loadError} />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
