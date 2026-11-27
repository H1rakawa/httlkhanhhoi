import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AssignmentBackdrop from "@/com/assignment/AssignmentBackdrop";
import AssignmentResult from "@/com/assignment/AssignmentResult";
import { assignmentHref } from "@/com/assignment/assignmentData";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import {
  getAssignmentAnswerKey,
  getAssignmentDetail,
  resolveAssignmentId,
} from "@/lib/assignments/assignments";
import { getAccessToken, getCurrentUser } from "@/lib/supabase/auth";

type AssignmentResultPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Kết quả bài tập",
};

export default async function AssignmentResultPage({ params }: AssignmentResultPageProps) {
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();
  if (!user || !accessToken) redirect("/auth");

  const resolved = await resolveAssignmentId((await params).id, accessToken);
  if (!resolved) notFound();
  const { rawId } = resolved;

  const detail = await getAssignmentDetail(rawId, user.id, accessToken).catch(() => null);
  if (!detail) notFound();

  if (resolved.requested !== detail.assignment.id) redirect(assignmentHref(detail.assignment, true));

  const { submission } = detail;
  // Chưa nộp (hoặc mới lưu nháp) thì quay về trang làm bài.
  if (!submission || submission.status === "draft") {
    redirect(assignmentHref(detail.assignment));
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
