import { supabaseDataRequest } from "@/lib/supabase/auth";
import { optionalText, optionalUrl, optionalUuid, requiredText } from "@/lib/admin/staff";
import {
  isEventCategory,
  isEventStatus,
  type AdminEvent,
  type AdminRegistration,
  type AdminRegistrationStatus,
} from "@/com/admin/events/adminEventData";

const EVENT_SELECT = [
  "id,title,description,location,event_time,end_time,event_type,category,capacity",
  "image_url,media_asset_id,status,schedule,registration_open,featured,created_at",
  "media_asset:media_asset_id(public_url)",
  "event_registrations(status,attendees)",
].join(",");

type EventRow = {
  id: number;
  title: string;
  description: string | null;
  location: string;
  event_time: string;
  end_time: string | null;
  event_type: AdminEvent["type"];
  category: AdminEvent["category"];
  capacity: number | null;
  image_url: string | null;
  media_asset_id: string | null;
  status: AdminEvent["status"];
  schedule: unknown;
  registration_open: boolean;
  featured: boolean;
  created_at: string;
  media_asset: { public_url: string | null } | null;
  event_registrations: Array<{ status: string; attendees: number }> | null;
};

function mapEvent(row: EventRow): AdminEvent {
  const active = (row.event_registrations ?? []).filter((item) => item.status !== "cancelled");
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    location: row.location,
    startsAt: row.event_time,
    endsAt: row.end_time,
    type: row.event_type,
    category: row.category,
    capacity: row.capacity,
    imageUrl: row.image_url || row.media_asset?.public_url || null,
    mediaAssetId: row.media_asset_id,
    status: row.status,
    schedule: Array.isArray(row.schedule)
      ? row.schedule
          .map((item: unknown) => {
            if (typeof item === "string") return item;
            if (!item || typeof item !== "object") return "";
            const { time, title, label } = item as Record<string, unknown>;
            return [time, title ?? label].filter(Boolean).join(" ");
          })
          .filter(Boolean)
      : [],
    registrationOpen: row.registration_open,
    featured: row.featured,
    registered: active.reduce((sum, item) => sum + (item.attendees ?? 1), 0),
    registrationCount: active.length,
    createdAt: row.created_at,
  };
}

export async function getAdminEvents(accessToken: string) {
  const rows = await supabaseDataRequest<EventRow[]>(
    `events?select=${EVENT_SELECT}&order=event_time.desc&limit=500`,
    accessToken,
  );
  return rows.map(mapEvent);
}

function parseDate(value: unknown, label: string, required: boolean) {
  if (value == null || value === "") {
    if (required) throw new Error(`Vui lòng chọn ${label.toLowerCase()}.`);
    return null;
  }
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new Error(`${label} không hợp lệ.`);
  return date.toISOString();
}

/** Kiểm tra dữ liệu form sự kiện, trả về dòng để ghi vào bảng events. */
export function parseEventInput(body: Record<string, unknown>) {
  const startsAt = parseDate(body.startsAt, "Thời gian bắt đầu", true)!;
  const endsAt = parseDate(body.endsAt, "Thời gian kết thúc", false);
  if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
    throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu.");
  }

  const capacityRaw = body.capacity;
  let capacity: number | null = null;
  if (capacityRaw !== null && capacityRaw !== undefined && capacityRaw !== "") {
    capacity = Number(capacityRaw);
    if (!Number.isInteger(capacity) || capacity <= 0 || capacity > 100000) {
      throw new Error("Sức chứa phải là số nguyên dương.");
    }
  }

  if (body.type !== "regular" && body.type !== "outreach") throw new Error("Loại sự kiện không hợp lệ.");
  if (!isEventCategory(body.category)) throw new Error("Chuyên mục không hợp lệ.");
  if (!isEventStatus(body.status)) throw new Error("Trạng thái không hợp lệ.");

  const schedule = Array.isArray(body.schedule)
    ? body.schedule
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 30)
    : [];
  if (schedule.some((item) => item.length > 200)) throw new Error("Mỗi dòng lịch trình tối đa 200 ký tự.");

  return {
    title: requiredText(body.title, 160, "Tên sự kiện"),
    description: optionalText(body.description, 5000, "Mô tả"),
    location: requiredText(body.location, 200, "Địa điểm"),
    event_time: startsAt,
    end_time: endsAt,
    event_type: body.type,
    category: body.category,
    capacity,
    image_url: optionalUrl(body.imageUrl, "Ảnh sự kiện"),
    media_asset_id: optionalUuid(body.mediaAssetId),
    status: body.status,
    schedule,
    registration_open: body.registrationOpen === true,
    featured: body.featured === true,
  };
}

export async function createAdminEvent(
  accessToken: string,
  userId: string,
  input: ReturnType<typeof parseEventInput>,
) {
  const rows = await supabaseDataRequest<EventRow[]>(
    `events?select=${EVENT_SELECT}`,
    accessToken,
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...input, created_by: userId }),
    },
  );
  return mapEvent(rows[0]);
}

export async function updateAdminEvent(
  accessToken: string,
  id: string,
  patch: Record<string, unknown>,
) {
  const rows = await supabaseDataRequest<EventRow[]>(
    `events?id=eq.${id}&select=${EVENT_SELECT}`,
    accessToken,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch),
    },
  );
  return rows[0] ? mapEvent(rows[0]) : null;
}

export async function deleteAdminEvent(accessToken: string, id: string) {
  const rows = await supabaseDataRequest<Array<{ id: number; title: string; media_asset_id: string | null }>>(
    `events?id=eq.${id}&select=id,title,media_asset_id`,
    accessToken,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );
  return rows[0] ?? null;
}

type RegistrationRow = {
  id: number;
  event_id: number;
  user_id: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  attendees: number;
  status: AdminRegistrationStatus;
  note: string | null;
  created_at: string;
};

const REGISTRATION_SELECT = "id,event_id,user_id,full_name,phone,email,attendees,status,note,created_at";

function mapRegistration(row: RegistrationRow): AdminRegistration {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    attendees: row.attendees,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function getEventRegistrations(accessToken: string, eventId: string) {
  const rows = await supabaseDataRequest<RegistrationRow[]>(
    `event_registrations?event_id=eq.${eventId}&select=${REGISTRATION_SELECT}&order=created_at.asc`,
    accessToken,
  );
  return rows.map(mapRegistration);
}

export async function updateEventRegistrations(
  accessToken: string,
  eventId: string,
  ids: number[],
  status: AdminRegistrationStatus,
) {
  const rows = await supabaseDataRequest<RegistrationRow[]>(
    `event_registrations?event_id=eq.${eventId}&id=in.(${ids.join(",")})&select=${REGISTRATION_SELECT}`,
    accessToken,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status }),
    },
  );
  return rows.map(mapRegistration);
}

export async function deleteEventRegistrations(accessToken: string, eventId: string, ids: number[]) {
  const rows = await supabaseDataRequest<Array<{ id: number }>>(
    `event_registrations?event_id=eq.${eventId}&id=in.(${ids.join(",")})&select=id`,
    accessToken,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );
  return rows.map((row) => row.id);
}
