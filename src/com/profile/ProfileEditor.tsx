"use client";

import { toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

type ProfileEditorProps = {
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  roleLabel: string;
  statusLabel: string;
  joinedLabel: string | null;
  providerLabel: string;
};

const inputClassName =
  "mt-2 h-12 w-full rounded-[12px] border border-[#cfd7e6] bg-white/60 px-4 text-sm font-semibold text-[#111827] outline-none shadow-inner transition-colors placeholder:text-[#8994a3] focus:border-[#0066cc] focus:bg-white/85 disabled:cursor-not-allowed disabled:text-[#6e6e73]";

async function readJson(response: Response) {
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    profile?: { name: string; phone: string | null; avatar_url: string | null };
  };
  if (!response.ok) throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
  return data;
}

export default function ProfileEditor(props: ProfileEditorProps) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState({ name: props.name, phone: props.phone ?? "" });
  const [name, setName] = useState(props.name);
  const [phone, setPhone] = useState(props.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(props.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const isDirty = name.trim() !== saved.name || phone.trim() !== saved.phone;
  const initial = (saved.name.charAt(0) || props.email.charAt(0) || "T").toUpperCase();

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const data = await readJson(
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone }),
        }),
      );
      const next = { name: data.profile?.name ?? name.trim(), phone: data.profile?.phone ?? "" };
      setSaved(next);
      setName(next.name);
      setPhone(next.phone);
      toast.success("Đã lưu hồ sơ", { timeout: 3000 });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu hồ sơ.");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh đại diện tối đa 5 MB.");
      return;
    }
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const data = await readJson(await fetch("/api/profile", { method: "POST", body }));
      setAvatarUrl(data.profile?.avatar_url ?? null);
      toast.success("Đã cập nhật ảnh đại diện", { timeout: 3000 });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ảnh lên.");
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <section className="liquid-readable p-6 md:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0">
          {avatarUrl ? (
            <div
              role="img"
              aria-label={`Ảnh đại diện của ${saved.name}`}
              className="h-28 w-28 rounded-full border-4 border-white bg-cover bg-center shadow-md"
              style={{ backgroundImage: `url("${avatarUrl}")` }}
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-[#087be8] text-4xl font-bold text-white shadow-md">
              {initial}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={isUploading}
            aria-label="Đổi ảnh đại diện"
            className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#0066cc] text-white shadow-md transition hover:bg-[#0077ee] disabled:opacity-60"
          >
            {isUploading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M4 8h4l2-3h4l2 3h4v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => uploadAvatar(event.target.files?.[0])}
          />
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-normal">{saved.name}</h1>
          <p className="mt-1 truncate text-sm text-[#6e6e73]">{props.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#cfe0f7] bg-[#eef5ff] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#0066cc]">
              {props.roleLabel}
            </span>
            <span className="rounded-full border border-[#c9ecd6] bg-[#e9f9ef] px-4 py-1.5 text-xs font-semibold text-[#1b8f45]">
              {props.statusLabel}
            </span>
            {props.joinedLabel && (
              <span className="rounded-full border border-white/80 bg-white/60 px-4 py-1.5 text-xs font-semibold text-[#6e6e73]">
                Tham gia {props.joinedLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={saveProfile} className="mt-10">
        <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
        <p className="mt-1 text-sm text-[#6e6e73]">
          Họ tên và ảnh đại diện sẽ hiển thị khi bạn gửi lời cầu thay hoặc bình luận.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label>
            <span className="text-sm font-bold text-[#4b5563]">Họ và tên</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              autoComplete="name"
              className={inputClassName}
            />
          </label>
          <label>
            <span className="text-sm font-bold text-[#4b5563]">Số điện thoại</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              type="tel"
              inputMode="tel"
              maxLength={20}
              autoComplete="tel"
              placeholder="Ví dụ: 0901 234 567"
              className={inputClassName}
            />
          </label>
          <label>
            <span className="text-sm font-bold text-[#4b5563]">Email đăng nhập</span>
            <input value={props.email} disabled className={inputClassName} />
          </label>
          <label>
            <span className="text-sm font-bold text-[#4b5563]">Phương thức đăng nhập</span>
            <input value={props.providerLabel} disabled className={inputClassName} />
          </label>
        </div>

        {error && (
          <p className="mt-5 rounded-[12px] border border-[#ff3b30]/20 bg-[#fff1f0] px-4 py-3 text-sm font-medium text-[#b42318]">
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className="h-12 rounded-full bg-[#0066cc] px-8 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,102,204,0.24)] transition hover:bg-[#0077ee] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          {isDirty && !isSaving && (
            <button
              type="button"
              onClick={() => {
                setName(saved.name);
                setPhone(saved.phone);
                setError("");
              }}
              className="h-12 rounded-full px-5 text-sm font-semibold text-[#6e6e73] hover:bg-white/60"
            >
              Hủy
            </button>
          )}
          <p className="text-xs text-[#8a8a8f]">
            Muốn đổi email hoặc vai trò, vui lòng liên hệ ban quản trị.
          </p>
        </div>
      </form>
    </section>
  );
}
