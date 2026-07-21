"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button, toast } from "@heroui/react";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

const ROLE_OPTIONS = [
  { value: "member", label: "Tín hữu" },
  { value: "teacher", label: "Giáo viên" },
  { value: "admin", label: "Quản trị viên" },
];

const MINISTRY_OPTIONS = [
  "Ban Truyền giảng",
  "Ban Cầu thay",
  "Ban Thờ phượng",
  "Ban Thiếu nhi",
  "Ban Thanh niên",
  "Ban Truyền thông",
  "Ban Thư viện",
];

const COUNTRY_OPTIONS = [
  { code: "+84", flag: "🇻🇳", label: "Việt Nam" },
  { code: "+1", flag: "🇺🇸", label: "Hoa Kỳ" },
  { code: "+61", flag: "🇦🇺", label: "Úc" },
  { code: "+81", flag: "🇯🇵", label: "Nhật Bản" },
  { code: "+82", flag: "🇰🇷", label: "Hàn Quốc" },
];

type MemberForm = {
  name: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  role: string;
  ministry: string;
  isWorker: boolean;
};

type FormMessage = {
  type: "success" | "error";
  text: string;
} | null;

type DropdownOption = {
  value: string;
  label: string;
  prefix?: string;
};

const initialForm: MemberForm = {
  name: "",
  email: "",
  phoneCode: COUNTRY_OPTIONS[0].code,
  phoneNumber: "",
  role: "member",
  ministry: MINISTRY_OPTIONS[0],
  isWorker: false,
};

function formatPhoneNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 15)
    .replace(/(\d{3})(?=\d)/g, "$1 ")
    .trim();
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: string;
  htmlFor: string;
}) {
  return (
    <label
      className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#39434d]"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#9a6a00]">
      <span className="h-2 w-2 rounded-full bg-[#f5b400]" />
      {children}
    </p>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={[
        "h-4 w-4 transition-transform duration-200",
        isOpen ? "rotate-180" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SelectDropdown({
  id,
  value,
  options,
  onChange,
  openKey,
  activeKey,
  setActiveKey,
}: {
  id: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  openKey: string;
  activeKey: string | null;
  setActiveKey: (key: string | null) => void;
}) {
  const isOpen = activeKey === openKey;
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setActiveKey(isOpen ? null : openKey)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-[10px] border border-[#cfd8e3] bg-white/95 px-4 text-left text-sm font-extrabold text-[#1f2937] outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
      >
        <span className="min-w-0 truncate">
          {selected.prefix ? `${selected.prefix} ` : ""}
          {selected.label}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[10020] overflow-hidden rounded-[14px] border border-[#d7e1ec] bg-white py-1 shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setActiveKey(null);
                }}
                className={[
                  "flex h-10 w-full items-center gap-2 px-4 text-left text-sm font-bold transition",
                  isSelected
                    ? "bg-[#e8f2ff] text-[#0066cc]"
                    : "text-[#344054] hover:bg-[#f4f8ff]",
                ].join(" ")}
              >
                {option.prefix && (
                  <span className="text-base leading-none">{option.prefix}</span>
                )}
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

type AdminAddMemberButtonProps = {
  label?: string;
  className?: string;
  iconClassName?: string;
  onCreated?: () => void;
};

export default function AdminAddMemberButton({
  label = "Thêm thành viên mới",
  className = "inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#0066cc] px-7 text-sm font-extrabold text-white shadow-[0_18px_38px_rgba(0,102,204,0.24)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#0077ee]",
  iconClassName = "h-5 w-5",
  onCreated,
}: AdminAddMemberButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<MemberForm>(initialForm);
  const [message, setMessage] = useState<FormMessage>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  const updateField = (field: keyof MemberForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setMessage(null);
    setActiveDropdown(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const trimmedPhoneNumber = form.phoneNumber.trim();
      const phone = trimmedPhoneNumber
        ? `${form.phoneCode} ${trimmedPhoneNumber}`
        : "";
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone,
          role: form.role,
          team: form.ministry,
          ministry: form.ministry,
          isWorker: form.isWorker,
          status: "active",
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Không thể tạo thành viên mới.");
      }

      const successText =
        data.message || "Đã tạo thành viên và gửi email tạo mật khẩu.";
      setMessage({ type: "success", text: successText });
      setForm(initialForm);
      toast.success("Tạo thành viên thành công", {
        description: "Email xác thực đã được gửi đến thành viên mới.",
        timeout: 3500,
      });
      onCreated?.();
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Không thể tạo thành viên mới.";
      setMessage({ type: "error", text: errorText });
      toast.danger("Chưa thể tạo thành viên", {
        description: errorText,
        timeout: 4500,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modal =
    isModalOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07111f]/42 px-4 py-8 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-member-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <form
              className="w-full max-w-160 rounded-[22px] border border-white/80 bg-[rgba(247,250,255,0.96)] p-5 text-[#111827] shadow-[0_28px_80px_rgba(17,24,39,0.24)] backdrop-blur-2xl md:p-6"
              onSubmit={handleSubmit}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0066cc] text-white shadow-[0_12px_24px_rgba(0,102,204,0.24)]">
                    <DashboardIcon name="community" className="h-5 w-5" />
                  </div>
                  <div>
                    <h2
                      id="add-member-title"
                      className="text-xl font-extrabold text-[#101828]"
                    >
                      Thêm thành viên mới
                    </h2>
                    <p className="mt-1 text-sm font-medium text-[#667085]">
                      Tạo tài khoản và gửi email xác minh đến người dùng mới.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#eaf3ff] hover:text-[#0066cc]"
                  aria-label="Đóng modal"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 grid gap-5">
                <SectionTitle>Thông tin cơ bản</SectionTitle>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="member-name">Họ và tên</FieldLabel>
                    <input
                      id="member-name"
                      required
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      className="h-11 rounded-[10px] border border-[#cfd8e3] bg-white/95 px-4 text-sm font-semibold outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="member-email">Email</FieldLabel>
                    <input
                      id="member-email"
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      className="h-11 rounded-[10px] border border-[#cfd8e3] bg-white/95 px-4 text-sm font-semibold outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                      placeholder="email@vi-du.com"
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <FieldLabel htmlFor="member-phone">Số điện thoại</FieldLabel>
                    <div className="grid grid-cols-[118px_minmax(0,1fr)] gap-3">
                      <SelectDropdown
                        id="member-phone-code"
                        value={form.phoneCode}
                        options={COUNTRY_OPTIONS.map((country) => ({
                          value: country.code,
                          label: country.code,
                          prefix: country.flag,
                        }))}
                        onChange={(value) => updateField("phoneCode", value)}
                        openKey="phoneCode"
                        activeKey={activeDropdown}
                        setActiveKey={setActiveDropdown}
                      />
                      <input
                        id="member-phone"
                        value={form.phoneNumber}
                        onChange={(event) =>
                          updateField(
                            "phoneNumber",
                            formatPhoneNumber(event.target.value),
                          )
                        }
                        className="h-11 min-w-0 rounded-[10px] border border-[#cfd8e3] bg-white/95 px-4 text-sm font-semibold outline-none transition focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10"
                        placeholder="000 000 000"
                      />
                    </div>
                  </div>
                </div>

                <SectionTitle>Phân quyền & vai trò</SectionTitle>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="member-role">Vai trò</FieldLabel>
                    <SelectDropdown
                      id="member-role"
                      value={form.role}
                      options={ROLE_OPTIONS}
                      onChange={(value) => updateField("role", value)}
                      openKey="role"
                      activeKey={activeDropdown}
                      setActiveKey={setActiveDropdown}
                    />
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="member-ministry">Ban Ngành</FieldLabel>
                    <SelectDropdown
                      id="member-ministry"
                      value={form.ministry}
                      options={MINISTRY_OPTIONS.map((ministry) => ({
                        value: ministry,
                        label: ministry,
                      }))}
                      onChange={(value) => updateField("ministry", value)}
                      openKey="ministry"
                      activeKey={activeDropdown}
                      setActiveKey={setActiveDropdown}
                    />
                  </div>
                </div>

                <SectionTitle>Thông tin bổ sung</SectionTitle>
                <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#d8e7ff] bg-[#edf5ff]/88 px-4 py-3">
                  <div>
                    <p className="text-sm font-extrabold text-[#26313d]">
                      Có phải là nhân sự không?
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#667085]">
                      Bạn có đang hỗ trợ công tác nào trong hội thánh không?
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.isWorker}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        isWorker: !current.isWorker,
                      }))
                    }
                    className={[
                      "relative h-7 w-12 rounded-full p-1 transition",
                      form.isWorker ? "bg-[#0066cc]" : "bg-[#cfd8e3]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "block h-5 w-5 rounded-full bg-white shadow-sm transition",
                        form.isWorker ? "translate-x-5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </button>
                </div>
              </div>

              {message && (
                <p
                  className={[
                    "mt-5 rounded-[14px] px-4 py-3 text-sm font-bold",
                    message.type === "success"
                      ? "bg-[#e9f8ef] text-[#137333]"
                      : "bg-[#fff1f0] text-[#b42318]",
                  ].join(" ")}
                  role="status"
                >
                  {message.text}
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 rounded-full px-6 text-sm font-extrabold text-[#475467] transition hover:bg-[#eef4fb]"
                >
                  Hủy
                </button>
                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="h-11 rounded-full bg-[#0066cc] px-6 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(0,102,204,0.24)]"
                >
                  {isSubmitting ? "Đang gửi..." : "Thêm thành viên"}
                </Button>
              </div>
            </form>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={() => setIsModalOpen(true)}
      >
        <DashboardIcon name="community" className={iconClassName} />
        {label}
      </button>
      {modal}
    </>
  );
}
