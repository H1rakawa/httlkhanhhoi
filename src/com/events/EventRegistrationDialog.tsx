"use client";

import { FormEvent, useState } from "react";
import type { ChurchEvent, EventViewer } from "@/lib/events/types";
import { formatEventDateTime, remainingSeats } from "@/lib/events/types";

type EventRegistrationDialogProps = {
  event: ChurchEvent | null;
  viewer: EventViewer;
  onClose: () => void;
  onRegistered: (event: ChurchEvent, attendees: number) => void;
};

const inputClassName =
  "h-11 w-full rounded-[12px] border border-[#d6d6d8] bg-white/90 px-4 text-sm outline-none focus:border-[#0066cc]";

export default function EventRegistrationDialog(props: EventRegistrationDialogProps) {
  if (!props.event) return null;
  // key: reset form state khi đổi sự kiện.
  return <RegistrationForm key={props.event.id} {...props} event={props.event} />;
}

function RegistrationForm({
  event,
  viewer,
  onClose,
  onRegistered,
}: EventRegistrationDialogProps & { event: ChurchEvent }) {
  const [fullName, setFullName] = useState(viewer.name ?? "");
  const [phone, setPhone] = useState(viewer.phone ?? "");
  const [email, setEmail] = useState(viewer.email ?? "");
  const [attendees, setAttendees] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const seatsLeft = remainingSeats(event);
  const maxAttendees = Math.max(Math.min(seatsLeft ?? 20, 20), 1);

  const submit = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setError("");

    if (!viewer.loggedIn && !fullName.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }
    if (!viewer.loggedIn && !phone.trim() && !email.trim()) {
      setError("Vui lòng để lại số điện thoại hoặc email để ban tổ chức liên hệ.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/events/${event.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email, attendees, note }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error || "Không thể đăng ký. Vui lòng thử lại.");
        return;
      }

      setDone(true);
      onRegistered(event, attendees);
    } catch {
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-5 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-registration-title"
    >
      <div className="liquid-glass max-h-[92vh] w-full max-w-lg overflow-auto p-6 text-[#1d1d1f] md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase text-[#0066cc]">Đăng ký tham gia</p>
            <h2 id="event-registration-title" className="mt-2 text-2xl font-semibold">
              {event.title}
            </h2>
            <p className="mt-2 text-sm text-[#6e6e73]">
              {formatEventDateTime(event.startsAt, {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {event.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-xl"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        {done ? (
          <div className="mt-6 rounded-[16px] bg-[#e9f8ef] p-5 text-sm leading-7 text-[#176b3a]">
            Đăng ký thành công! Ban tổ chức sẽ liên hệ với bạn nếu có thông tin cần
            cập nhật.
            <button
              type="button"
              onClick={onClose}
              className="mt-4 block h-10 rounded-full bg-[#0066cc] px-6 font-semibold text-white"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4">
            {!viewer.loggedIn && (
              <p className="rounded-[12px] bg-[#f0f6ff] px-4 py-3 text-xs leading-6 text-[#2d4a6d]">
                Bạn đang đăng ký với tư cách khách.{" "}
                <a href="/auth" className="font-semibold text-[#0066cc]">
                  Đăng nhập
                </a>{" "}
                để quản lý đăng ký của mình.
              </p>
            )}
            <label className="grid gap-1.5 text-sm font-medium">
              Họ và tên
              <input
                className={inputClassName}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!viewer.loggedIn}
                maxLength={200}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Số điện thoại
                <input
                  className={inputClassName}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  maxLength={30}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Email
                <input
                  className={inputClassName}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={320}
                />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-medium">
              Số người tham gia
              <input
                className={inputClassName}
                type="number"
                min={1}
                max={maxAttendees}
                value={attendees}
                onChange={(e) =>
                  setAttendees(Math.min(Math.max(Number(e.target.value) || 1, 1), maxAttendees))
                }
              />
              {seatsLeft !== null && (
                <span className="text-xs font-normal text-[#178a45]">Còn {seatsLeft} chỗ</span>
              )}
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Ghi chú (không bắt buộc)
              <textarea
                className={`${inputClassName} h-24 py-3`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
              />
            </label>

            {error && (
              <p className="rounded-[12px] bg-[#fff0f1] px-4 py-3 text-sm text-[#c0263a]" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-full bg-[#0066cc] px-7 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Đang gửi..." : "Xác nhận đăng ký"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
