"use client";

import { Button } from "@heroui/react";
import { FormEvent, useState } from "react";

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !phone || !message) {
      setStatus({
        type: "error",
        message: "Vui lòng nhập đầy đủ thông tin trước khi gửi.",
      });
      return;
    }

    setStatus({
      type: "success",
      message:
        "Cảm ơn bạn đã liên hệ. HTTL. Khánh Hội sẽ phản hồi trong thời gian sớm nhất.",
    });
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[18px] bg-white p-6 shadow-sm md:p-8">
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
        <label className="grid gap-2 text-sm font-medium text-[#424245]">
          Họ và tên
          <input
            name="name"
            className="h-12 rounded-[12px] border border-[#d6d6d8] bg-[#f5f5f7] px-4 text-[#1d1d1f] outline-none transition-colors placeholder:text-[#86868b] focus:border-[#0099ff]"
            placeholder="Nhập họ và tên"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#424245]">
            Email
            <input
              name="email"
              type="email"
              className="h-12 rounded-[12px] border border-[#d6d6d8] bg-[#f5f5f7] px-4 text-[#1d1d1f] outline-none transition-colors placeholder:text-[#86868b] focus:border-[#0099ff]"
              placeholder="email@example.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#424245]">
            Số điện thoại
            <input
              name="phone"
              type="tel"
              className="h-12 rounded-[12px] border border-[#d6d6d8] bg-[#f5f5f7] px-4 text-[#1d1d1f] outline-none transition-colors placeholder:text-[#86868b] focus:border-[#0099ff]"
              placeholder="+84..."
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-[#424245]">
          Nội dung
          <textarea
            name="message"
            rows={6}
            className="resize-none rounded-[12px] border border-[#d6d6d8] bg-[#f5f5f7] px-4 py-3 text-[#1d1d1f] outline-none transition-colors placeholder:text-[#86868b] focus:border-[#0099ff]"
            placeholder="Bạn muốn chia sẻ điều gì?"
          />
        </label>
      </div>

      <Button
        type="submit"
        className="mt-6 h-11 rounded-full bg-[#0099ff] px-7 text-white"
      >
        Gửi liên hệ
      </Button>
    </form>
  );
}
