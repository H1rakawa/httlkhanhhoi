import type {
  MemberRole,
  MemberStatus,
} from "@/com/admin/member/memberData";

type AdminMemberFiltersProps = {
  query: string;
  role: "" | MemberRole;
  status: "" | MemberStatus;
  onQueryChange: (value: string) => void;
  onRoleChange: (value: "" | MemberRole) => void;
  onStatusChange: (value: "" | MemberStatus) => void;
};

export default function AdminMemberFilters({
  query,
  role,
  status,
  onQueryChange,
  onRoleChange,
  onStatusChange,
}: AdminMemberFiltersProps) {
  return (
    <section className="liquid-glass mt-8 grid gap-3 rounded-[24px] p-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
      <label className="flex h-12 items-center gap-3 rounded-[16px] bg-white/58 px-4 text-[#6b7280] shadow-inner">
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
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tìm kiếm theo tên, email..."
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#111827] outline-none placeholder:text-[#8994a3]"
        />
      </label>

      <select
        value={role}
        onChange={(event) => onRoleChange(event.target.value as "" | MemberRole)}
        className="h-12 rounded-[16px] bg-white/64 px-5 text-sm font-extrabold text-[#3f4750] shadow-inner outline-none"
        aria-label="Lọc theo vai trò"
      >
        <option value="">Tất cả vai trò</option>
        <option value="admin">Quản trị viên</option>
        <option value="teacher">Giáo viên</option>
        <option value="member">Thành viên</option>
      </select>

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as "" | MemberStatus)
        }
        className="h-12 rounded-[16px] bg-white/64 px-5 text-sm font-extrabold text-[#3f4750] shadow-inner outline-none"
        aria-label="Lọc theo trạng thái"
      >
        <option value="">Trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="inactive">Không hoạt động</option>
        <option value="blocked">Đã khóa</option>
      </select>
    </section>
  );
}
