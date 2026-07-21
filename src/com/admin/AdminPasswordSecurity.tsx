"use client";

import { FormEvent, useState } from "react";
import { toast } from "@heroui/react";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const initialForm: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function EyeIcon({ isVisible }: { isVisible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {isVisible ? (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
          <path d="M9.8 4.3A10.7 10.7 0 0 1 12 4c5.5 0 9 5 9 5a16.4 16.4 0 0 1-2.3 2.8" />
          <path d="M6.6 6.6A16.8 16.8 0 0 0 3 9s3.5 5 9 5c1 0 2-.2 2.8-.5" />
        </>
      ) : (
        <>
          <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      )}
    </svg>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder = "••••••••",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label>
      <span className="text-sm font-bold text-[#4b5563]">{label}</span>
      <span className="relative mt-2 block">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-12 w-full rounded-[12px] border border-[#cfd7e6] bg-white/54 px-4 pr-12 text-sm font-semibold text-[#111827] outline-none shadow-inner transition-colors placeholder:text-[#8994a3] focus:border-[#0066cc] focus:bg-white/78"
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 right-2 flex w-9 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#eaf2ff] hover:text-[#0066cc]"
          aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          <EyeIcon isVisible={isVisible} />
        </button>
      </span>
    </label>
  );
}

export default function AdminPasswordSecurity() {
  const [form, setForm] = useState<PasswordForm>(initialForm);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof PasswordForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return "Vui lòng nhập đầy đủ thông tin mật khẩu.";
    }

    if (form.newPassword.length < 8) {
      return "Mật khẩu mới phải có ít nhất 8 ký tự.";
    }

    if (form.newPassword !== form.confirmPassword) {
      return "Mật khẩu xác nhận chưa khớp.";
    }

    if (form.currentPassword === form.newPassword) {
      return "Mật khẩu mới cần khác mật khẩu hiện tại.";
    }

    return "";
  };

  const openConfirmModal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setMessage(null);
    setIsConfirmOpen(true);
  };

  const changePassword = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Không thể đổi mật khẩu.");
      }

      setForm(initialForm);
      setIsConfirmOpen(false);
      setMessage({
        type: "success",
        text: data.message || "Mật khẩu quản trị đã được cập nhật.",
      });
      toast.success("Đổi mật khẩu thành công", {
        description: "Mật khẩu quản trị đã được cập nhật.",
        timeout: 3500,
      });
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Không thể đổi mật khẩu.";
      setMessage({ type: "error", text: errorText });
      toast.danger("Chưa thể đổi mật khẩu", {
        description: errorText,
        timeout: 4500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="grid gap-5" onSubmit={openConfirmModal}>
        <PasswordField
          id="admin-current-password"
          label="Mật khẩu hiện tại"
          value={form.currentPassword}
          onChange={(value) => updateField("currentPassword", value)}
          autoComplete="current-password"
        />
        <PasswordField
          id="admin-new-password"
          label="Mật khẩu mới"
          value={form.newPassword}
          onChange={(value) => updateField("newPassword", value)}
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
        />
        <PasswordField
          id="admin-confirm-password"
          label="Nhập lại mật khẩu mới"
          value={form.confirmPassword}
          onChange={(value) => updateField("confirmPassword", value)}
          autoComplete="new-password"
          placeholder="Xác nhận mật khẩu"
        />

        {message && (
          <p
            className={[
              "rounded-[14px] px-4 py-3 text-sm font-bold",
              message.type === "success"
                ? "bg-[#e9f8ef] text-[#137333]"
                : "bg-[#fff1f0] text-[#b42318]",
            ].join(" ")}
            role="status"
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          className="h-12 w-full rounded-[12px] border border-[#dc2626] bg-white/44 text-sm font-extrabold text-[#dc2626] transition-colors hover:bg-[#fff1f0]"
        >
          Đổi mật khẩu
        </button>
      </form>

      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07111f]/42 px-4 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-password-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) {
              setIsConfirmOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-[24px] border border-white/80 bg-[rgba(247,250,255,0.96)] p-6 text-[#111827] shadow-[0_28px_80px_rgba(17,24,39,0.24)] backdrop-blur-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1f0] text-[#dc2626]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M12 3 18 6v5c0 5-3.4 8.3-6 10-2.6-1.7-6-5-6-10V6z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <div className="mt-5 text-center">
              <h3
                id="confirm-password-title"
                className="text-xl font-extrabold text-[#101828]"
              >
                Bạn có chắc muốn đổi mật khẩu không?
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-[#667085]">
                Sau khi xác nhận, mật khẩu quản trị sẽ được cập nhật ngay. Hãy
                đảm bảo bạn đã ghi nhớ mật khẩu mới.
              </p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSubmitting}
                className="h-11 rounded-full bg-[#eef4fb] px-5 text-sm font-extrabold text-[#475467] transition hover:bg-[#e4edf7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={changePassword}
                disabled={isSubmitting}
                className="h-11 rounded-full bg-[#0066cc] px-5 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(0,102,204,0.24)] transition hover:bg-[#075eb8] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Đang đổi..." : "Xác nhận đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
