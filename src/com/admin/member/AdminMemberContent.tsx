"use client";

import { toast } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "@/com/admin/AdminSidebar";
import AdminMemberBulkBar from "@/com/admin/member/AdminMemberBulkBar";
import AdminMemberFilters from "@/com/admin/member/AdminMemberFilters";
import AdminMemberHeader from "@/com/admin/member/AdminMemberHeader";
import AdminMemberTable from "@/com/admin/member/AdminMemberTable";
import type { MemberRowAction } from "@/com/admin/member/AdminMemberMenus";
import { AdminConfirmDialog } from "@/com/admin/ui/AdminUi";
import { adminFetch } from "@/com/admin/ui/adminClient";
import { isStaffRole, ROLE_LABELS } from "@/lib/roles";
import { isMinistry, MINISTRY_LABELS, type Ministry } from "@/lib/ministries";
import {
  mapProfileToAdminMember,
  type AdminMember,
  type AdminMembersResponse,
  type MemberRole,
} from "@/com/admin/member/memberData";

type AdminMemberContentProps = {
  adminId: string;
  displayName: string;
  avatarUrl: string | null;
  viewerRole?: string | null;
};

const PAGE_SIZE = 12;

type PendingAction =
  | { kind: "role"; members: AdminMember[]; role: MemberRole }
  | { kind: "delete"; members: AdminMember[] }
  | { kind: Exclude<MemberRowAction, "delete">; member: AdminMember };

function describeTargets(members: AdminMember[]) {
  return members.length === 1 ? members[0].name : `${members.length} thành viên`;
}

/** Nội dung hộp xác nhận cho từng loại thao tác. */
function confirmCopy(action: PendingAction) {
  switch (action.kind) {
    case "role": {
      const next = ROLE_LABELS[action.role];
      const single = action.members.length === 1 ? action.members[0] : null;
      const gainsAdmin = isStaffRole(action.role) && action.members.some((member) => !isStaffRole(member.role));
      const losesAdmin = !isStaffRole(action.role) && action.members.some((member) => isStaffRole(member.role));
      return {
        title: "Xác nhận đổi vai trò",
        confirmLabel: `Đổi thành ${next}`,
        tone: "primary" as const,
        body: (
          <>
            <p>
              {single ? (
                <>
                  Đổi vai trò của <strong className="text-[#0f172a]">{single.name}</strong> từ{" "}
                  <strong className="text-[#0f172a]">{ROLE_LABELS[single.role]}</strong> thành{" "}
                  <strong className="text-[#0f172a]">{next}</strong>?
                </>
              ) : (
                <>
                  Đổi vai trò của <strong className="text-[#0f172a]">{action.members.length} thành viên</strong> thành{" "}
                  <strong className="text-[#0f172a]">{next}</strong>?
                </>
              )}
            </p>
            {action.role === "admin" && (
              <p className="mt-3 rounded-[14px] bg-[#fff6e5] px-3.5 py-2.5 text-[#93370d]">
                Quản trị viên có toàn quyền, kể cả đổi vai trò và xoá thành viên khác.
              </p>
            )}
            {action.role !== "admin" && gainsAdmin && (
              <p className="mt-3 rounded-[14px] bg-[#eef6ff] px-3.5 py-2.5 text-[#1d4f91]">
                Vai trò này được vào trang quản trị (trừ quản lý thành viên).
              </p>
            )}
            {losesAdmin && (
              <p className="mt-3 rounded-[14px] bg-[#fff6e5] px-3.5 py-2.5 text-[#93370d]">
                Người này sẽ không còn vào được trang quản trị.
              </p>
            )}
          </>
        ),
      };
    }
    case "delete":
      return {
        title: "Xoá thành viên",
        confirmLabel: "Xoá vĩnh viễn",
        tone: "danger" as const,
        body: (
          <p>
            Xoá vĩnh viễn <strong className="text-[#0f172a]">{describeTargets(action.members)}</strong> cùng tài khoản
            đăng nhập? Thao tác này không hoàn tác được.
          </p>
        ),
      };
    case "block":
      return {
        title: "Khoá tài khoản",
        confirmLabel: "Khoá tài khoản",
        tone: "danger" as const,
        body: (
          <p>
            <strong className="text-[#0f172a]">{action.member.name}</strong> sẽ không đăng nhập được cho tới khi được mở
            khoá. Dữ liệu của người này vẫn được giữ nguyên.
          </p>
        ),
      };
    case "unblock":
      return {
        title: "Mở khoá tài khoản",
        confirmLabel: "Mở khoá",
        tone: "primary" as const,
        body: (
          <p>
            Cho phép <strong className="text-[#0f172a]">{action.member.name}</strong> đăng nhập lại?
          </p>
        ),
      };
    case "reset-password":
      return {
        title: "Gửi email đặt lại mật khẩu",
        confirmLabel: "Gửi email",
        tone: "primary" as const,
        body: (
          <p>
            Gửi liên kết đặt lại mật khẩu tới <strong className="text-[#0f172a]">{action.member.email}</strong>?
          </p>
        ),
      };
  }
}

