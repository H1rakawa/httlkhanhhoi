import { NextResponse } from "next/server";
import { getAccessToken, getCurrentAccount } from "@/lib/supabase/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type {
  ContactMessage,
  ContactStatus,
} from "@/com/admin/contact/adminContactData";

/** Khớp public.is_staff(): giáo viên hoặc quản trị viên đang hoạt động. */
export function isStaffProfile(
  profile: { role?: string | null; status?: string | null } | null | undefined,
) {
  return (
    !!profile &&
    (profile.role === "admin" || profile.role === "teacher") &&
    profile.status === "active"
  );
}

export async function requireStaff() {
  const account = await getCurrentAccount();

  if (!account) {
    return {
      error: NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 }),
    };
  }

  if (!isStaffProfile(account.profile)) {
    return {
      error: NextResponse.json(
        { error: "Bạn không có quyền xem hộp thư liên hệ." },
        { status: 403 },
      ),
    };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return {
      error: NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 }),
    };
  }

  return { account, accessToken };
}

export const CONTACT_SELECT =
  "id,name,email,phone,message,status,handled_by,replied_at,created_at,handler:handled_by(name,email)";

export type ContactMessageRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  handled_by: string | null;
  replied_at: string | null;
  created_at: string;
  handler: { name: string | null; email: string | null } | null;
};

export function mapContactMessage(row: ContactMessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    repliedAt: row.replied_at,
    handledBy: row.handled_by,
    handlerName: row.handler?.name || row.handler?.email || null,
  };
}

/**
 * Giống supabaseDataRequest nhưng trả thêm tổng số dòng (Prefer: count=exact),
 * cần cho phân trang.
 */
export async function supabaseCountedRequest<T>(
  tablePath: string,
  accessToken: string,
) {
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${tablePath}`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
      Prefer: "count=exact",
    },
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Không thể đọc dữ liệu từ Supabase.");
  }

  // Content-Range: "0-9/42" hoặc "*/0"
  const range = response.headers.get("content-range") ?? "";
  const total = Number(range.split("/")[1]);

  return { data, total: Number.isFinite(total) ? total : 0 };
}

export function errorResponse(error: unknown, fallback: string, status = 500) {
  return NextResponse.json(
    { error: error instanceof Error && error.message ? error.message : fallback },
    { status },
  );
}
