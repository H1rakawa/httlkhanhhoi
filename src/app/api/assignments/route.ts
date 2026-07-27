import { NextRequest, NextResponse } from "next/server";
import {
  getAccessToken,
  getCurrentUser,
  supabaseDataRequest,
} from "@/lib/supabase/auth";

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function assignmentQuery(request: NextRequest) {
  const baseQuery =
    "assignments?select=id,title,description,category,week_number,attachment_url,due_date,created_by,media_asset:media_asset_id(id,bucket_id,object_path,public_url,media_kind,mime_type,size_bytes),submissions(status,grade)";
  const dueWithinDays = Number(request.nextUrl.searchParams.get("dueWithinDays"));

  if (!Number.isFinite(dueWithinDays) || dueWithinDays <= 0) {
    return `${baseQuery}&order=due_date.asc`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + Math.floor(dueWithinDays));

  return [
    baseQuery,
    `due_date=gte.${formatDateParam(today)}`,
    `due_date=lte.${formatDateParam(endDate)}`,
    "order=due_date.asc",
  ].join("&");
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const assignments = await supabaseDataRequest(
      assignmentQuery(request),
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
