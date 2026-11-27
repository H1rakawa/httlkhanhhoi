import { NextResponse } from "next/server";
import {
  getAccessToken,
  getCurrentUser,
  supabaseDataRequest,
} from "@/lib/supabase/auth";
import { publicStorageUrl, sanitizeFileName, uploadToStorage } from "@/lib/supabase/storage";

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const PHONE_PATTERN = /^\+?[0-9 .()-]{8,20}$/;

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
};

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function requireSession() {
  const [user, accessToken] = await Promise.all([getCurrentUser(), getAccessToken()]);
  return user && accessToken ? { user, accessToken } : null;
}

async function patchProfile(userId: string, accessToken: string, values: Partial<ProfileRow>) {
  const rows = await supabaseDataRequest<ProfileRow[]>(
    `profiles?id=eq.${userId}&select=id,name,email,phone,avatar_url`,
    accessToken,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(values),
    },
  );
  if (!rows[0]) throw new Error("Không tìm thấy hồ sơ của bạn.");
  return rows[0];
}

/** Cập nhật họ tên và số điện thoại. */
export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return fail("Bạn cần đăng nhập để cập nhật hồ sơ.", 401);

  const body = (await request.json().catch(() => ({}))) as {
    name?: unknown;
    phone?: unknown;
  };
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (name.length < 2 || name.length > 80) {
    return fail("Họ tên cần có từ 2 đến 80 ký tự.");
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    return fail("Số điện thoại chưa đúng định dạng.");
  }

  try {
    const profile = await patchProfile(session.user.id, session.accessToken, {
      name,
      phone: phone || null,
    });
    return NextResponse.json({ profile, message: "Đã lưu thông tin hồ sơ." });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Không thể lưu hồ sơ.", 500);
  }
}

/** Tải ảnh đại diện mới lên Storage rồi gắn vào hồ sơ. */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return fail("Bạn cần đăng nhập để đổi ảnh đại diện.", 401);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) return fail("Vui lòng chọn một ảnh.");
  if (!AVATAR_TYPES.includes(file.type)) {
    return fail("Ảnh đại diện cần là JPG, PNG, WEBP hoặc GIF.");
  }
  if (file.size > AVATAR_MAX_BYTES) return fail("Ảnh đại diện tối đa 5 MB.");

  const { user, accessToken } = session;
  const bucket = "church-images";
  const objectPath = `${user.id}/avatar/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

  try {
    await uploadToStorage({ accessToken, bucket, objectPath, file });
    const publicUrl = publicStorageUrl(bucket, objectPath);

    await supabaseDataRequest("media_assets", accessToken, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        bucket_id: bucket,
        object_path: objectPath,
        public_url: publicUrl,
        file_name: sanitizeFileName(file.name),
        mime_type: file.type,
        size_bytes: file.size,
        media_kind: "image",
        visibility: "public",
        related_table: "profiles",
        related_id: user.id,
        uploaded_by: user.id,
      }),
    }).catch(() => undefined);

    const profile = await patchProfile(user.id, accessToken, { avatar_url: publicUrl });
    return NextResponse.json({ profile, message: "Đã cập nhật ảnh đại diện." });
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Không thể tải ảnh đại diện lên.",
      500,
    );
  }
}
