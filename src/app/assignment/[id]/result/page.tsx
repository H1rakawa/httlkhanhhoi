import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AssignmentBackdrop from "@/com/assignment/AssignmentBackdrop";
import AssignmentResult from "@/com/assignment/AssignmentResult";
import { assignmentRawId, assignmentRouteId } from "@/com/assignment/assignmentData";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import { getAssignmentAnswerKey, getAssignmentDetail } from "@/lib/assignments/assignments";
import { getAccessToken, getCurrentUser } from "@/lib/supabase/auth";

type AssignmentResultPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Kết quả bài tập | HTTL. Khánh Hội",
};

export default async function AssignmentResultPage({ params }: AssignmentResultPageProps) {
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();
  if (!user || !accessToken) redirect("/auth");

  const rawId = assignmentRawId((await params).id);
  if (!rawId) notFound();

  const detail = await getAssignmentDetail(rawId, user.id, accessToken).catch(() => null);
  if (!detail) notFound();

  const { submission } = detail;
  // Chưa nộp (hoặc mới lưu nháp) thì quay về trang làm bài.
  if (!submission || submission.status === "draft") {
    redirect(`/assignment/${assignmentRouteId(rawId)}`);
  }

  const answerKey =
    submission.status === "graded"
      ? await getAssignmentAnswerKey(rawId, accessToken)
      : new Map<number, number[]>();

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <AssignmentBackdrop />
      <Header activePath="/assignment" />
      <AssignmentResult
        assignment={detail.assignment}
        questions={detail.questions}
        submission={submission}
        answers={detail.answers}
        answerKey={answerKey}
      />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
