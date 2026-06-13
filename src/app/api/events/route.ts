import { NextResponse } from "next/server";
import { supabaseDataRequest } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const events = await supabaseDataRequest(
      "events?select=id,title,description,location,event_time,created_by&order=event_time.asc",
    );
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể tải sự kiện." },
      { status: 500 },
    );
  }
}
