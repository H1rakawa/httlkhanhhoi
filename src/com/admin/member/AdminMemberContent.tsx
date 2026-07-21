"use client";

import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "@/com/admin/AdminSidebar";
import AdminMemberBulkBar from "@/com/admin/member/AdminMemberBulkBar";
import AdminMemberFilters from "@/com/admin/member/AdminMemberFilters";
import AdminMemberHeader from "@/com/admin/member/AdminMemberHeader";
import AdminMemberTable from "@/com/admin/member/AdminMemberTable";
import {
  mapProfileToAdminMember,
  type AdminMember,
  type AdminMembersResponse,
  type MemberRole,
  type MemberStatus,
} from "@/com/admin/member/memberData";

type AdminMemberContentProps = {
  adminId: string;
  displayName: string;
  avatarUrl: string | null;
};

const PAGE_SIZE = 12;

export default function AdminMemberContent({
  adminId,
  displayName,
  avatarUrl,
}: AdminMemberContentProps) {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"" | MemberRole>("");
  const [status, setStatus] = useState<"" | MemberStatus>("");
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
    if (status) params.set("status", status);

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
  }, [page, query, role, status]);

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

  const patchMembers = async (
    ids: string[],
    payload: { role?: MemberRole; status?: MemberStatus },
  ) => {
    if (!ids.length) return;

    const response = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, ...payload }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(data.error || "Không thể cập nhật thành viên.");
      return;
    }
    await loadMembers();
  };

  const deleteMembers = async (ids: string[]) => {
    if (!ids.length) return;

    const response = await fetch("/api/admin/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(data.error || "Không thể xóa thành viên.");
      return;
    }
    await loadMembers();
  };

  const changeRole = (ids: string[]) => {
    const nextRole = window.prompt(
      "Nhập vai trò mới: member, teacher hoặc admin",
      "member",
    ) as MemberRole | null;

    if (!nextRole) return;
    if (!["member", "teacher", "admin"].includes(nextRole)) {
      setError("Vai trò không hợp lệ. Vui lòng dùng member, teacher hoặc admin.");
      return;
    }

    patchMembers(ids, { role: nextRole });
  };

  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] gap-5 px-4 py-4 md:gap-6 md:px-6 md:py-6 lg:grid-cols-[244px_minmax(0,1fr)] xl:grid-cols-[268px_minmax(0,1fr)]">
      <AdminSidebar
        adminId={adminId}
        displayName={displayName}
        avatarUrl={avatarUrl}
        activeHref="/admin/member"
      />

      <section className="min-w-0">
        <div className="relative min-h-[calc(100svh-2rem)] overflow-hidden rounded-[30px] border border-white/72 bg-[rgba(244,248,255,0.46)] p-5 shadow-[0_34px_120px_rgba(15,23,42,0.14)] backdrop-blur-[10px] md:min-h-[calc(100svh-3rem)] md:p-8 xl:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(220,230,255,0.56),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(255,247,219,0.52),transparent_24%)]" />
          <div className="relative z-10">
            <AdminMemberHeader onMemberCreated={() => loadMembers()} />
            <AdminMemberFilters
              query={query}
              role={role}
              status={status}
              onQueryChange={(value) => {
                setPage(1);
                setQuery(value);
              }}
              onRoleChange={(value) => {
                setPage(1);
                setRole(value);
              }}
              onStatusChange={(value) => {
                setPage(1);
                setStatus(value);
              }}
            />
            {error && (
              <div className="mt-5 rounded-2xl border border-[#fecaca] bg-[#fff1f0]/70 px-5 py-4 text-sm font-bold text-[#dc2626]">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="liquid-glass mt-7 rounded-[28px] p-10 text-center text-sm font-extrabold text-[#64748b]">
                Đang tải danh sách thành viên...
              </div>
            ) : (
              <AdminMemberTable
                members={members}
                selectedIds={selectedIds}
                onToggleMember={toggleMember}
                onToggleAll={toggleAllMembers}
                onChangeRole={changeRole}
                onDeleteMember={deleteMembers}
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            )}
            <AdminMemberBulkBar
              selectedCount={selectedIds.length}
              total={total}
              showingCount={members.length}
              showingFrom={members.length ? (page - 1) * PAGE_SIZE + 1 : 0}
              showingTo={(page - 1) * PAGE_SIZE + members.length}
              onChangeRole={() => changeRole(selectedIds)}
              onLock={() => patchMembers(selectedIds, { status: "blocked" })}
              onDelete={() => deleteMembers(selectedIds)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
