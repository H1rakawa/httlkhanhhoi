import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin/contact";
import {
  createSignedUpload,
  MEDIA_RELATED_TABLES,
  registerUploadedMedia,
  type MediaRelatedTable,
} from "@/lib/admin/media";
import { badRequest, readJsonBody, requireStaffApi } from "@/lib/admin/staff";

/**
 * Upload file cho các trang quản trị, gồm 2 bước để không vướng giới hạn body của Vercel:
 *  - { action: "sign", fileName, mimeType, size } → đường dẫn có chữ ký để trình duyệt PUT file.
 *  - { action: "register", bucket, objectPath, fileName, relatedTable } → ghi media_assets.
 */
export async function POST(request: Request) {
  const staff = await requireStaffApi("Bạn không có quyền tải file lên.");
  if ("error" in staff) return staff.error;

  const body = await readJsonBody(request);
  if (!body) return badRequest("Dữ liệu không hợp lệ.");

  try {
    if (body.action === "sign") {
      const fileName = typeof body.fileName === "string" ? body.fileName : "";
      const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
      if (!fileName || !mimeType) return badRequest("Thiếu thông tin file.");
      const upload = await createSignedUpload({
        accessToken: staff.accessToken,
        userId: staff.userId,
        fileName,
        mimeType,
        size: Number(body.size),
      });
      return NextResponse.json(upload);
    }

    if (body.action === "register") {
      const relatedTable = MEDIA_RELATED_TABLES.includes(body.relatedTable as MediaRelatedTable)
        ? (body.relatedTable as MediaRelatedTable)
        : null;
      const asset = await registerUploadedMedia({
        accessToken: staff.accessToken,
        userId: staff.userId,
        bucket: String(body.bucket ?? ""),
        objectPath: String(body.objectPath ?? ""),
        fileName: String(body.fileName ?? "file"),
        relatedTable,
      });
      return NextResponse.json({ asset }, { status: 201 });
    }

    return badRequest("Thao tác không hợp lệ.");
  } catch (error) {
    return errorResponse(error, "Không thể tải file lên.", 400);
  }
}
