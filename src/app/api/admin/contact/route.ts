import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabaseDataRequest } from "@/lib/supabase/auth";
import {
  CONTACT_SELECT,
  errorResponse,
  mapContactMessage,
  requireStaff,
  supabaseCountedRequest,
  type ContactMessageRow,
} from "@/lib/admin/contact";
import {
  emptyContactCounts,
  isContactStatus,
  type ContactListResponse,
} from "@/com/admin/contact/adminContactData";

/** Bỏ các ký tự có nghĩa đặc biệt trong cú pháp or=(...) của PostgREST. */
function sanitizeSearch(value: string) {
  return value.replace(/[(),*%\\:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

export async function GET(request: NextRequest) {
  const staff = await requireStaff();
  if ("error" in staff) return staff.error;

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize")) || 10, 1), 50);
  const status = searchParams.get("status");
  const q = sanitizeSearch(searchParams.get("q") ?? "");
  const offset = (page - 1) * pageSize;

  const params = new URLSearchParams({
    select: CONTACT_SELECT,
    order: "created_at.desc,id.desc",
    offset: String(offset),
    limit: String(pageSize),
  });
  if (isContactStatus(status)) params.set("status", `eq.${status}`);
  if (q) {
    const pattern = `*${q}*`;
    params.set(
      "or",
      `(name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},message.ilike.${pattern})`,
    );
  }

  try {
    const [list, statusRows] = await Promise.all([
      supabaseCountedRequest<ContactMessageRow[]>(
        `contact_messages?${params.toString()}`,
        staff.accessToken,
      ),
      supabaseDataRequest<Array<{ status: string }>>(
        "contact_messages?select=status",
        staff.accessToken,
      ),
    ]);

    const counts = emptyContactCounts();
    for (const row of statusRows) {
      if (isContactStatus(row.status)) counts[row.status] += 1;
      counts.all += 1;
    }

    const body: ContactListResponse = {
      messages: list.data.map(mapContactMessage),
      counts,
      page,
      pageSize,
      total: list.total,
    };
    return NextResponse.json(body);
  } catch (error) {
    return errorResponse(error, "Không thể tải hộp thư liên hệ.");
  }
}
