import { NextResponse } from "next/server";
import {
  getAccessToken,
  getCurrentUser,
  supabaseDataRequest,
} from "@/lib/supabase/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const assignments = await supabaseDataRequest(
      "assignments?select=id,title,description,week_number,attachment_url,due_date,created_by&order=due_date.asc",
      await getAccessToken(),
    );
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể tải bài tập.",
      },
      { status: 500 },
    );
  }
}
