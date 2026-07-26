import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAccessToken, getCurrentAccount } from "@/lib/supabase/auth";
import {
  getSupabaseConfig,
  getSupabaseUrl,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/config";

const validRoles = new Set(["member", "teacher", "admin"]);
const profileSelectColumns =
  "id,name,email,phone,avatar_url,role,created_at,updated_at";

type MemberPatchBody = {
  ids?: string[];
  role?: string;
};

type CreateMemberPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  team?: string;
  ministry?: string;
  isWorker?: boolean;
};

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
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

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function getRedirectUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const origin =
    request.headers.get("origin") || new URL(request.url).origin.replace(/\/$/, "");

  return `${configuredUrl || origin}/auth/create-password`;
}

function createSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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

    const query = new URLSearchParams({
      select: profileSelectColumns,
      order: "created_at.desc",
      limit: String(pageSize),
      offset: String(offset),
    });

    if (role && validRoles.has(role)) query.set("role", `eq.${role}`);
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

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const payload = (await request.json().catch(() => null)) as
      | CreateMemberPayload
      | null;

    const name = normalizeText(payload?.name);
    const email = normalizeEmail(payload?.email);
    const phone = normalizeText(payload?.phone);
    const role = validRoles.has(payload?.role || "") ? payload?.role || "member" : "";
    const ministry = normalizeText(payload?.ministry || payload?.team);
    const isWorker = Boolean(payload?.isWorker);

    if (!name) {
      return NextResponse.json({ error: "Vui lòng nhập họ và tên." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email chưa đúng định dạng." },
        { status: 400 },
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: "Vai trò không hợp lệ." },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name: name,
          name,
          phone,
          role,
          team: ministry,
          ministry,
          is_worker: isWorker,
        },
        redirectTo: getRedirectUrl(request),
      },
    );

    if (error) {
      return NextResponse.json(
        { error: error.message || "Không thể gửi email mời thành viên." },
        { status: 400 },
      );
    }

    const invitedUser = data.user;

    if (!invitedUser?.id) {
      return NextResponse.json(
        { error: "Supabase chưa trả về thông tin người dùng vừa tạo." },
        { status: 502 },
      );
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: invitedUser.id,
        name,
        email,
        phone: phone || null,
        role,
        status: "active",
        avatar_url: null,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      return NextResponse.json(
        {
          error:
            profileError.message ||
            "Đã gửi email mời nhưng chưa thể cập nhật hồ sơ thành viên.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Đã tạo thành viên và gửi email tạo mật khẩu.",
      member: {
        id: invitedUser.id,
        name,
        email,
        phone,
        role,
        team: ministry,
        ministry,
        isWorker,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể tạo thành viên mới.",
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
    const updates: { role?: string; updated_at: string } = {
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

    if (!updates.role) {
      return NextResponse.json(
        { error: "Chưa có thay đổi để cập nhật." },
        { status: 400 },
      );
    }

    if (
      ids.includes(admin.account.user.id) &&
      (updates.role === "member" || updates.role === "teacher")
    ) {
      return NextResponse.json(
        { error: "Không thể tự hạ quyền tài khoản quản trị hiện tại." },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .in("id", ids)
      .select(profileSelectColumns)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Không thể cập nhật thành viên." },
        { status: 400 },
      );
    }

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

    const supabaseAdmin = createSupabaseAdminClient();
    const deleteErrors: string[] = [];

    for (const id of ids) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (error) {
        deleteErrors.push(error.message || `Không thể xóa thành viên ${id}.`);
      }
    }

    if (deleteErrors.length) {
      return NextResponse.json(
        {
          error:
            deleteErrors[0] ||
            "Không thể xóa thành viên. Có thể tài khoản đang được liên kết với dữ liệu khác.",
        },
        { status: 400 },
      );
    }

    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .in("id", ids);

    if (profileDeleteError) {
      return NextResponse.json(
        {
          error:
            profileDeleteError.message ||
            "Đã xóa tài khoản Auth nhưng chưa thể xóa hồ sơ thành viên.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ deletedIds: ids });
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
