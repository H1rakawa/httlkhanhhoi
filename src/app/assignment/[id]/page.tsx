import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AssignmentBackdrop from "@/com/assignment/AssignmentBackdrop";
import AssignmentWorkClient from "@/com/assignment/AssignmentWorkClient";
import { assignmentHref } from "@/com/assignment/assignmentData";
import Footer from "@/com/Footer";
import Header from "@/com/Header";
import {
  getAssignmentDetail,
  getMemberAssignments,
  resolveAssignmentId,
} from "@/lib/assignments/assignments";
import { getAccessToken, getCurrentUser } from "@/lib/supabase/auth";

type AssignmentWorkPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Làm bài tập",
};

export default async function AssignmentWorkPage({ params }: AssignmentWorkPageProps) {
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();
  if (!user || !accessToken) redirect("/auth");

  const resolved = await resolveAssignmentId((await params).id, accessToken);
  if (!resolved) notFound();
  const { rawId } = resolved;

  const [detail, all] = await Promise.all([
    getAssignmentDetail(rawId, user.id, accessToken).catch(() => null),
    getMemberAssignments(user.id, accessToken).catch(() => []),
  ]);
  if (!detail) notFound();
  // Link cũ (HW-009, số id) chuyển về đường dẫn theo mã bài tập.
  if (resolved.requested !== detail.assignment.id) redirect(assignmentHref(detail.assignment));

  // Ưu tiên bài chưa làm xong, cùng phân loại.
  const pending = all.filter(
    (item) =>
      item.rawId !== rawId && (item.status === "Chưa bắt đầu" || item.status === "Đang thực hiện"),
  );
  const related = [
    ...pending.filter((item) => item.category === detail.assignment.category),
    ...pending.filter((item) => item.category !== detail.assignment.category),
  ].slice(0, 2);

  return (
    <main className="relative min-h-screen overflow-clip bg-transparent text-[#1d1d1f]">
      <AssignmentBackdrop />
      <Header activePath="/assignment" />
      <AssignmentWorkClient
        assignment={detail.assignment}
        questions={detail.questions}
        submission={detail.submission}
        answers={detail.answers}
        related={related}
      />
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
