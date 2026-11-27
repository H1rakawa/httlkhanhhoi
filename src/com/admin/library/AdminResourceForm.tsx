"use client";

import { useState } from "react";
import {
  AdminDrawer,
  ConfirmDeleteButton,
  Field,
  ImageField,
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  smallButtonClassName,
  textareaClassName,
  Toggle,
  UploadButton,
} from "@/com/admin/ui/AdminUi";
import { formatFileSize } from "@/com/admin/ui/adminClient";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_TYPES,
  resourceTypeFromMime,
  type AdminResource,
} from "./adminLibraryData";

export type ResourceFormValues = {
  title: string;
  description: string;
  type: AdminResource["type"];
  category: string | null;
  url: string;
  mediaAssetId: string | null;
  thumbnailUrl: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  isPublished: boolean;
};

const ACCEPT = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4,video/webm,video/quicktime",
  "audio/mpeg,audio/mp4,audio/wav,audio/webm,audio/ogg",
  "image/jpeg,image/png,image/webp",
].join(",");

export default function AdminResourceForm({
  resource,
  defaultCategory,
  busy,
  onClose,
  onSubmit,
  onDelete,
}: {
  resource: AdminResource | null;
  defaultCategory: string | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: ResourceFormValues) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(resource?.title ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [type, setType] = useState<AdminResource["type"]>(resource?.type ?? "PDF");
  const [category, setCategory] = useState(resource?.category ?? defaultCategory ?? "");
  const [url, setUrl] = useState(resource?.url ?? "");
  const [file, setFile] = useState<{
    mediaAssetId: string | null;
    mimeType: string | null;
    sizeBytes: number | null;
    fileName: string | null;
  }>({
    mediaAssetId: resource?.mediaAssetId ?? null,
    mimeType: resource?.mimeType ?? null,
    sizeBytes: resource?.sizeBytes ?? null,
    fileName: resource?.mediaAssetId ? resource.url.split("/").pop() ?? null : null,
  });
  const [thumbnailUrl, setThumbnailUrl] = useState(resource?.thumbnailUrl ?? "");
  const [isPublished, setIsPublished] = useState(resource?.isPublished ?? true);
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return setError("Vui lòng nhập tên tài liệu.");
    if (!url.trim()) return setError("Vui lòng tải file lên hoặc dán đường dẫn (Google Drive, YouTube…).");
    setError("");
    onSubmit({
      title,
      description,
      type,
      category: category.trim() || null,
      url: url.trim(),
      mediaAssetId: file.mediaAssetId,
      thumbnailUrl: thumbnailUrl.trim() || null,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      isPublished,
    });
  };

  return (
    <AdminDrawer
      title={resource ? "Sửa tài liệu" : "Thêm tài liệu"}
      subtitle={resource ? `Mã tài liệu #${resource.id}` : "Tài liệu đã xuất bản hiển thị ở /library"}
      onClose={onClose}
      footer={
        <>
          {resource && onDelete && (
            <div className="mr-auto">
              <ConfirmDeleteButton busy={busy} onConfirm={onDelete} label="Xoá tài liệu" />
            </div>
          )}
          <button type="button" onClick={onClose} className={secondaryButtonClassName}>
            Huỷ
          </button>
          <button type="submit" form="admin-resource-form" disabled={busy} className={primaryButtonClassName}>
            {busy ? "Đang lưu…" : resource ? "Lưu thay đổi" : "Thêm tài liệu"}
          </button>
        </>
      }
    >
      <form id="admin-resource-form" onSubmit={submit} className="grid gap-5">
        {error && <p className="rounded-[12px] bg-[#fff1f0] px-4 py-3 text-sm font-bold text-[#b42318]">{error}</p>}

        <div className="grid gap-3 rounded-[16px] border border-dashed border-[#b9c6d8] bg-white p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#667085]">
            File tài liệu <span className="text-[#d92d20]">*</span>
          </p>
          {file.mediaAssetId ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#f3f8ff] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#182230]">{file.fileName ?? "File đã tải lên"}</p>
                <p className="text-xs font-bold text-[#667085]">
                  {file.mimeType ?? "—"} · {formatFileSize(file.sizeBytes)}
                </p>
              </div>
              <button
                type="button"
                className={smallButtonClassName}
                onClick={() => {
                  setFile({ mediaAssetId: null, mimeType: null, sizeBytes: null, fileName: null });
                  setUrl("");
                }}
              >
                Bỏ file
              </button>
            </div>
          ) : (
            <Field label="Hoặc dán đường dẫn" hint="Google Drive, YouTube, trang web…">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" className={inputClassName} />
            </Field>
          )}
          <UploadButton
            accept={ACCEPT}
            relatedTable="resources"
            label={file.mediaAssetId ? "Thay file khác" : "Tải file lên (PDF, Word, video, âm thanh)"}
            onUploaded={(asset) => {
              setFile({
                mediaAssetId: asset.id,
                mimeType: asset.mimeType,
                sizeBytes: asset.sizeBytes,
                fileName: asset.fileName,
              });
              setUrl(asset.publicUrl);
              setType(resourceTypeFromMime(asset.mimeType));
              if (!title.trim()) setTitle(asset.fileName.replace(/^[0-9a-f-]{36}-/, "").replace(/\.[^.]+$/, ""));
              if (asset.kind === "image" && !thumbnailUrl) setThumbnailUrl(asset.publicUrl);
            }}
          />
          <p className="text-xs font-semibold text-[#8a94a6]">
            Tối đa: PDF / Word 50MB · âm thanh 100MB · video 500MB. Bài giảng dài nên đăng YouTube rồi dán link.
          </p>
        </div>

        <Field label="Tên tài liệu" required>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className={inputClassName} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Loại" required>
            <select value={type} onChange={(e) => setType(e.target.value as AdminResource["type"])} className={inputClassName}>
              {RESOURCE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Danh mục" hint="“Truyền giảng” hiển thị thêm ở /preachout">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClassName}>
              <option value="">Chưa phân loại</option>
              {RESOURCE_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
              {category && !RESOURCE_CATEGORIES.some((item) => item.value === category) && (
                <option value={category}>{category}</option>
              )}
            </select>
          </Field>
        </div>

        <Field label="Mô tả">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={3000} className={textareaClassName} />
        </Field>

        <ImageField
          label="Ảnh bìa"
          hint="Không bắt buộc. Hiển thị trên thẻ tài liệu."
          url={thumbnailUrl}
          relatedTable="resources"
          onChange={(value) => setThumbnailUrl(value)}
        />

        <Toggle
          checked={isPublished}
          onChange={setIsPublished}
          label="Xuất bản"
          description="Tắt để lưu nháp, chỉ ban mục vụ thấy"
        />
      </form>
    </AdminDrawer>
  );
}
