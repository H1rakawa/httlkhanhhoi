"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SearchIcon } from "@/com/admin/pray/AdminPrayerIcons";
import { uploadAdminFile, type UploadedAsset } from "./adminClient";

export const inputClassName =
  "h-11 w-full rounded-[12px] border border-[#dfe5ee] bg-white px-3.5 text-sm font-semibold text-[#111827] outline-none transition placeholder:text-[#9aa4b2] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/15 disabled:bg-[#f2f4f7]";
export const textareaClassName =
  "min-h-28 w-full rounded-[12px] border border-[#dfe5ee] bg-white px-3.5 py-3 text-sm font-semibold leading-6 text-[#111827] outline-none transition placeholder:text-[#9aa4b2] focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/15";
export const primaryButtonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0066cc] px-6 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(0,102,204,0.24)] transition hover:bg-[#0077ee] disabled:cursor-not-allowed disabled:opacity-60";
export const secondaryButtonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#dfe5ee] bg-white px-5 text-sm font-extrabold text-[#344054] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60";
export const dangerButtonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#ffd5d1] bg-white px-5 text-sm font-extrabold text-[#b42318] transition hover:bg-[#fff6f5] disabled:cursor-not-allowed disabled:opacity-60";
export const smallButtonClassName =
  "inline-flex h-8 items-center justify-center rounded-full border border-[#e4e9f1] bg-white px-3 text-xs font-extrabold text-[#344054] transition hover:bg-[#f3f8ff] hover:text-[#0066cc] disabled:cursor-not-allowed disabled:opacity-50";

export function AdminPageHeader({
  crumb,
  title,
  description,
  action,
}: {
  crumb: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7d8798]">
          <span>Quản trị</span>
          <span>/</span>
          <span className="text-[#101828]">{crumb}</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.05em] text-[#0f172a] md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#506070]">{description}</p>
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-3">{action}</div>}
    </header>
  );
}

export function AdminError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-[16px] border border-[#ff3b30]/20 bg-[#fff1f0] px-5 py-4 text-sm font-bold text-[#b42318]">
      {children}
    </p>
  );
}

const statTone = {
  blue: "text-[#0c1322]",
  gold: "text-[#8a6110]",
  green: "text-[#1b8f45]",
  slate: "text-[#667085]",
};

export function AdminStatCards({
  items,
}: {
  items: Array<{ label: string; value: number | string; tone?: keyof typeof statTone; hint?: string }>;
}) {
  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((stat) => (
        <article
          key={stat.label}
          className="min-h-[118px] rounded-[24px] border border-white/64 bg-white/50 px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_18px_42px_rgba(31,48,70,0.08)] backdrop-blur-xl"
        >
          <p className="text-xs font-black uppercase leading-4 text-[#7f8796]">{stat.label}</p>
          <p className={`mt-2 text-4xl font-black ${statTone[stat.tone ?? "blue"]}`}>
            {typeof stat.value === "number"
              ? new Intl.NumberFormat("vi-VN").format(stat.value)
              : stat.value}
          </p>
          {stat.hint && <p className="mt-1 text-xs font-bold text-[#7f8796]">{stat.hint}</p>}
        </article>
      ))}
    </section>
  );
}

