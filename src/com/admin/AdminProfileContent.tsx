import Image from "next/image";
import AdminSidebar from "@/com/admin/AdminSidebar";
import AdminPasswordSecurity from "@/com/admin/AdminPasswordSecurity";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

type AdminProfileContentProps = {
  adminId: string;
  displayName: string;
  email: string;
  phone?: string | null;
  avatarUrl: string | null;
};

function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-bold text-[#4b5563]">{label}</span>
      <input
        defaultValue={value}
        className="mt-2 h-12 w-full rounded-[12px] border border-[#cfd7e6] bg-white/54 px-4 text-sm font-semibold text-[#111827] outline-none shadow-inner transition-colors placeholder:text-[#8994a3] focus:border-[#0f172a] focus:bg-white/78"
      />
    </label>
  );
}

export default function AdminProfileContent({
  adminId,
  displayName,
  email,
  phone,
  avatarUrl,
}: AdminProfileContentProps) {
  const role = "Trưởng Ban sự kiện";
  const initial = (displayName.charAt(0) || email.charAt(0) || "A").toUpperCase();

  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-[auto_minmax(0,1fr)] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-5 md:py-5 lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[268px_minmax(0,1fr)]">
      <AdminSidebar
        adminId={adminId}
        displayName={displayName}
        avatarUrl={avatarUrl}
      />

      <section className="min-w-0">
        <div className="relative min-h-[calc(100svh-2rem)] overflow-hidden rounded-[30px] border border-white/72 bg-[rgba(247,248,253,0.5)] p-5 shadow-[0_34px_120px_rgba(15,23,42,0.16)] backdrop-blur-[10px] md:min-h-[calc(100svh-3rem)] md:p-8 xl:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(220,230,255,0.52),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(255,246,219,0.5),transparent_25%)]" />

          <div className="relative z-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#f4f6fb] shadow-[0_18px_42px_rgba(31,48,70,0.16)]">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-4xl font-extrabold text-[#0f172a]">
                      {initial}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-2 h-4 w-4 rounded-full border-2 border-white bg-[#23c45e]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#111827]">{displayName}</p>
                  <h1 className="mt-1 text-xl font-extrabold tracking-normal text-[#8a6110]">
                    {role.toUpperCase()}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf2ff] px-4 py-2 text-sm font-semibold text-[#475569]">
                      <DashboardIcon name="dashboard" className="h-4 w-4" />
                      Đã xác minh
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf2ff] px-4 py-2 text-sm font-semibold text-[#475569]">
                      <DashboardIcon name="calendar" className="h-4 w-4" />
                      Hoạt động: 2 giờ trước
                    </span>
                  </div>
                </div>
              </div>

              <div className="group relative flex justify-end">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[#0f172a] transition-colors hover:bg-white/54 focus-visible:bg-white/54 focus-visible:outline-none"
                  aria-label="Cập nhật ảnh đại diện"
                >
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
                </button>
                <div className="pointer-events-none absolute right-0 top-full z-20 mt-3 translate-y-1 whitespace-nowrap rounded-[12px] bg-[#0066cc] px-4 py-2 text-sm font-extrabold text-white opacity-0 shadow-[0_14px_32px_rgba(0,102,204,0.28)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  Cập nhật ảnh đại diện
                  <span className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 bg-[#0066cc]" />
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.7fr)]">
              <section className="rounded-[26px] border border-white/70 bg-white/28 p-6 shadow-[0_24px_70px_rgba(31,48,70,0.1)] backdrop-blur-2xl md:p-8">
                <h2 className="mb-8 flex items-center gap-3 text-base font-extrabold text-[#111827]">
                  <DashboardIcon name="community" className="h-5 w-5" />
                  Thông tin cá nhân
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Họ và Tên" value={displayName || "Admin Grace"} />
                  <Field label="Email" value={email || "admin@example.com"} />
                  <Field label="Số điện thoại" value={phone || "+84 901 234 567"} />
                  <Field label="Vai trò" value={role} />
                  <label className="md:col-span-2">
                    <span className="text-sm font-bold text-[#4b5563]">Tiểu sử</span>
                    <textarea
                      defaultValue="Gần 10 năm kinh nghiệm trong công tác tổ chức cộng đồng và thiện nguyện. Tâm niệm mang lại sự bình an thông qua các hoạt động kết nối tinh thần."
                      rows={5}
                      className="mt-2 w-full resize-y rounded-[12px] border border-[#cfd7e6] bg-white/54 px-4 py-4 text-sm font-semibold leading-7 text-[#111827] outline-none shadow-inner transition-colors focus:border-[#0f172a] focus:bg-white/78"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="mt-8 h-12 rounded-[12px] bg-[#050b18] px-8 text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(5,11,24,0.22)]"
                >
                  Lưu thay đổi
                </button>
              </section>

              <aside className="grid content-start gap-6">
                <section className="rounded-[26px] border border-[#f0b9b3]/70 bg-white/30 p-6 shadow-[0_24px_70px_rgba(31,48,70,0.1)] backdrop-blur-2xl">
                  <h2 className="mb-7 flex items-center gap-3 text-base font-extrabold text-[#111827]">
                    <span className="text-[#dc2626]">
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
                        <path d="M12 3 18 6v5c0 5-3.4 8.3-6 10-2.6-1.7-6-5-6-10V6z" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                      </svg>
                    </span>
                    Bảo mật
                  </h2>

                  <AdminPasswordSecurity />

                </section>

                <section className="rounded-[24px] border border-white/72 bg-white/30 p-6 shadow-[0_20px_54px_rgba(31,48,70,0.1)] backdrop-blur-2xl">
                  <h2 className="text-base font-extrabold text-[#111827]">
                    Phiên đăng nhập
                  </h2>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#64748b]">
                    Quản lý thiết bị, quyền truy cập và trạng thái bảo mật của
                    tài khoản quản trị.
                  </p>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
