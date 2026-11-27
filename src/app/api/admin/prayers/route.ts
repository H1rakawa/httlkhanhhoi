import { NextResponse } from "next/server";
import { errorResponse, isStaffProfile } from "@/lib/admin/contact";
import {
  deleteAdminPrayers,
  getAdminPrayers,
  logAdminActivity,
  updateAdminPrayers,
} from "@/lib/admin/prayers";
import { getAccessToken, getCurrentAccount, supabaseDataRequest } from "@/lib/supabase/auth";
import {
  ADMIN_PRAYER_STATUS_LABELS,
  isAdminPrayerStatus,
  type AdminPrayerItem,
} from "@/com/admin/pray/adminPrayerData";

async function requirePrayerStaff() {
  const account = await getCurrentAccount();
  const accessToken = await getAccessToken();
  if (!account || !accessToken) {
    return { error: NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 }) };
  }
  if (!isStaffProfile(account.profile)) {
    return {
      error: NextResponse.json(
        { error: "Bạn không có quyền quản lý lời cầu thay." },
        { status: 403 },
      ),
    };
  }
  return { account, accessToken };
}

function parseIds(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 200) return null;
  const ids = value.map(Number);
  return ids.every((id) => Number.isInteger(id) && id > 0) ? [...new Set(ids)] : null;
}

const NOTIFY_TEXT: Partial<Record<AdminPrayerItem["status"], (title: string) => string>> = {
  approved: (title) => `Lời cầu thay "${title}" đã được duyệt và hiển thị cho cộng đồng.`,
  answered: (title) => `Lời cầu thay "${title}" đã được đánh dấu là Chúa đã nhậm lời.`,
  rejected: (title) =>
    `Lời cầu thay "${title}" chưa được duyệt hiển thị. Ban mục vụ vẫn cầu thay cho bạn.`,
};

export async function GET() {
  const staff = await requirePrayerStaff();
  if ("error" in staff) return staff.error;

  try {
    return NextResponse.json({ prayers: await getAdminPrayers(staff.accessToken) });
  } catch (error) {
    return errorResponse(error, "Không thể tải danh sách lời cầu thay.");
  }
}

/** Đổi trạng thái một hoặc nhiều lời cầu thay: { ids, status }. */
export async function PATCH(request: Request) {
  const staff = await requirePrayerStaff();
  if ("error" in staff) return staff.error;

  const body = (await request.json().catch(() => null)) as {
    ids?: unknown;
    status?: unknown;
  } | null;
  const ids = parseIds(body?.ids);
  const status = body?.status;
  if (!ids) return NextResponse.json({ error: "Danh sách lời cầu thay không hợp lệ." }, { status: 400 });
  if (!isAdminPrayerStatus(status)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
  }

  try {
    const prayers = await updateAdminPrayers(ids, status, staff.accessToken);
    const userId = staff.account.user.id;
    const notify = NOTIFY_TEXT[status];
    const notifications = notify
      ? prayers
          .filter((prayer) => prayer.userId !== userId)
          .map((prayer) => ({
            user_id: prayer.userId,
            type: "prayer",
            title: ADMIN_PRAYER_STATUS_LABELS[status],
            content: notify(prayer.title),
            link: `/pray?prayer=${prayer.id}`,
          }))
      : [];

    await Promise.all([
      notifications.length
        ? supabaseDataRequest("notifications", staff.accessToken, {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify(notifications),
          }).catch(() => undefined)
        : undefined,
      logAdminActivity(
        staff.accessToken,
        userId,
        prayers.map((prayer) => ({
          action: status === "approved" ? "approve" : status === "rejected" ? "reject" : "update",
          targetTable: "prayer_requests",
          targetId: String(prayer.id),
          metadata: { status, title: prayer.title },
        })),
      ),
    ]);

    return NextResponse.json({ prayers });
  } catch (error) {
    return errorResponse(error, "Không thể cập nhật lời cầu thay.");
  }
}

/** Xoá một hoặc nhiều lời cầu thay: { ids }. */
export async function DELETE(request: Request) {
  const staff = await requirePrayerStaff();
  if ("error" in staff) return staff.error;

  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = parseIds(body?.ids);
  if (!ids) return NextResponse.json({ error: "Danh sách lời cầu thay không hợp lệ." }, { status: 400 });

  try {
    const deleted = await deleteAdminPrayers(ids, staff.accessToken);
    await logAdminActivity(
      staff.accessToken,
      staff.account.user.id,
      deleted.map((id) => ({ action: "delete", targetTable: "prayer_requests", targetId: String(id) })),
    );
    return NextResponse.json({ deleted });
  } catch (error) {
    return errorResponse(error, "Không thể xoá lời cầu thay.");
  }
}
