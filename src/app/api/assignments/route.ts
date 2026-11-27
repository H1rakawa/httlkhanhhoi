import { NextRequest, NextResponse } from "next/server";
import { vietnamDateKey as vietnamDate } from "@/com/assignment/assignmentData";
import { getMemberAssignments } from "@/lib/assignments/assignments";
import { getAccessToken, getCurrentUser } from "@/lib/supabase/auth";

export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken();
  const user = accessToken ? await getCurrentUser() : null;
  if (!accessToken || !user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const dueWithinDays = Number(request.nextUrl.searchParams.get("dueWithinDays"));
  const range =
    Number.isFinite(dueWithinDays) && dueWithinDays > 0
      ? { dueFrom: vietnamDate(), dueTo: vietnamDate(Math.floor(dueWithinDays)) }
      : {};

  try {
    return NextResponse.json(await getMemberAssignments(user.id, accessToken, range));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể tải bài tập." },
      { status: 500 },
    );
  }
}
