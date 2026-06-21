import { NextResponse } from "next/server";
import { supabaseDataRequest } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const resources = await supabaseDataRequest(
      "resources?select=id,title,type,url,thumbnail_url,mime_type,size_bytes,uploaded_by,created_at,media_asset:media_asset_id(id,bucket_id,object_path,public_url,media_kind,mime_type,size_bytes)&order=created_at.desc",
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