/** Thanh lọc: ô tìm kiếm + các select tuỳ ý. */
export function AdminToolbar({
  query,
  onQueryChange,
  placeholder,
  children,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="liquid-glass mt-6 flex flex-col gap-3 rounded-[24px] p-3 lg:flex-row">
      <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[14px] bg-white/64 px-4 text-[#8a98a8] shadow-inner">
        <SearchIcon />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-extrabold text-[#111827] outline-none placeholder:text-[#929baa]"
        />
      </label>
      {children && <div className="grid gap-3 sm:grid-cols-3 lg:flex">{children}</div>}
    </section>
  );
}

export function AdminSelect<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="h-12 min-w-[170px] rounded-[14px] border-0 bg-white/64 px-4 text-sm font-extrabold text-[#111827] shadow-inner outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function AdminPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`mt-6 overflow-hidden rounded-[24px] border border-white/64 bg-white/56 shadow-[0_18px_42px_rgba(31,48,70,0.08)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

export function AdminEmpty({ children }: { children: React.ReactNode }) {
  return <p className="px-6 py-12 text-center text-sm font-bold text-[#667085]">{children}</p>;
}

export function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold ${className}`}>
      {children}
    </span>
  );
}

export function AdminDrawer({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex justify-end bg-[#0f172a]/30 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={`flex h-full w-full flex-col bg-[#f7f9fc] shadow-[0_0_80px_rgba(15,23,42,0.25)] ${wide ? "max-w-3xl" : "max-w-xl"}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e4e9f1] px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-[#0f172a]">{title}</h2>
            {subtitle && <p className="mt-1 text-xs font-bold text-[#667085]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#667085] hover:bg-white"
            aria-label="Đóng"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#e4e9f1] bg-white/70 px-6 py-4">
            {footer}
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}

export function Field({
  label,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#667085]">
        {label}
        {required && <span className="text-[#d92d20]"> *</span>}
      </span>
      {children}
      {hint && <span className="text-xs font-semibold text-[#8a94a6]">{hint}</span>}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#e4e9f1] bg-white px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#0066cc]"
      />
      <span>
        <span className="block text-sm font-extrabold text-[#182230]">{label}</span>
        {description && <span className="block text-xs font-semibold text-[#667085]">{description}</span>}
      </span>
    </label>
  );
}

/**
 * Chọn file và tải thẳng lên Supabase Storage. Trả về asset đã ghi vào media_assets.
 * `accept` giới hạn loại file trong hộp chọn của trình duyệt.
 */
export function UploadButton({
  accept,
  relatedTable,
  label = "Tải file lên",
  onUploaded,
  disabled,
}: {
  accept: string;
  relatedTable: "resources" | "events" | "news_posts" | "testimonies";
  label?: string;
  onUploaded: (asset: UploadedAsset) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      const asset = await uploadAdminFile(file, relatedTable, setProgress);
      onUploaded(asset);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Không tải được file.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      <button
        type="button"
        disabled={disabled || progress !== null}
        onClick={() => inputRef.current?.click()}
        className={secondaryButtonClassName}
      >
        {progress !== null ? `Đang tải… ${progress}%` : label}
      </button>
      {error && <span className="text-xs font-bold text-[#b42318]">{error}</span>}
    </div>
  );
}

/** Ảnh bìa: dán link hoặc tải ảnh lên. */
export function ImageField({
  label,
  url,
  onChange,
  relatedTable,
  hint,
  required,
}: {
  label: string;
  url: string;
  onChange: (url: string, assetId: string | null) => void;
  relatedTable: "resources" | "events" | "news_posts" | "testimonies";
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Field label={label} hint={hint} required={required}>
        <input
          value={url}
          onChange={(event) => onChange(event.target.value, null)}
          placeholder="https://… hoặc tải ảnh lên"
          className={inputClassName}
        />
      </Field>
      <div className="flex items-center gap-3">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-16 w-24 rounded-[10px] border border-[#e4e9f1] object-cover" />
        )}
        <UploadButton
          accept="image/jpeg,image/png,image/webp,image/gif"
          relatedTable={relatedTable}
          label={url ? "Đổi ảnh" : "Tải ảnh lên"}
          onUploaded={(asset) => onChange(asset.publicUrl, asset.id)}
        />
        {url && (
          <button type="button" onClick={() => onChange("", null)} className={smallButtonClassName}>
            Bỏ ảnh
          </button>
        )}
      </div>
    </div>
  );
}

/** Nút xoá hai bước, tránh bấm nhầm. */
export function ConfirmDeleteButton({
  onConfirm,
  busy,
  label = "Xoá",
  confirmLabel = "Bấm lần nữa để xoá vĩnh viễn",
}: {
  onConfirm: () => void;
  busy?: boolean;
  label?: string;
  confirmLabel?: string;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      className={armed ? `${dangerButtonClassName} !bg-[#d92d20] !text-white` : dangerButtonClassName}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}

/** Hộp xác nhận trước khi thực hiện thao tác (đổi vai trò, khoá, xoá…). */
export function AdminConfirmDialog({
  title,
  children,
  confirmLabel,
  tone = "primary",
  busy = false,
  onConfirm,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [busy, onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-[#0f172a]/30 px-4 backdrop-blur-[2px]"
      onClick={() => !busy && onClose()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-[24px] border border-white/80 bg-white p-6 shadow-[0_34px_100px_rgba(15,23,42,0.28)]"
      >
        <h2 id="admin-confirm-title" className="text-lg font-extrabold text-[#0f172a]">
          {title}
        </h2>
        <div className="mt-3 text-sm font-semibold leading-6 text-[#475467]">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} disabled={busy} className={secondaryButtonClassName}>
            Huỷ
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={
              tone === "danger"
                ? "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#d92d20] px-6 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(217,45,32,0.24)] transition hover:bg-[#b42318] disabled:cursor-not-allowed disabled:opacity-60"
                : primaryButtonClassName
            }
          >
            {busy ? "Đang xử lý…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
