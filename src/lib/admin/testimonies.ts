import { supabaseDataRequest } from "@/lib/supabase/auth";
import { optionalText, optionalUrl, requiredText } from "@/lib/admin/staff";
import {
  isTestimonyStatus,
  type AdminTestimony,
  type AdminTestimonyStatus,
} from "@/com/admin/preachout/adminTestimonyData";

const TESTIMONY_SELECT = [
  "id,user_id,event_id,name,role,quote,image_url,status,created_at,updated_at",
  "event:event_id(title)",
  "approver:approved_by(name,email)",
  "author:user_id(name,email)",
].join(",");

type TestimonyRow = {
  id: number;
  user_id: string | null;
  event_id: number | null;
  name: string;
  role: string | null;
  quote: string;
  image_url: string | null;
  status: AdminTestimonyStatus;
  created_at: string;
  updated_at: string;
  event: { title: string } | null;
  approver: { name: string | null; email: string | null } | null;
  author: { name: string | null; email: string | null } | null;
};

function mapTestimony(row: TestimonyRow): AdminTestimony {
  return {
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    eventTitle: row.event?.title ?? null,
    name: row.name,
    role: row.role,
    quote: row.quote,
    imageUrl: row.image_url,
    status: row.status,
    approverName: row.approver?.name || row.approver?.email || null,
    submitterName: row.author?.name || null,
    submitterEmail: row.author?.email || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminTestimonies(accessToken: string) {
  const rows = await supabaseDataRequest<TestimonyRow[]>(
    `testimonies?select=${TESTIMONY_SELECT}&order=created_at.desc&limit=1000`,
    accessToken,
  );
  return rows.map(mapTestimony);
}

export function parseTestimonyInput(body: Record<string, unknown>) {
  if (!isTestimonyStatus(body.status)) throw new Error("Trạng thái không hợp lệ.");
  const eventId = body.eventId == null || body.eventId === "" ? null : Number(body.eventId);
  if (eventId !== null && (!Number.isInteger(eventId) || eventId <= 0)) {
    throw new Error("Sự kiện không hợp lệ.");
  }
  return {
    name: requiredText(body.name, 120, "Tên người làm chứng"),
    role: optionalText(body.role, 120, "Vai trò"),
    quote: requiredText(body.quote, 3000, "Lời làm chứng"),
    image_url: optionalUrl(body.imageUrl, "Ảnh"),
    event_id: eventId,
    ...statusPatch(body.status),
  };
}

/** Bỏ người duyệt khi đưa về chờ duyệt / từ chối; trigger tự ghi người duyệt khi duyệt. */
export function statusPatch(status: AdminTestimonyStatus) {
  return status === "approved" ? { status } : { status, approved_by: null };
}

export async function createAdminTestimony(
  accessToken: string,
  userId: string,
  input: ReturnType<typeof parseTestimonyInput>,
) {
  const rows = await supabaseDataRequest<TestimonyRow[]>(`testimonies?select=${TESTIMONY_SELECT}`, accessToken, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...input, user_id: userId }),
  });
  return mapTestimony(rows[0]);
}

export async function updateAdminTestimony(accessToken: string, id: string, patch: Record<string, unknown>) {
  const rows = await supabaseDataRequest<TestimonyRow[]>(
    `testimonies?id=eq.${id}&select=${TESTIMONY_SELECT}`,
    accessToken,
    { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch) },
  );
  return rows[0] ? mapTestimony(rows[0]) : null;
}

export async function deleteAdminTestimony(accessToken: string, id: string) {
  const rows = await supabaseDataRequest<Array<{ id: number; name: string }>>(
    `testimonies?id=eq.${id}&select=id,name`,
    accessToken,
    { method: "DELETE", headers: { Prefer: "return=representation" } },
  );
  return rows[0] ?? null;
}

/** Số tài liệu truyền giảng (category = truyen-giang), kể cả bản nháp. */
export async function countOutreachResources(accessToken: string) {
  const rows = await supabaseDataRequest<Array<{ id: number; is_published: boolean }>>(
    "resources?category=eq.truyen-giang&select=id,is_published",
    accessToken,
  );
  return { total: rows.length, published: rows.filter((row) => row.is_published).length };
}
