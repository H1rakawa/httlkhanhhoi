import { NextResponse } from "next/server";
import { supabaseDataRequest } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const resources = await supabaseDataRequest(
      "resources?select=id,title,type,url,uploaded_by,created_at&order=created_at.desc",
    );
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể tải tài liệu.",
      },
      { status: 500 },
    );
  }
}
