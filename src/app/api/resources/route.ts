import { NextResponse } from "next/server";
import { getPublishedResources } from "@/lib/library/resources";

export async function GET() {
  try {
    return NextResponse.json(await getPublishedResources());
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
