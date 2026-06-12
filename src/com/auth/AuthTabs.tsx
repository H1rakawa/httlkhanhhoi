"use client";

import { useState } from "react";
import { Button, Tabs } from "@heroui/react";
import { ClockIcon } from "@/com/shared/Icons";

type AuthView = "forms" | "forgot";
type AuthTab = "login" | "register";

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-3 text-base font-medium text-[#252525]">
      {label}
      <input
        name={name}
        type={type}
        className="h-14 rounded-[14px] border border-white/90 bg-white/76 px-5 text-base text-[#1d1d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-[#8b8b91] focus:border-[#0a84ff] focus:bg-white/90"
        placeholder={placeholder}
      />
    </label>
  );
}

function PasswordInput({
  id,
  name,
  placeholder = "••••••••",
}: {
  id?: string;
  name: string;
  placeholder?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        className="h-14 w-full rounded-[14px] border border-white/90 bg-white/76 px-5 pr-14 text-base text-[#1d1d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-[#8b8b91] focus:border-[#0a84ff] focus:bg-white/90"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="absolute inset-y-0 right-2 flex w-11 items-center justify-center rounded-full text-[#6e6e73] hover:text-[#0066cc]"
        aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        title={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {isVisible ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="m3 3 18 18" />
            <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
            <path d="M9.8 4.3A10.7 10.7 0 0 1 12 4c5.5 0 9 5 9 5a16.4 16.4 0 0 1-2.3 2.8" />
            <path d="M6.6 6.6A16.8 16.8 0 0 0 3 9s3.5 5 9 5c1 0 2-.2 2.8-.5" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        )}
      </button>
    </div>
  );
}

function PasswordField({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-3 text-base font-medium text-[#252525]">
      {label}
      <PasswordInput name={name} />
    </label>
  );
}

function SocialActions() {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-[#ececee]" />
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a8a8f]">
          Hoặc tiếp tục với
        </span>
        <span className="h-px flex-1 bg-[#ececee]" />
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          className="liquid-readable flex h-14 items-center justify-center gap-3 px-4 text-base font-semibold text-[#1d1d1f] hover:border-[#0a84ff] hover:text-[#0066cc]"
        >
          <span className="text-xl tracking-wider">GOOGLE</span>
          <span>Google</span>
        </button>
        <button
          type="button"
          className="liquid-readable flex h-14 items-center justify-center gap-3 px-4 text-base font-semibold text-[#1d1d1f] hover:border-[#0a84ff] hover:text-[#0066cc]"
        >
          <span className="text-lg">◎</span>
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
}

function LoginForm({ onForgot }: { onForgot: () => void }) {
  return (
    <form className="mt-9">
      <div className="grid gap-7">
        <Field
          label="Email hoặc Tên đăng nhập"
          name="identity"
          placeholder="name@example.com"
        />
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4 text-base font-medium">
            <label htmlFor="login-password" className="text-[#252525]">
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={onForgot}
              className="text-sm font-semibold text-[#0066cc] hover:text-[#0a84ff]"
            >
              Quên mật khẩu?
            </button>
          </div>
          <PasswordInput id="login-password" name="password" />
        </div>
      </div>

      <Button
        type="submit"
        className="mt-7 h-14 w-full rounded-full bg-[#0a7bea] text-base font-semibold text-white shadow-[0_14px_24px_rgba(0,102,204,0.18)]"
      >
        Đăng nhập
      </Button>

      <SocialActions />
    </form>
  );
}

function RegisterForm() {
  return (
    <form className="mt-9">
      <div className="grid gap-5">
        <Field label="Họ và tên" name="fullName" placeholder="Nguyễn Văn A" />
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="name@example.com"
          />
          <Field
            label="Số điện thoại"
            name="phone"
            type="tel"
            placeholder="+84..."
          />
        </div>
        <PasswordField label="Mật khẩu" name="password" />
        <PasswordField label="Xác nhận mật khẩu" name="confirmPassword" />
      </div>

      <Button
        type="submit"
        className="mt-7 h-14 w-full rounded-full bg-[#0a7bea] text-base font-semibold text-white shadow-[0_14px_24px_rgba(0,102,204,0.18)]"
      >
        Đăng ký
      </Button>

      <SocialActions />
    </form>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  return (
    <div className="liquid-glass w-full max-w-[560px] p-7 text-[#1d1d1f] md:p-12">
      <div className="liquid-readable mx-auto flex h-16 w-16 items-center justify-center rounded-full text-[#0a7bea]">
        <ClockIcon className="h-8 w-8" />
      </div>
      <div className="mt-7 text-center">
        <h1 className="text-4xl font-semibold tracking-normal">
          Quên mật khẩu
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-[#6e6e73]">
          Nhập email của bạn để nhận liên kết khôi phục mật khẩu.
        </p>
      </div>

      <form className="mt-10">
        <Field
          label="Địa chỉ Email"
          name="resetEmail"
          type="email"
          placeholder="example@gmail.com"
        />
        <Button
          type="submit"
          className="mt-7 h-14 w-full rounded-full bg-[#0a7bea] text-base font-semibold text-white shadow-[0_14px_24px_rgba(0,102,204,0.18)]"
        >
          Gửi liên kết khôi phục
        </Button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mx-auto mt-9 flex items-center gap-2 text-base font-medium text-[#0066cc] hover:text-[#0a84ff]"
      >
        <span aria-hidden="true">←</span>
        Quay lại Đăng nhập
      </button>
    </div>
  );
}

export default function AuthTabs() {
  const [view, setView] = useState<AuthView>("forms");
  const [activeTab, setActiveTab] = useState<AuthTab>("login");

  if (view === "forgot") {
    return (
      <ForgotPasswordForm
        onBack={() => {
          setActiveTab("login");
          setView("forms");
        }}
      />
    );
  }

  return (
    <div className="liquid-glass w-full max-w-[620px] p-7 text-[#1d1d1f] md:p-12">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(String(key) as AuthTab)}
        className="w-full"
        variant="primary"
        aria-label="Đăng nhập hoặc đăng ký"
      >
        <Tabs.List className="liquid-readable grid w-full grid-cols-2 p-1">
          <Tabs.Tab
            id="login"
            className="auth-tab h-11 rounded-[12px] text-base font-semibold text-[#6e6e73]"
          >
            Đăng nhập
          </Tabs.Tab>
          <Tabs.Tab
            id="register"
            className="auth-tab h-11 rounded-[12px] text-base font-semibold text-[#6e6e73]"
          >
            Đăng ký
          </Tabs.Tab>
        </Tabs.List>

      </Tabs>

      {activeTab === "login" ? (
        <LoginForm onForgot={() => setView("forgot")} />
      ) : (
        <RegisterForm />
      )}
    </div>
  );
}
