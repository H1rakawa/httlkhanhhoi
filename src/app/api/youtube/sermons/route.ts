import { NextResponse } from "next/server";
import { getYouTubeSermons } from "@/lib/youtube/sermons";

export async function GET() {
  try {
    const feed = await getYouTubeSermons();
    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải bài giảng từ YouTube.",
      },
      { status: 502 },
    );
  }
}