export default function AdminMemberContent({
  adminId,
  displayName,
  avatarUrl,
  viewerRole,
}: AdminMemberContentProps) {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"" | MemberRole>("");
  const [ministry, setMinistry] = useState<"" | Ministry>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (query.trim()) params.set("q", query.trim());
    if (role) params.set("role", role);
    if (ministry) params.set("ministry", ministry);

    try {
      const response = await fetch(`/api/admin/members?${params.toString()}`, {
        cache: "no-store",
        signal,
      });
      const data = (await response.json()) as AdminMembersResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Không thể tải danh sách thành viên.");
      }

      setMembers(data.members.map(mapProfileToAdminMember));
      setTotal(data.total);
      setSelectedIds([]);
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return;
      }
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Không thể tải danh sách thành viên.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, query, role, ministry]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => loadMembers(controller.signal),
      180,
    );

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loadMembers]);

  const toggleMember = (memberId: string) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(memberId)
        ? currentIds.filter((id) => id !== memberId)
        : [...currentIds, memberId],
    );
  };

  const toggleAllMembers = () => {
    setSelectedIds((currentIds) =>
      currentIds.length === members.length
        ? []
        : members.map((member) => member.id),
    );
  };

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const closePending = useCallback(() => setPending(null), []);

  const requestRole = (targets: AdminMember[], nextRole: MemberRole) => {
    const changing = targets.filter((member) => member.role !== nextRole);
    if (!changing.length) {
      toast.info(`Đã là ${ROLE_LABELS[nextRole]}`, { timeout: 2500 });
      return;
    }
    setPending({ kind: "role", members: changing, role: nextRole });
  };

  const requestAction = (member: AdminMember, action: MemberRowAction) => {
    setPending(action === "delete" ? { kind: "delete", members: [member] } : { kind: action, member });
  };

  const runPending = async () => {
    if (!pending) return;
    setIsRunning(true);
    try {
      let message: string;
      if (pending.kind === "role") {
        await adminFetch("/api/admin/members", {
          method: "PATCH",
          body: { ids: pending.members.map((member) => member.id), role: pending.role },
        });
        message = `Đã đổi vai trò của ${describeTargets(pending.members)} thành ${ROLE_LABELS[pending.role]}`;
      } else if (pending.kind === "delete") {
        await adminFetch("/api/admin/members", {
          method: "DELETE",
          body: { ids: pending.members.map((member) => member.id) },
        });
        message = `Đã xoá ${describeTargets(pending.members)}`;
      } else {
        const result = await adminFetch<{ message?: string }>(
          `/api/admin/members/${pending.member.id}`,
          { method: "POST", body: { action: pending.kind } },
        );
        message =
          result.message ||
          (pending.kind === "block"
            ? `Đã khoá tài khoản ${pending.member.name}`
            : `Đã mở khoá tài khoản ${pending.member.name}`);
      }
      toast.success(message, { timeout: 3500 });
      setPending(null);
      await loadMembers();
    } catch (actionError) {
      toast.danger("Chưa thực hiện được", {
        description: actionError instanceof Error ? actionError.message : "Vui lòng thử lại.",
        timeout: 5000,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const saveMinistries = async (member: AdminMember, ministries: Ministry[]) => {
    try {
      const result = await adminFetch<{ ministries: string[] }>(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        body: { ministries },
      });
      const saved = result.ministries.filter(isMinistry);
      setMembers((current) =>
        current.map((item) => (item.id === member.id ? { ...item, ministries: saved } : item)),
      );
      toast.success(`Đã cập nhật ban ngành của ${member.name}`, {
        description: saved.length ? saved.map((item) => MINISTRY_LABELS[item]).join(", ") : "Không thuộc ban nào",
        timeout: 3500,
      });
      return true;
    } catch (saveError) {
      toast.danger("Chưa lưu được ban ngành", {
        description: saveError instanceof Error ? saveError.message : "Vui lòng thử lại.",
        timeout: 5000,
      });
      return false;
    }
  };

  const selectedMembers = members.filter((member) => selectedIds.includes(member.id));
  const confirm = pending ? confirmCopy(pending) : null;

  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-[auto_minmax(0,1fr)] gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-5 md:py-5 lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[268px_minmax(0,1fr)]">
      <AdminSidebar
        adminId={adminId}
        displayName={displayName}
        avatarUrl={avatarUrl}
        role={viewerRole}
        activeHref="/admin/member"
      />

      <section className="min-w-0">
        <div className="relative min-h-[calc(100svh-1.5rem)] overflow-hidden rounded-[24px] border border-white/72 bg-[rgba(244,248,255,0.46)] p-3 shadow-[0_34px_120px_rgba(15,23,42,0.14)] backdrop-blur-[10px] sm:rounded-[28px] sm:p-4 md:min-h-[calc(100svh-2.5rem)] md:p-6 lg:min-h-[calc(100svh-3rem)] lg:rounded-[30px] lg:p-8 xl:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(220,230,255,0.56),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(255,247,219,0.52),transparent_24%)]" />
          <div className="relative z-10">
            <AdminMemberHeader onMemberCreated={() => loadMembers()} />
            <AdminMemberFilters
              query={query}
              role={role}
              ministry={ministry}
              onMinistryChange={(value) => {
                setPage(1);
                setMinistry(value);
              }}
              onQueryChange={(value) => {
                setPage(1);
                setQuery(value);
              }}
              onRoleChange={(value) => {
                setPage(1);
                setRole(value);
              }}
            />
            {error && (
              <div className="mt-5 rounded-2xl border border-[#fecaca] bg-[#fff1f0]/70 px-5 py-4 text-sm font-bold text-[#dc2626]">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="liquid-glass mt-6 rounded-[24px] p-8 text-center text-sm font-extrabold text-[#64748b] lg:mt-7 lg:rounded-[28px] lg:p-10">
                Đang tải danh sách thành viên...
              </div>
            ) : (
              <AdminMemberTable
                members={members}
                currentUserId={adminId}
                selectedIds={selectedIds}
                onToggleMember={toggleMember}
                onToggleAll={toggleAllMembers}
                onPickRole={requestRole}
                onSaveMinistries={saveMinistries}
                onAction={requestAction}
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            )}
            <AdminMemberBulkBar
              selectedCount={selectedIds.length}
              includesSelf={selectedIds.includes(adminId)}
              onPickRole={(nextRole) => requestRole(selectedMembers, nextRole)}
              onDelete={() => setPending({ kind: "delete", members: selectedMembers })}
            />
            {confirm && (
              <AdminConfirmDialog
                title={confirm.title}
                confirmLabel={confirm.confirmLabel}
                tone={confirm.tone}
                busy={isRunning}
                onConfirm={runPending}
                onClose={closePending}
              >
                {confirm.body}
              </AdminConfirmDialog>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
