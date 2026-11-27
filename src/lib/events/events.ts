import { isStaffRole } from "@/lib/roles";
import {
  getAccessToken,
  getCurrentAccount,
  supabaseDataRequest,
} from "@/lib/supabase/auth";
import type {
  ChurchEvent,
  EventCategory,
  EventStatus,
  EventViewer,
} from "@/lib/events/types";

type EventRow = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  event_time: string;
  end_time: string | null;
  event_type: "regular" | "outreach";
  category: EventCategory;
  capacity: number | null;
  image_url: string | null;
  status: EventStatus;
  schedule: unknown;
  registration_open: boolean;
  featured: boolean;
  media_asset: { public_url: string | null } | null;
};

const EVENT_SELECT =
  "id,title,description,location,event_time,end_time,event_type,category,capacity,image_url,status,schedule,registration_open,featured,media_asset:media_asset_id(public_url)";

function normalizeSchedule(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const { time, title, label } = item as Record<string, unknown>;
        const text = [time, title ?? label].filter(Boolean).join(" ");
        return text || null;
      }
      return null;
    })
    .filter((item): item is string => Boolean(item));
}

async function getRegistrationCounts() {
  try {
    const rows = await supabaseDataRequest<
      Array<{ event_id: number; registered: number }>
    >("rpc/event_registration_counts");
    return new Map(rows.map((row) => [String(row.event_id), Number(row.registered)]));
  } catch {
    return new Map<string, number>();
  }
}

function toChurchEvent(row: EventRow, counts: Map<string, number>): ChurchEvent {
  const id = String(row.id);

  return {
    id,
    title: row.title,
    description: row.description ?? "",
    location: row.location ?? "HTTL. Khánh Hội",
    startsAt: row.event_time,
    endsAt: row.end_time,
    type: row.event_type,
    category: row.category,
    capacity: row.capacity,
    registered: counts.get(id) ?? 0,
    imageUrl: row.image_url || row.media_asset?.public_url || null,
    status: row.status,
    schedule: normalizeSchedule(row.schedule),
    registrationOpen: row.registration_open,
    featured: row.featured,
  };
}

export async function getEvents({ type }: { type?: "regular" | "outreach" } = {}) {
  const filters = ["status=neq.cancelled"];
  if (type) filters.push(`event_type=eq.${type}`);

  const [rows, counts] = await Promise.all([
    supabaseDataRequest<EventRow[]>(
      `events?select=${EVENT_SELECT}&${filters.join("&")}&order=event_time.asc`,
    ),
    getRegistrationCounts(),
  ]);

  return rows.map((row) => toChurchEvent(row, counts));
}

/** Người đang xem trang và danh sách sự kiện họ đã đăng ký (nếu đã đăng nhập). */
export async function getEventViewer(): Promise<{
  viewer: EventViewer;
  registeredEventIds: string[];
}> {
  const account = await getCurrentAccount();

  if (!account) {
    return {
      viewer: { loggedIn: false, name: null, email: null, phone: null, isStaff: false },
      registeredEventIds: [],
    };
  }

  const { user, profile } = account;
  const metadata = user.user_metadata ?? {};
  const viewer: EventViewer = {
    loggedIn: true,
    name: profile?.name || metadata.full_name || metadata.name || null,
    email: profile?.email || user.email || null,
    phone: profile?.phone || metadata.phone || null,
    isStaff:
      profile?.status === "active" && isStaffRole(profile.role),
  };

  try {
    const accessToken = await getAccessToken();
    const rows = await supabaseDataRequest<Array<{ event_id: number }>>(
      `event_registrations?user_id=eq.${user.id}&status=neq.cancelled&select=event_id`,
      accessToken,
    );
    return { viewer, registeredEventIds: rows.map((row) => String(row.event_id)) };
  } catch {
    return { viewer, registeredEventIds: [] };
  }
}
