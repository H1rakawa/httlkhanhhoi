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
  EVENT_CATEGORIES,
  EVENT_STATUS_LABELS,
  EVENT_STATUSES,
  EVENT_TYPE_LABELS,
  type AdminEvent,
  type AdminEventType,
} from "./adminEventData";

export type EventFormValues = {
  title: string;
  description: string;
  location: string;
  startsAt: string | null;
  endsAt: string | null;
  type: AdminEventType;
  category: AdminEvent["category"];
  capacity: number | null;
  imageUrl: string | null;
  mediaAssetId: string | null;
  status: AdminEvent["status"];
  schedule: string[];
  registrationOpen: boolean;
  featured: boolean;
};

export default function AdminEventForm({
  event,
  defaultType,
  busy,
  onClose,
  onSubmit,
  onDelete,
}: {
  event: AdminEvent | null;
  defaultType: AdminEventType;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "HTTL. Khánh Hội");
  const [startsAt, setStartsAt] = useState(toVnInputValue(event?.startsAt));
  const [endsAt, setEndsAt] = useState(toVnInputValue(event?.endsAt));
  const [type, setType] = useState<AdminEventType>(event?.type ?? defaultType);
  const [category, setCategory] = useState(event?.category ?? EVENT_CATEGORIES[0]);
  const [capacity, setCapacity] = useState(event?.capacity ? String(event.capacity) : "");
  const [imageUrl, setImageUrl] = useState(event?.imageUrl ?? "");
  const [mediaAssetId, setMediaAssetId] = useState<string | null>(event?.mediaAssetId ?? null);
  const [status, setStatus] = useState(event?.status ?? "upcoming");
  const [schedule, setSchedule] = useState((event?.schedule ?? []).join("\n"));
  const [registrationOpen, setRegistrationOpen] = useState(event?.registrationOpen ?? false);
  const [featured, setFeatured] = useState(event?.featured ?? false);
  const [error, setError] = useState("");

  const submit = (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (!title.trim() || !location.trim() || !startsAt) {
      setError("Vui lòng nhập tên, địa điểm và thời gian bắt đầu.");
      return;
    }
    if (endsAt && endsAt <= startsAt) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }
    setError("");
    onSubmit({
      title,
      description,
      location,
      startsAt: fromVnInputValue(startsAt),
      endsAt: fromVnInputValue(endsAt),
      type,
      category,
      capacity: capacity ? Number(capacity) : null,
      imageUrl: imageUrl.trim() || null,
      mediaAssetId: imageUrl.trim() ? mediaAssetId : null,
      status,
      schedule: schedule.split("\n").map((line) => line.trim()).filter(Boolean),
      registrationOpen,
      featured,
    });
  };

  return (
    <AdminDrawer
      title={event ? "Sửa sự kiện" : "Tạo sự kiện"}
      subtitle={event ? `Mã sự kiện #${event.id}` : "Sự kiện sẽ hiển thị ở /calendar hoặc /preachout"}
      onClose={onClose}
      footer={
        <>
          {event && onDelete && (
            <div className="mr-auto">
              <ConfirmDeleteButton busy={busy} onConfirm={onDelete} label="Xoá sự kiện" />
            </div>
          )}
          <button type="button" onClick={onClose} className={secondaryButtonClassName}>
            Huỷ
          </button>
          <button type="submit" form="admin-event-form" disabled={busy} className={primaryButtonClassName}>
            {busy ? "Đang lưu…" : event ? "Lưu thay đổi" : "Tạo sự kiện"}
          </button>
        </>
      }
    >
      <form id="admin-event-form" onSubmit={submit} className="grid gap-5">
        {error && (
          <p className="rounded-[12px] bg-[#fff1f0] px-4 py-3 text-sm font-bold text-[#b42318]">{error}</p>
        )}
        <Field label="Tên sự kiện" required>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} className={inputClassName} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Loại" required hint="Truyền giảng hiển thị ở /preachout">
            <select value={type} onChange={(e) => setType(e.target.value as AdminEventType)} className={inputClassName}>
              {(Object.keys(EVENT_TYPE_LABELS) as AdminEventType[]).map((value) => (
                <option key={value} value={value}>
                  {EVENT_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Chuyên mục" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AdminEvent["category"])}
              className={inputClassName}
            >
              {EVENT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Bắt đầu" required hint="Giờ Việt Nam">
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClassName} />
          </Field>
          <Field label="Kết thúc">
            <input type="datetime-local" value={endsAt} min={startsAt || undefined} onChange={(e) => setEndsAt(e.target.value)} className={inputClassName} />
          </Field>
          <Field label="Địa điểm" required>
            <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} className={inputClassName} />
          </Field>
          <Field label="Sức chứa" hint="Để trống nếu không giới hạn">
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Trạng thái" required>
            <select value={status} onChange={(e) => setStatus(e.target.value as AdminEvent["status"])} className={inputClassName}>
              {EVENT_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {EVENT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            checked={registrationOpen}
            onChange={setRegistrationOpen}
            label="Mở đăng ký"
            description="Thành viên và khách đăng ký được trên web"
          />
          <Toggle checked={featured} onChange={setFeatured} label="Sự kiện nổi bật" description="Ưu tiên hiển thị đầu trang" />
        </div>

        <Field label="Mô tả">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} className={textareaClassName} />
        </Field>

        <Field label="Lịch trình" hint="Mỗi dòng một mục, ví dụ: 08:00 Đón tiếp">
          <textarea value={schedule} onChange={(e) => setSchedule(e.target.value)} className={textareaClassName} />
        </Field>

        <ImageField
          label="Ảnh sự kiện"
          url={imageUrl}
          relatedTable="events"
          onChange={(url, assetId) => {
            setImageUrl(url);
            setMediaAssetId(assetId);
          }}
        />
      </form>
    </AdminDrawer>
  );
}
