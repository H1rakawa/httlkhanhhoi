import { NextResponse } from "next/server";
import { getPublishedNewsPosts } from "@/lib/news/posts";

export async function GET() {
  try {
    const posts = await getPublishedNewsPosts();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể tải tin tức.",
      },
      { status: 500 },
    );
  }
}
