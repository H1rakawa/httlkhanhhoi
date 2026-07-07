"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, toast } from "@heroui/react";
import NextLink from "next/link";

type FormMessage = {
  type: "success" | "error";
  text: string;
} | null;

function StatusIcon({ success = false }: { success?: boolean }) {
  return (
    <div
      className={[
        "liquid-readable mx-auto flex h-16 w-16 items-center justify-center rounded-full",
        success ? "text-[#16803c]" : "text-[#0a7bea]",
      ].join(" ")}
    >
      {success ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <rect x="5" y="10" width="14" height="10" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      )}
    </div>
  );
}

function PasswordInput({ id, name }: { id: string; name: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        required
        minLength={8}
        autoComplete="new-password"
        className="h-14 w-full rounded-[14px] border border-white/90 bg-white/76 px-5 pr-14 text-base text-[#1d1d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-[#8b8b91] focus:border-[#0a84ff] focus:bg-white/90"
        placeholder="Ít nhất 8 ký tự"
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="absolute inset-y-0 right-2 flex w-11 items-center justify-center rounded-full text-[#6e6e73] hover:text-[#0066cc]"
        aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
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
      </button>
    </div>
  );
}

export default function ResetPasswordForm() {
  const [accessToken, setAccessToken] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("access_token");
    const recoveryType = params.get("type");
    const errorDescription = params.get("error_description");

    queueMicrotask(() => {
      if (token && recoveryType === "recovery") {
        setAccessToken(token);
      } else {
        setMessage({
          type: "error",
          text:
            errorDescription?.replaceAll("+", " ") ||
            "Liên kết khôi phục không hợp lệ hoặc đã hết hạn.",
        });
      }
      setIsReady(true);
    });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận chưa khớp." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, password }),
      });
      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) throw new Error(data.error || "Không thể cập nhật mật khẩu.");

      window.history.replaceState(null, "", "/auth/reset-password");
      setIsComplete(true);
      toast.success("Đổi mật khẩu thành công", {
        description: "Bạn có thể đăng nhập bằng mật khẩu mới.",
        timeout: 3500,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Không thể cập nhật mật khẩu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="liquid-glass w-full max-w-140 p-8 text-center text-[#6e6e73] md:p-12">
        Đang xác thực liên kết khôi phục...
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="liquid-glass w-full max-w-140 p-7 text-center text-[#1d1d1f] md:p-12">
        <StatusIcon success />
        <h1 className="mt-7 text-4xl font-semibold">Mật khẩu đã được đổi</h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-[#6e6e73]">
          Bạn có thể sử dụng mật khẩu mới để đăng nhập vào tài khoản.
        </p>
        <NextLink
          href="/auth"
          className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-[#0a7bea] text-base font-semibold text-white shadow-[0_14px_24px_rgba(0,102,204,0.18)]"
        >
          Tiếp tục đăng nhập
        </NextLink>
      </div>
    );
  }

  return (
    <div className="liquid-glass w-full max-w-140 p-7 text-[#1d1d1f] md:p-12">
      <StatusIcon />
      <div className="mt-7 text-center">
        <h1 className="text-4xl font-semibold">Tạo mật khẩu mới</h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-[#6e6e73]">
          Chọn một mật khẩu mạnh mà bạn chưa từng sử dụng cho tài khoản này.
        </p>
      </div>

      {accessToken ? (
        <form className="mt-9" onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <label className="grid gap-3 text-base font-medium text-[#252525]">
              Mật khẩu mới
              <PasswordInput id="new-password" name="password" />
            </label>
            <label className="grid gap-3 text-base font-medium text-[#252525]">
              Xác nhận mật khẩu mới
              <PasswordInput id="confirm-new-password" name="confirmPassword" />
            </label>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#6e6e73]">
            Mật khẩu cần có ít nhất 8 ký tự.
          </p>
          {message && (
            <p
              className="mt-6 rounded-[14px] bg-[#fff0ef] px-4 py-3 text-sm font-medium text-[#b42318]"
              role="status"
            >
              {message.text}
            </p>
          )}
          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="mt-7 h-14 w-full rounded-full bg-[#0a7bea] text-base font-semibold text-white shadow-[0_14px_24px_rgba(0,102,204,0.18)]"
          >
            {isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </Button>
        </form>
      ) : (
        <>
          {message && (
            <p
              className="mt-8 rounded-[14px] bg-[#fff0ef] px-4 py-3 text-sm font-medium text-[#b42318]"
              role="alert"
            >
              {message.text}
            </p>
          )}
          <NextLink
            href="/auth"
            className="mt-7 flex h-14 w-full items-center justify-center rounded-full bg-[#0a7bea] text-base font-semibold text-white shadow-[0_14px_24px_rgba(0,102,204,0.18)]"
          >
            Quay lại đăng nhập
          </NextLink>
        </>
      )}
    </div>
  );
}
