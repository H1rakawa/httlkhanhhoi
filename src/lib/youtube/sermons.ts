import { LibraryResource } from "@/com/library/libraryData";

export type YouTubeSermonFeed = {
  channelId: string;
  channelUrl: string;
  liveEmbedUrl: string;
  live: LibraryResource;
  videos: LibraryResource[];
  status: "ready" | "fallback";
  message?: string;
};

const defaultHandle = "@httlkhanhhoi4369";
const fallbackImage =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=86";

function getConfiguredHandle() {
  const handle = (process.env.YOUTUBE_CHANNEL_HANDLE || defaultHandle).trim();
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function getRevalidateSeconds() {
  const seconds = Number(process.env.YOUTUBE_FEED_REVALIDATE_SECONDS || 300);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 300;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function textBetween(source: string, tag: string) {
  const match = source.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeHtml(match[1].trim()) : "";
}

function attr(source: string, name: string) {
  const match = source.match(new RegExp(`${name}="([^"]*)"`));
  return match ? decodeHtml(match[1]) : "";
}

function cleanDescription(description: string) {
  return (
    description
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220) ||
    "Bài giảng mới từ kênh YouTube HTTL Khánh Hội, được tự động cập nhật để cộng đồng có thể xem và suy ngẫm."
  );
}

function parseChannelId(html: string) {
  const exactMatches = [
    html.match(/"channelId":"(UC[\w-]{22})"/)?.[1],
    html.match(/"browseId":"(UC[\w-]{22})"/)?.[1],
    html.match(/"externalId":"(UC[\w-]{22})"/)?.[1],
    html.match(/<meta itemprop="channelId" content="(UC[\w-]{22})">/)?.[1],
    html.match(/channel_id=(UC[\w-]{22})/)?.[1],
  ].filter(Boolean);

  return exactMatches[0] || html.match(/\b(UC[\w-]{22})\b/)?.[1] || "";
}

export async function resolveYouTubeChannelId() {
  const configuredId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (configuredId) return configuredId;

  const normalizedHandle = getConfiguredHandle();
  const response = await fetch(`https://www.youtube.com/${normalizedHandle}`, {
    next: { revalidate: 60 * 60 * 24 },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; HTTLKhanhHoiBot/1.0; +https://khanhhoiwebnew.vercel.app)",
    },
  });

  if (!response.ok) {
    throw new Error("Không thể xác định kênh YouTube từ handle.");
  }

  const channelId = parseChannelId(await response.text());
  if (!channelId) {
    throw new Error("Không tìm thấy channel ID trong trang YouTube.");
  }

  return channelId;
}

function createLiveResource(channelId: string, channelUrl: string): LibraryResource {
  return {
    id: "youtube-live",
    title: "Livestream HTTL Khánh Hội",
    description:
      "Khu vực livestream tự động của kênh YouTube HTTL Khánh Hội. Khi kênh có buổi phát trực tiếp mới, video live sẽ được nhúng tại đây.",
    type: "Bài giảng",
    url: channelId ? `https://www.youtube.com/channel/${channelId}/live` : channelUrl,
    image: fallbackImage,
    createdAt: new Date().toISOString(),
    ...(channelId
      ? { embedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}` }
      : {}),
    source: "youtube",
  };
}

function createFallbackFeed(message: string): YouTubeSermonFeed {
  const channelUrl = `https://www.youtube.com/${getConfiguredHandle()}`;

  return {
    channelId: "",
    channelUrl,
    liveEmbedUrl: "",
    live: createLiveResource("", channelUrl),
    videos: [],
    status: "fallback",
    message,
  };
}

async function fetchYouTubeVideos(channelId: string, limit: number) {
  const response = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
    {
      next: { revalidate: getRevalidateSeconds() },
      headers: {
        Accept: "application/atom+xml, application/xml;q=0.9, text/xml;q=0.8",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tải feed video YouTube.");
  }

  const xml = await response.text();
  return Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g))
    .slice(0, limit)
    .map((match) => {
      const entry = match[1];
      const videoId = textBetween(entry, "yt:videoId");
      const title = textBetween(entry, "title");
      const description = cleanDescription(textBetween(entry, "media:description"));
      const published = textBetween(entry, "published") || textBetween(entry, "updated");
      const image =
        attr(entry.match(/<media:thumbnail[^>]*>/)?.[0] || "", "url") ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      return {
        id: `youtube-${videoId}`,
        title,
        description,
        type: "Bài giảng" as const,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        image,
        createdAt: published,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        source: "youtube" as const,
        videoId,
      };
    })
    .filter((video) => video.videoId && video.title);
}

export async function getYouTubeSermons(limit = 12): Promise<YouTubeSermonFeed> {
  let channelId = "";
  try {
    channelId = await resolveYouTubeChannelId();
  } catch (error) {
    return createFallbackFeed(
      error instanceof Error
        ? error.message
        : "Không thể xác định kênh YouTube từ cấu hình hiện tại.",
    );
  }

  const channelUrl = `https://www.youtube.com/channel/${channelId}`;
  try {
    const videos = await fetchYouTubeVideos(channelId, limit);

    return {
      channelId,
      channelUrl,
      liveEmbedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
      live: createLiveResource(channelId, channelUrl),
      videos,
      status: "ready",
    };
  } catch (error) {
    return {
      ...createFallbackFeed(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách video YouTube.",
      ),
      channelId,
      channelUrl,
      liveEmbedUrl: `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
      live: createLiveResource(channelId, channelUrl),
    };
  }
}
