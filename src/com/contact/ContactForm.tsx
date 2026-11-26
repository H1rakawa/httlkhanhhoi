"use client";

import { Button } from "@heroui/react";
import { FormEvent, useState } from "react";

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      website: String(formData.get("website") || ""),
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.message) {
      setStatus({ type: "error", message: "Vui lòng nhập đầy đủ thông tin trước khi gửi." });
      return;
    }
    if (!EMAIL_PATTERN.test(payload.email)) {
      setStatus({ type: "error", message: "Email không hợp lệ." });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.error || "Không thể gửi lời nhắn. Vui lòng thử lại.",
        });
        return;
      }

      setStatus({
        type: "success",
        message:
          "Cảm ơn bạn đã liên hệ. HTTL. Khánh Hội đã nhận được lời nhắn và sẽ phản hồi trong thời gian sớm nhất.",
      });
      form.reset();
    } catch {
      setStatus({ type: "error", message: "Không thể kết nối máy chủ. Vui lòng thử lại." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="liquid-readable p-6 md:p-8">
      <div>
        <p className="text-sm font-medium text-[#0066cc]">Form liên hệ</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#1d1d1f]">
          Gửi lời nhắn cho chúng tôi
        </h2>
      </div>

      {status && (
        <div
          className={[
            "mt-6 rounded-[12px] px-4 py-3 text-sm font-medium",
            status.type === "success"
              ? "bg-[#e9f7ef] text-[#117a36]"
              : "bg-[#fff1f0] text-[#b42318]",
          ].join(" ")}
          role="status"
        >
          {status.message}
        </div>
      )}

      <div className="mt-7 grid gap-4">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <label className="grid gap-2 text-sm font-medium text-[#424245]">
          Họ và tên
          <input
            name="name"
            required
            maxLength={200}
            autoComplete="name"
            className="h-12 rounded-[12px] border border-white/90 bg-white/76 px-4 text-[#1d1d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-[#86868b] focus:border-[#0099ff]"
            placeholder="Nhập họ và tên"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#424245]">
            Email
            <input
              name="email"
              type="email"
              required
              maxLength={320}
              autoComplete="email"
              className="h-12 rounded-[12px] border border-white/90 bg-white/76 px-4 text-[#1d1d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-[#86868b] focus:border-[#0099ff]"
              placeholder="email@example.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#424245]">
            Số điện thoại
            <input
              name="phone"
              type="tel"
              required
              maxLength={30}
              autoComplete="tel"
              className="h-12 rounded-[12px] border border-white/90 bg-white/76 px-4 text-[#1d1d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-[#86868b] focus:border-[#0099ff]"
              placeholder="+84..."
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-[#424245]">
          Nội dung
          <textarea
            name="message"
            rows={6}
            required
            maxLength={5000}
            className="resize-none rounded-[12px] border border-white/90 bg-white/76 px-4 py-3 text-[#1d1d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-[#86868b] focus:border-[#0099ff]"
            placeholder="Bạn muốn chia sẻ điều gì?"
          />
        </label>
      </div>

      <Button
        type="submit"
        isDisabled={submitting}
        className="mt-6 h-11 rounded-full bg-[#0099ff] px-7 text-white disabled:opacity-60"
      >
        {submitting ? "Đang gửi..." : "Gửi liên hệ"}
      </Button>
    </form>
  );
}
