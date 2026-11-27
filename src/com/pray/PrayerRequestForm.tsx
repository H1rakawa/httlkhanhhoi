"use client";

import { FormEvent, useState } from "react";
import { PRAYER_CATEGORIES } from "@/com/pray/prayData";

const labelClass = "text-sm font-bold uppercase tracking-[0.18em] text-[#7b7480]";
const fieldClass =
  "rounded-[12px] border border-white/90 bg-white/64 text-sm outline-none placeholder:text-[#8a929c] focus:border-[#6c4cff]";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] border border-white/75 bg-white/46 px-4 py-3">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-[#6e6e73]">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-8 w-14 shrink-0 rounded-full shadow-inner transition-colors",
          checked ? "bg-[#6c4cff]" : "bg-[#d5d8de]",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all",
            checked ? "right-1" : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export default function PrayerRequestForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("Tâm linh");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category,
          privacy: isPrivate ? "private" : "public",
          isAnonymous,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Không thể gửi lời cầu thay.");

      setTitle("");
      setContent("");
      setIsAnonymous(false);
      setMessage(
        isPrivate
          ? "Đã gửi. Lời cầu thay riêng tư chỉ bạn và ban mục vụ xem được."
          : "Đã gửi. Lời cầu thay sẽ hiện với mọi người sau khi ban mục vụ duyệt.",
      );
      onCreated();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi lời cầu thay.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="liquid-glass p-7 md:p-8">
      <h2 className="text-xl font-semibold">Gửi Lời Cầu Thay</h2>
      <form className="mt-8 grid gap-6" onSubmit={submit}>
        <label className="grid gap-3">
          <span className={labelClass}>Tiêu đề</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
            placeholder="Tên của ý nguyện..."
            className={`h-14 px-5 ${fieldClass}`}
          />
        </label>
        <label className="grid gap-3">
          <span className={labelClass}>Chủ đề</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={`h-14 px-5 font-medium ${fieldClass}`}
          >
            {PRAYER_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-3">
          <span className={labelClass}>Nội dung</span>
          <textarea
            rows={6}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
            maxLength={4000}
            placeholder="Chia sẻ tâm tư của bạn..."
            className={`resize-none p-5 leading-7 ${fieldClass}`}
          />
        </label>
        <Toggle
          label={isPrivate ? "Quyền riêng tư: Riêng tư" : "Quyền riêng tư: Công khai"}
          description={
            isPrivate
              ? "Chỉ bạn và ban mục vụ xem được."
              : "Mọi thành viên xem được sau khi duyệt."
          }
          checked={isPrivate}
          onChange={setIsPrivate}
        />
        <Toggle
          label="Ẩn tên của tôi"
          description="Thành viên khác sẽ thấy người gửi là “Ẩn danh”."
          checked={isAnonymous}
          onChange={setIsAnonymous}
        />
        {(message || error) && (
          <p
            role="status"
            className={[
              "rounded-[14px] px-4 py-3 text-sm font-semibold leading-6",
              error ? "bg-[#fff1f0] text-[#b42318]" : "bg-[#ecfdf3] text-[#15803d]",
            ].join(" ")}
          >
            {error || message}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="h-14 rounded-full bg-[#111113] text-sm font-bold text-white shadow-[0_16px_30px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Đang gửi..." : "Gửi lời cầu thay ▷"}
        </button>
      </form>
    </section>
  );
}
