"use client";

import { toast } from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import Pagination from "@/com/lib/Pagination";
import {
  AdminEmpty,
  AdminError,
  AdminPageHeader,
  AdminPanel,
  AdminSelect,
  AdminStatCards,
  AdminToolbar,
  Pill,
  primaryButtonClassName,
  smallButtonClassName,
} from "@/com/admin/ui/AdminUi";
import { adminFetch, formatVnDate } from "@/com/admin/ui/adminClient";
import AdminNewsForm, { type NewsFormValues } from "./AdminNewsForm";
import {
  NEWS_CATEGORIES,
  NEWS_STATUS_LABELS,
  newsStatusClassName,
  type AdminNewsPost,
  type AdminNewsStatus,
} from "./adminNewsData";

const PAGE_SIZE = 10;

export default function AdminNewsContent({
  initialPosts,
  loadError,
}: {
  initialPosts: AdminNewsPost[];
  loadError: string | null;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<"all" | AdminNewsStatus>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminNewsPost | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyIds, setBusyIds] = useState<number[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts
      .filter(
        (post) =>
          (!q || `${post.title} ${post.excerpt} ${post.authorName}`.toLowerCase().includes(q)) &&
          (category === "all" || post.category === category) &&
          (status === "all" || post.status === status),
      )
      .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
  }, [posts, query, category, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const reset = <T,>(setter: (value: T) => void) => (value: T) => {
    setPage(1);
    setter(value);
  };

  const replace = (post: AdminNewsPost) =>
    setPosts((current) =>
      current.some((item) => item.id === post.id)
        ? current.map((item) => (item.id === post.id ? post : item))
        : [post, ...current],
    );

  const fail = (title: string, error: unknown) =>
    toast.danger(title, {
      description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      timeout: 4000,
    });

  const save = async (values: NewsFormValues) => {
    setBusy(true);
    try {
      const isNew = editing === "new";
      const { post } = await adminFetch<{ post: AdminNewsPost }>(
        isNew ? "/api/admin/news" : `/api/admin/news/${(editing as AdminNewsPost).id}`,
        { method: isNew ? "POST" : "PATCH", body: values },
      );
      replace(post);
      setEditing(null);
      toast.success(post.status === "published" ? "Đã lưu và đăng bài" : "Đã lưu bài viết", { timeout: 3000 });
    } catch (error) {
      fail("Chưa lưu được", error);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (post: AdminNewsPost) => {
    setBusy(true);
    try {
      await adminFetch(`/api/admin/news/${post.id}`, { method: "DELETE" });
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setEditing(null);
      toast.success("Đã xoá bài viết", { timeout: 3000 });
    } catch (error) {
      fail("Chưa xoá được", error);
    } finally {
      setBusy(false);
    }
  };

  const quick = async (post: AdminNewsPost, patch: { status?: AdminNewsStatus; featured?: boolean }) => {
    setBusyIds((current) => [...current, post.id]);
    try {
      const { post: updated } = await adminFetch<{ post: AdminNewsPost }>(`/api/admin/news/${post.id}`, {
        method: "PATCH",
        body: { quick: true, ...patch },
      });
      replace(updated);
    } catch (error) {
      fail("Chưa cập nhật được", error);
    } finally {
      setBusyIds((current) => current.filter((id) => id !== post.id));
    }
  };

  return (
    <>
      <AdminPageHeader
        crumb="Tin tức"
        title="Quản lý Tin tức"
        description="Viết, đăng và lưu trữ tin tức, thông báo và bài chia sẻ hiển thị ở trang /news."
        action={
          <button type="button" onClick={() => setEditing("new")} className={primaryButtonClassName}>
            + Viết bài mới
          </button>
        }
      />
      {loadError && <AdminError>{loadError}</AdminError>}

      <AdminStatCards
        items={[
          { label: "Tổng bài viết", value: posts.length, tone: "blue" },
          { label: "Đã đăng", value: posts.filter((post) => post.status === "published").length, tone: "green" },
          { label: "Bản nháp", value: posts.filter((post) => post.status === "draft").length, tone: "gold" },
          {
            label: "Tin nổi bật",
            value: posts.filter((post) => post.featured && post.status === "published").length,
            tone: "slate",
          },
        ]}
      />

      <AdminToolbar query={query} onQueryChange={reset(setQuery)} placeholder="Tìm theo tiêu đề, tóm tắt, tác giả…">
        <AdminSelect
          label="Chuyên mục"
          value={category}
          onChange={reset(setCategory)}
          options={[{ value: "all", label: "Mọi chuyên mục" }, ...NEWS_CATEGORIES.map((value) => ({ value, label: value }))]}
        />
        <AdminSelect
          label="Trạng thái"
          value={status}
          onChange={reset(setStatus)}
          options={[
            { value: "all", label: "Mọi trạng thái" },
            ...(Object.keys(NEWS_STATUS_LABELS) as AdminNewsStatus[]).map((value) => ({
              value,
              label: NEWS_STATUS_LABELS[value],
            })),
          ]}
        />
      </AdminToolbar>

      <AdminPanel>
        {!pageItems.length ? (
          <AdminEmpty>
            {posts.length ? "Không có bài viết nào khớp bộ lọc." : "Chưa có bài viết. Bấm “Viết bài mới” để bắt đầu."}
          </AdminEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-white/60 text-xs font-black uppercase text-[#7f8796]">
                <tr>
                  <th className="px-5 py-3">Bài viết</th>
                  <th className="px-4 py-3">Chuyên mục</th>
                  <th className="px-4 py-3">Ngày đăng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((post) => {
                  const rowBusy = busyIds.includes(post.id);
                  return (
                    <tr key={post.id} className="border-t border-white/70 align-top hover:bg-white/40">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          {post.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.photoUrl} alt="" className="h-12 w-16 shrink-0 rounded-[10px] object-cover" />
                          ) : (
                            <span className="h-12 w-16 shrink-0 rounded-[10px] bg-[#e7edf5]" />
                          )}
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setEditing(post)}
                              className="text-left font-extrabold text-[#182230] hover:text-[#0066cc]"
                            >
                              {post.title}
                              {post.featured && <span className="ml-2 text-xs text-[#c28a00]">★ Nổi bật</span>}
                            </button>
                            <p className="mt-1 line-clamp-1 text-xs font-bold text-[#667085]">
                              {post.authorName} · {post.excerpt}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-[#344054]">{post.category}</td>
                      <td className="px-4 py-4 text-xs font-bold text-[#344054]">
                        {post.publishedAt ? formatVnDate(post.publishedAt) : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <Pill className={newsStatusClassName[post.status]}>{NEWS_STATUS_LABELS[post.status]}</Pill>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button type="button" onClick={() => setEditing(post)} className={smallButtonClassName}>
                            Sửa
                          </button>
                          {post.status === "published" ? (
                            <button type="button" disabled={rowBusy} onClick={() => quick(post, { status: "archived" })} className={smallButtonClassName}>
                              Lưu trữ
                            </button>
                          ) : (
                            <button type="button" disabled={rowBusy} onClick={() => quick(post, { status: "published" })} className={smallButtonClassName}>
                              Đăng
                            </button>
                          )}
                          <button type="button" disabled={rowBusy} onClick={() => quick(post, { featured: !post.featured })} className={smallButtonClassName}>
                            {post.featured ? "Bỏ nổi bật" : "Nổi bật"}
                          </button>
                          {post.status === "published" && (
                            <Link href={`/news/${post.slug}`} target="_blank" className={`${smallButtonClassName} no-underline`}>
                              Xem
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 text-xs font-bold text-[#667085] sm:flex-row">
        <span>
          {filtered.length} / {posts.length} bài viết
        </span>
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {editing && (
        <AdminNewsForm
          key={editing === "new" ? "new" : editing.id}
          post={editing === "new" ? null : editing}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={save}
          onDelete={editing === "new" ? undefined : () => remove(editing)}
        />
      )}
    </>
  );
}
