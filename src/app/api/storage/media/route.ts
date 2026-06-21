import { NextResponse } from "next/server";
import {
  getAccessToken,
  getCurrentUser,
  supabaseDataRequest,
} from "@/lib/supabase/auth";
import {
  mediaBucketFromMime,
  publicStorageUrl,
  sanitizeFileName,
  uploadToStorage,
} from "@/lib/supabase/storage";

type MediaAsset = {
  id: string;
  bucket_id: string;
  object_path: string;
  public_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  media_kind: string;
  visibility: "public" | "private";
  related_table: string | null;
  related_id: string | null;
  created_at: string;
};

const allowedRelatedTables = new Set(["resources", "assignments", "profiles", "events"]);

function resourceTypeFromUpload(kind: string, requestedType: FormDataEntryValue | null) {
  const explicitType = String(requestedType || "").trim();
  if (explicitType) return explicitType;
  if (kind === "video") return "Video";
  if (kind === "audio") return "Âm thanh";
  if (kind === "document") return "PDF";
  return "Sách";
}

function relationFilter(url: URL) {
  const relatedTable = url.searchParams.get("related_table");
  const relatedId = url.searchParams.get("related_id");

  if (!relatedTable || !relatedId || !allowedRelatedTables.has(relatedTable)) {
    return "";
  }

  return `&related_table=eq.${encodeURIComponent(relatedTable)}&related_id=eq.${encodeURIComponent(relatedId)}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const kindFilter = kind ? `&media_kind=eq.${encodeURIComponent(kind)}` : "";

  try {
    const assets = await supabaseDataRequest<MediaAsset[]>(
      `media_assets?select=id,bucket_id,object_path,public_url,file_name,mime_type,size_bytes,media_kind,visibility,related_table,related_id,created_at${kindFilter}${relationFilter(url)}&order=created_at.desc`,
    );
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể tải danh sách media.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();

  if (!user || !accessToken) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Thiếu file cần tải lên." }, { status: 400 });
    }

    const relatedTable = String(formData.get("related_table") || "");
    const relatedId = String(formData.get("related_id") || "");
    const visibility = formData.get("visibility") === "private" ? "private" : "public";
    const title = String(formData.get("title") || "").trim();

    if (relatedTable && !allowedRelatedTables.has(relatedTable)) {
      return NextResponse.json({ error: "Loại liên kết media không hợp lệ." }, { status: 400 });
    }

    const { bucket, kind } = mediaBucketFromMime(file.type || "application/octet-stream");
    const resourceType = resourceTypeFromUpload(kind, formData.get("type"));
    const safeName = sanitizeFileName(file.name);
    const objectPath = `${user.id}/${kind}/${crypto.randomUUID()}-${safeName}`;

    await uploadToStorage({
      accessToken,
      bucket,
      objectPath,
      file,
    });

    const publicUrl = publicStorageUrl(bucket, objectPath);
    const [asset] = await supabaseDataRequest<MediaAsset[]>(
      "media_assets",
      accessToken,
      {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          bucket_id: bucket,
          object_path: objectPath,
          public_url: publicUrl,
          file_name: safeName,
          mime_type: file.type || "application/octet-stream",
          size_bytes: file.size,
          media_kind: kind,
          visibility,
          related_table: relatedTable || null,
          related_id: relatedId || null,
          uploaded_by: user.id,
        }),
      },
    );

    if (relatedTable === "resources" && relatedId) {
      await supabaseDataRequest(
        `resources?id=eq.${encodeURIComponent(relatedId)}`,
        accessToken,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            media_asset_id: asset.id,
            url: publicUrl,
            thumbnail_url: kind === "image" ? publicUrl : null,
            mime_type: file.type || "application/octet-stream",
            size_bytes: file.size,
            type: resourceType,
            ...(title ? { title } : {}),
          }),
        },
      );
    }

    if (relatedTable === "assignments" && relatedId) {
      await supabaseDataRequest(
        `assignments?id=eq.${encodeURIComponent(relatedId)}`,
        accessToken,
        {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            media_asset_id: asset.id,
            attachment_url: publicUrl,
          }),
        },
      );
    }

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Không thể tải file lên.",
      },
      { status: 500 },
    );
  }
}
