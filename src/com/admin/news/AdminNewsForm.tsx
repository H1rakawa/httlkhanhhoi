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
  textareaClassName,
  Toggle,
} from "@/com/admin/ui/AdminUi";
import { fromVnInputValue, toVnInputValue } from "@/com/admin/ui/adminClient";
import {
  isAllowedNewsPhoto,
  NEWS_CATEGORIES,
  NEWS_IMAGE_KEYS,
  NEWS_STATUS_LABELS,
  slugify,
  type AdminNewsPost,
  type AdminNewsStatus,
} from "./adminNewsData";

export type NewsFormValues = {
  title: string;
  slug: string;
  category: AdminNewsPost["category"];
  authorName: string;
  excerpt: string;
  content: string[];
  imageKey: AdminNewsPost["imageKey"];
  photoUrl: string;
  mediaAssetId: string | null;
  featured: boolean;
  status: AdminNewsStatus;
  publishedAt: string | null;
};

/** Đoạn văn cách nhau bằng một dòng trống. */
function splitParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function AdminNewsForm({
  post,
  busy,
  onClose,
  onSubmit,
  onDelete,
}: {
  post: AdminNewsPost | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: NewsFormValues) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [category, setCategory] = useState(post?.category ?? NEWS_CATEGORIES[0]);
  const [authorName, setAuthorName] = useState(post?.authorName ?? "Ban Truyền Thông");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState((post?.content ?? []).join("\n\n"));
  const [imageKey, setImageKey] = useState(post?.imageKey ?? "church");
  const [photoUrl, setPhotoUrl] = useState(post?.photoUrl ?? "");
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(post?.mediaAssetId ?? null);
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [status, setStatus] = useState<AdminNewsStatus>(post?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(toVnInputValue(post?.publishedAt));
  const [error, setError] = useState("");

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const paragraphs = splitParagraphs(content);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !excerpt.trim()) return setError("Vui lòng nhập tiêu đề và tóm tắt.");
    if (photoUrl && !isAllowedNewsPhoto(photoUrl)) {
      return setError("Ảnh bìa cần được tải lên, hoặc lấy từ images.unsplash.com.");
    }
    if (status === "published" && !photoUrl) return setError("Bài đăng công khai cần có ảnh bìa.");
    setError("");
    onSubmit({
      title,
      slug: effectiveSlug,
      category,
      authorName,
      excerpt,
      content: paragraphs,
      imageKey,
      photoUrl: photoUrl.trim(),
      mediaAssetId: photoUrl.trim() ? mediaAssetId : null,
      featured,
      status,
      publishedAt: fromVnInputValue(publishedAt),
    });
  };

  return (
    <AdminDrawer
      wide
      title={post ? "Sửa bài viết" : "Viết bài mới"}
      subtitle={`Đường dẫn: /news/${effectiveSlug || "…"}`}
      onClose={onClose}
      footer={
        <>
          {post && onDelete && (
            <div className="mr-auto">
              <ConfirmDeleteButton busy={busy} onConfirm={onDelete} label="Xoá bài" />
            </div>
          )}
          <button type="button" onClick={onClose} className={secondaryButtonClassName}>
            Huỷ
          </button>
          <button type="submit" form="admin-news-form" disabled={busy} className={primaryButtonClassName}>
            {busy ? "Đang lưu…" : status === "published" ? "Lưu và đăng" : "Lưu"}
          </button>
        </>
      }
    >
      <form id="admin-news-form" onSubmit={submit} className="grid gap-5">
        {error && <p className="rounded-[12px] bg-[#fff1f0] px-4 py-3 text-sm font-bold text-[#b42318]">{error}</p>}

        <Field label="Tiêu đề" required>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className={inputClassName} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Đường dẫn" hint="Tự tạo từ tiêu đề, có thể sửa">
            <input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className={inputClassName}
            />
          </Field>
          <Field label="Chuyên mục" required>
            <select value={category} onChange={(e) => setCategory(e.target.value as AdminNewsPost["category"])} className={inputClassName}>
              {NEWS_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tác giả">
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={120} className={inputClassName} />
          </Field>
          <Field label="Trạng thái" required>
            <select value={status} onChange={(e) => setStatus(e.target.value as AdminNewsStatus)} className={inputClassName}>
              {(Object.keys(NEWS_STATUS_LABELS) as AdminNewsStatus[]).map((value) => (
                <option key={value} value={value}>
                  {NEWS_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ngày đăng" hint="Để trống: lấy thời điểm bấm đăng">
            <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputClassName} />
          </Field>
          <Field label="Hình minh hoạ dự phòng">
            <select value={imageKey} onChange={(e) => setImageKey(e.target.value as AdminNewsPost["imageKey"])} className={inputClassName}>
              {NEWS_IMAGE_KEYS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tóm tắt" required hint="Hiển thị trên thẻ tin tức">
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={600} className={`${textareaClassName} !min-h-20`} />
        </Field>

        <Field label="Nội dung" hint={`Cách các đoạn bằng một dòng trống · ${paragraphs.length} đoạn`}>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className={`${textareaClassName} !min-h-72`} />
        </Field>

        <ImageField
          label="Ảnh bìa"
          required={status === "published"}
          hint="Tải ảnh lên, hoặc dán link từ images.unsplash.com"
          url={photoUrl}
          relatedTable="news_posts"
          onChange={(url, assetId) => {
            setPhotoUrl(url);
            setMediaAssetId(assetId);
          }}
        />

        <Toggle checked={featured} onChange={setFeatured} label="Tin nổi bật" description="Hiển thị lớn ở đầu trang /news" />
      </form>
    </AdminDrawer>
  );
}
