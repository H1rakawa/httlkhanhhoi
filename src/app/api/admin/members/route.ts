import { NextResponse } from "next/server";
import {
  getAccessToken,
  getCurrentAccount,
} from "@/lib/supabase/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";

const validRoles = new Set(["member", "teacher", "admin"]);
const validStatuses = new Set(["active", "inactive", "blocked"]);

type MemberPatchBody = {
  ids?: string[];
  role?: string;
  status?: string;
};

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
};

async function requireAdmin() {
  const account = await getCurrentAccount();
  const accessToken = await getAccessToken();

  if (!account || !accessToken) {
    return {
      error: NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 }),
    };
  }

  if (account.profile?.role !== "admin" || account.profile.status !== "active") {
    return {
      error: NextResponse.json(
        { error: "Bạn không có quyền quản lý thành viên." },
        { status: 403 },
      ),
    };
  }

  return { account, accessToken };
}

function sanitizeIds(ids?: string[]) {
  return Array.isArray(ids)
    ? ids.filter((id) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id,
        ),
      )
    : [];
}

async function supabaseProfilesRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
) {
  const { url, publishableKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || "Không thể xử lý dữ liệu thành viên.");
  }

  return { data, response };
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize") || "10"), 1),
      50,
    );
    const offset = (page - 1) * pageSize;
    const q = searchParams.get("q")?.trim();
    const role = searchParams.get("role")?.trim();
    const status = searchParams.get("status")?.trim();

    const query = new URLSearchParams({
      select: "id,name,email,phone,avatar_url,role,status,created_at,updated_at",
      order: "created_at.desc",
      limit: String(pageSize),
      offset: String(offset),
    });

    if (role && validRoles.has(role)) query.set("role", `eq.${role}`);
    if (status && validStatuses.has(status)) query.set("status", `eq.${status}`);
    if (q) query.set("or", `(name.ilike.*${q}*,email.ilike.*${q}*)`);

    const { data, response } = await supabaseProfilesRequest<ProfileRow[]>(
      `profiles?${query.toString()}`,
      admin.accessToken,
      {
        headers: {
          Prefer: "count=exact",
        },
      },
    );
    const contentRange = response.headers.get("content-range");
    const total = Number(contentRange?.split("/")?.[1] || data.length || 0);

    return NextResponse.json({
      members: data,
      page,
      pageSize,
      total,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách thành viên.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const body = (await request.json()) as MemberPatchBody;
    const ids = sanitizeIds(body.ids);
    const updates: { role?: string; status?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (!ids.length) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một thành viên." },
        { status: 400 },
      );
    }

    if (body.role) {
      if (!validRoles.has(body.role)) {
        return NextResponse.json(
          { error: "Vai trò không hợp lệ." },
          { status: 400 },
        );
      }
      updates.role = body.role;
    }

    if (body.status) {
      if (!validStatuses.has(body.status)) {
        return NextResponse.json(
          { error: "Trạng thái không hợp lệ." },
          { status: 400 },
        );
      }
      updates.status = body.status;
    }

    if (!updates.role && !updates.status) {
      return NextResponse.json(
        { error: "Chưa có thay đổi để cập nhật." },
        { status: 400 },
      );
    }

    if (
      ids.includes(admin.account.user.id) &&
      (updates.role === "member" ||
        updates.role === "teacher" ||
        updates.status === "inactive" ||
        updates.status === "blocked")
    ) {
      return NextResponse.json(
        { error: "Không thể tự hạ quyền hoặc khóa tài khoản quản trị hiện tại." },
        { status: 400 },
      );
    }

    const idFilter = ids.join(",");
    const { data } = await supabaseProfilesRequest<ProfileRow[]>(
      `profiles?id=in.(${idFilter})&select=id,name,email,phone,avatar_url,role,status,created_at,updated_at&order=created_at.desc`,
      admin.accessToken,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(updates),
      },
    );

    return NextResponse.json({ members: data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật thành viên.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const body = (await request.json()) as { ids?: string[] };
    const ids = sanitizeIds(body.ids);

    if (!ids.length) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một thành viên." },
        { status: 400 },
      );
    }

    if (ids.includes(admin.account.user.id)) {
      return NextResponse.json(
        { error: "Không thể xóa tài khoản quản trị hiện tại." },
        { status: 400 },
      );
    }

    const idFilter = ids.join(",");
    const { data } = await supabaseProfilesRequest<ProfileRow[]>(
      `profiles?id=in.(${idFilter})&select=id,name,email,phone,avatar_url,role,status,created_at,updated_at&order=created_at.desc`,
      admin.accessToken,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "inactive",
          updated_at: new Date().toISOString(),
        }),
      },
    );

    return NextResponse.json({ members: data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể xóa thành viên.",
      },
      { status: 500 },
    );
  }
}
