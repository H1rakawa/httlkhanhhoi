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
} from "@/com/admin/ui/AdminUi";
import { formatVnDate } from "@/com/admin/ui/adminClient";
import {
  TESTIMONY_STATUS_LABELS,
  type AdminTestimony,
  type AdminTestimonyStatus,
} from "./adminTestimonyData";

export type TestimonyFormValues = {
  name: string;
  role: string;
  quote: string;
  imageUrl: string | null;
  eventId: number | null;
  status: AdminTestimonyStatus;
};

export default function AdminTestimonyForm({
  testimony,
  events,
  busy,
  onClose,
  onSubmit,
  onDelete,
}: {
  testimony: AdminTestimony | null;
  events: Array<{ id: number; title: string; startsAt: string }>;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: TestimonyFormValues) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(testimony?.name ?? "");
  const [role, setRole] = useState(testimony?.role ?? "");
  const [quote, setQuote] = useState(testimony?.quote ?? "");
  const [imageUrl, setImageUrl] = useState(testimony?.imageUrl ?? "");
  const [eventId, setEventId] = useState(testimony?.eventId ? String(testimony.eventId) : "");
  const [status, setStatus] = useState<AdminTestimonyStatus>(testimony?.status ?? "approved");
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !quote.trim()) return setError("Vui lòng nhập tên và lời làm chứng.");
    setError("");
    onSubmit({
      name,
      role,
      quote,
      imageUrl: imageUrl.trim() || null,
      eventId: eventId ? Number(eventId) : null,
      status,
    });
  };

  return (
    <AdminDrawer
      title={testimony ? "Lời làm chứng" : "Thêm lời làm chứng"}
      subtitle={
        testimony
          ? `Gửi ngày ${formatVnDate(testimony.createdAt)}${testimony.submitterName ? ` · bởi ${testimony.submitterName}` : ""}`
          : "Ghi lại lời làm chứng sau buổi truyền giảng"
      }
      onClose={onClose}
      footer={
        <>
          {testimony && onDelete && (
            <div className="mr-auto">
              <ConfirmDeleteButton busy={busy} onConfirm={onDelete} />
            </div>
          )}
          <button type="button" onClick={onClose} className={secondaryButtonClassName}>
            Huỷ
          </button>
          <button type="submit" form="admin-testimony-form" disabled={busy} className={primaryButtonClassName}>
            {busy ? "Đang lưu…" : "Lưu"}
          </button>
        </>
      }
    >
      <form id="admin-testimony-form" onSubmit={submit} className="grid gap-5">
        {error && <p className="rounded-[12px] bg-[#fff1f0] px-4 py-3 text-sm font-bold text-[#b42318]">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên người làm chứng" required>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={inputClassName} />
          </Field>
          <Field label="Vai trò" hint="Vd: Tín hữu mới, Tình nguyện viên">
            <input value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} className={inputClassName} />
          </Field>
          <Field label="Sự kiện liên quan">
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClassName}>
              <option value="">Không gắn sự kiện</option>
              {events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({formatVnDate(item.startsAt)})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Trạng thái" required hint="Chỉ “Đã duyệt” mới hiển thị ở /preachout">
            <select value={status} onChange={(e) => setStatus(e.target.value as AdminTestimonyStatus)} className={inputClassName}>
              {(Object.keys(TESTIMONY_STATUS_LABELS) as AdminTestimonyStatus[]).map((value) => (
                <option key={value} value={value}>
                  {TESTIMONY_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Lời làm chứng" required>
          <textarea value={quote} onChange={(e) => setQuote(e.target.value)} maxLength={3000} className={`${textareaClassName} !min-h-48`} />
        </Field>
        <ImageField
          label="Ảnh"
          hint="Không bắt buộc"
          url={imageUrl}
          relatedTable="testimonies"
          onChange={(url) => setImageUrl(url)}
        />
      </form>
    </AdminDrawer>
  );
}
