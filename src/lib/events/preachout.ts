import type {
  OutreachResource,
  ProgressStat,
  Testimony,
} from "@/com/preachout/preachoutData";
import { supabaseDataRequest } from "@/lib/supabase/auth";
import { getEvents } from "@/lib/events/events";
import type { ChurchEvent } from "@/lib/events/types";

type ResourceRow = {
  id: number;
  title: string;
  type: string | null;
  url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  description: string | null;
  media_asset: { public_url: string | null; mime_type: string | null; size_bytes: number | null } | null;
};

type TestimonyRow = {
  id: number;
  name: string;
  role: string | null;
  quote: string;
  image_url: string | null;
};

const numberFormat = new Intl.NumberFormat("vi-VN");

function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 || value >= 100 ? 0 : 1)} ${units[index]}`;
}

function resourceTone(label: string) {
  const value = label.toLowerCase();
  if (value.includes("pdf")) return "bg-[#eef0ff] text-[#6157ff]";
  if (value.includes("video")) return "bg-[#fff0f3] text-[#ff4d6d]";
  if (value.includes("âm thanh") || value.includes("audio")) return "bg-[#fff4e8] text-[#ff7a45]";
  return "bg-[#f1f3f5] text-[#6b7280]";
}

function toResource(row: ResourceRow): OutreachResource {
  const mimeType = row.mime_type || row.media_asset?.mime_type || "";
  const typeLabel = row.type?.trim() || mimeType.split("/").pop()?.toUpperCase() || "Tài liệu";
  const size = formatBytes(row.size_bytes ?? row.media_asset?.size_bytes ?? null);

  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    meta: [typeLabel, size].filter(Boolean).join(" • "),
    href: row.url || row.media_asset?.public_url || null,
    tone: resourceTone(`${typeLabel} ${mimeType}`),
    thumbnailUrl: row.thumbnail_url,
    isVideo: typeLabel.toLowerCase().includes("video") || mimeType.startsWith("video/"),
  };
}

async function getResources() {
  const rows = await supabaseDataRequest<ResourceRow[]>(
    "resources?is_published=eq.true&category=eq.truyen-giang&select=id,title,type,url,thumbnail_url,mime_type,size_bytes,description,media_asset:media_asset_id(public_url,mime_type,size_bytes)&order=created_at.desc",
  );
  return rows.map(toResource);
}

async function getApprovedTestimonies() {
  const rows = await supabaseDataRequest<TestimonyRow[]>(
    "testimonies?status=eq.approved&select=id,name,role,quote,image_url&order=created_at.desc&limit=3",
  );
  return rows.map<Testimony>((row) => ({
    id: String(row.id),
    name: row.name,
    role: row.role,
    quote: row.quote,
    image: row.image_url,
  }));
}

function buildStats(events: ChurchEvent[], resourceCount: number): ProgressStat[] {
  const now = Date.now();
  const totalRegistered = events.reduce((sum, event) => sum + event.registered, 0);
  const openCount = events.filter(
    (event) => event.registrationOpen && event.status !== "ended",
  ).length;
  const finishedCount = events.filter(
    (event) =>
      event.status === "ended" || new Date(event.endsAt ?? event.startsAt).getTime() < now,
  ).length;

  return [
    {
      label: "Hoạt động truyền giảng",
      value: numberFormat.format(events.length),
      detail: `${openCount} đang mở đăng ký · ${finishedCount} đã hoàn thành`,
    },
    {
      label: "Lượt đăng ký tham gia",
      value: numberFormat.format(totalRegistered),
      detail: `Trên ${events.length} hoạt động`,
    },
    {
      label: "Tài liệu chia sẻ",
      value: numberFormat.format(resourceCount),
      detail: "Tài liệu truyền giảng trong thư viện",
    },
  ];
}

async function settle<T>(promise: Promise<T>, fallback: T) {
  try {
    return { data: await promise, failed: false };
  } catch {
    return { data: fallback, failed: true };
  }
}

export async function getPreachoutPageData() {
  const [events, resources, testimonies] = await Promise.all([
    settle(getEvents({ type: "outreach" }), [] as ChurchEvent[]),
    settle(getResources(), [] as OutreachResource[]),
    settle(getApprovedTestimonies(), [] as Testimony[]),
  ]);

  return {
    events: events.data,
    resources: resources.data,
    testimonies: testimonies.data,
    stats: buildStats(events.data, resources.data.length),
    loadError:
      events.failed || resources.failed || testimonies.failed
        ? "Một phần dữ liệu chưa tải được từ máy chủ. Vui lòng thử tải lại trang."
        : null,
  };
}
