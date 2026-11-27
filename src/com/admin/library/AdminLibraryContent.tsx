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
import { adminFetch, formatFileSize, formatVnDate } from "@/com/admin/ui/adminClient";
import AdminResourceForm, { type ResourceFormValues } from "./AdminResourceForm";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_TYPES,
  resourceCategoryLabel,
  resourceTypeClassName,
  type AdminResource,
} from "./adminLibraryData";

const PAGE_SIZE = 10;

export default function AdminLibraryContent({
  initialResources,
  loadError,
  initialCategory,
}: {
  initialResources: AdminResource[];
  loadError: string | null;
  initialCategory: string;
}) {
  const [resources, setResources] = useState(initialResources);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("all");
  const [category, setCategory] = useState(initialCategory);
  const [visibility, setVisibility] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminResource | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyIds, setBusyIds] = useState<number[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter(
      (item) =>
        (!q || `${item.title} ${item.description}`.toLowerCase().includes(q)) &&
        (type === "all" || item.type === type) &&
        (category === "all" || (category === "none" ? !item.category : item.category === category)) &&
        (visibility === "all" || (visibility === "published") === item.isPublished),
    );
  }, [resources, query, type, category, visibility]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalSize = resources.reduce((sum, item) => sum + (item.mediaAssetId ? item.sizeBytes ?? 0 : 0), 0);

  const reset = <T,>(setter: (value: T) => void) => (value: T) => {
    setPage(1);
    setter(value);
  };

  const replace = (resource: AdminResource) =>
    setResources((current) =>
      current.some((item) => item.id === resource.id)
        ? current.map((item) => (item.id === resource.id ? resource : item))
        : [resource, ...current],
    );

  const fail = (title: string, error: unknown) =>
    toast.danger(title, {
      description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      timeout: 4000,
    });

  const save = async (values: ResourceFormValues) => {
    setBusy(true);
    try {
      const isNew = editing === "new";
      const { resource } = await adminFetch<{ resource: AdminResource }>(
        isNew ? "/api/admin/library" : `/api/admin/library/${(editing as AdminResource).id}`,
        { method: isNew ? "POST" : "PATCH", body: values },
      );
      replace(resource);
      setEditing(null);
      toast.success(isNew ? "Đã thêm tài liệu" : "Đã lưu tài liệu", { timeout: 3000 });
    } catch (error) {
      fail("Chưa lưu được", error);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (resource: AdminResource) => {
    setBusy(true);
    try {
      await adminFetch(`/api/admin/library/${resource.id}`, { method: "DELETE" });
      setResources((current) => current.filter((item) => item.id !== resource.id));
      setEditing(null);
      toast.success("Đã xoá tài liệu", { timeout: 3000 });
    } catch (error) {
      fail("Chưa xoá được", error);
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async (resource: AdminResource) => {
    setBusyIds((current) => [...current, resource.id]);
    try {
      const { resource: updated } = await adminFetch<{ resource: AdminResource }>(
        `/api/admin/library/${resource.id}`,
        { method: "PATCH", body: { quick: true, isPublished: !resource.isPublished } },
      );
      replace(updated);
    } catch (error) {
      fail("Chưa cập nhật được", error);
    } finally {
      setBusyIds((current) => current.filter((id) => id !== resource.id));
    }
  };

  return (
    <>
      <AdminPageHeader
        crumb="Thư viện"
        title="Quản lý Thư viện"
        description="Tải lên giáo trình, bài giảng, video và âm thanh cho thư viện của Hội Thánh."
        action={
          <button type="button" onClick={() => setEditing("new")} className={primaryButtonClassName}>
            + Thêm tài liệu
          </button>
        }
      />
      {loadError && <AdminError>{loadError}</AdminError>}

      <AdminStatCards
        items={[
          { label: "Tổng tài liệu", value: resources.length, tone: "blue" },
          { label: "Đang xuất bản", value: resources.filter((item) => item.isPublished).length, tone: "green" },
          { label: "Bản nháp", value: resources.filter((item) => !item.isPublished).length, tone: "gold" },
          { label: "Dung lượng đã tải", value: formatFileSize(totalSize), tone: "slate" },
        ]}
      />

      <AdminToolbar query={query} onQueryChange={reset(setQuery)} placeholder="Tìm theo tên, mô tả…">
        <AdminSelect
          label="Loại"
          value={type}
          onChange={reset(setType)}
          options={[{ value: "all", label: "Mọi loại" }, ...RESOURCE_TYPES.map((value) => ({ value, label: value }))]}
        />
        <AdminSelect
          label="Danh mục"
          value={category}
          onChange={reset(setCategory)}
          options={[
            { value: "all", label: "Mọi danh mục" },
            ...RESOURCE_CATEGORIES.map((item) => ({ value: item.value, label: item.label })),
            { value: "none", label: "Chưa phân loại" },
          ]}
        />
        <AdminSelect
          label="Hiển thị"
          value={visibility}
          onChange={reset(setVisibility)}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "published", label: "Đang xuất bản" },
            { value: "draft", label: "Bản nháp" },
          ]}
        />
      </AdminToolbar>

      <AdminPanel>
        {!pageItems.length ? (
          <AdminEmpty>
            {resources.length
              ? "Không có tài liệu nào khớp bộ lọc."
              : "Thư viện chưa có tài liệu. Bấm “Thêm tài liệu” để tải lên tài liệu đầu tiên."}
          </AdminEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-white/60 text-xs font-black uppercase text-[#7f8796]">
                <tr>
                  <th className="px-5 py-3">Tài liệu</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3">Dung lượng</th>
                  <th className="px-4 py-3">Ngày thêm</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.id} className="border-t border-white/70 align-top hover:bg-white/40">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {item.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumbnailUrl} alt="" className="h-12 w-10 shrink-0 rounded-[8px] object-cover" />
                        ) : (
                          <span className="flex h-12 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#e7edf5] text-[10px] font-black text-[#667085]">
                            {item.type.slice(0, 3).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setEditing(item)}
                            className="text-left font-extrabold text-[#182230] hover:text-[#0066cc]"
                          >
                            {item.title}
                          </button>
                          <p className="mt-1 text-xs font-bold text-[#667085]">
                            {item.isPublished ? "Đang xuất bản" : "Bản nháp"}
                            {item.uploaderName ? ` · ${item.uploaderName}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Pill className={resourceTypeClassName[item.type]}>{item.type}</Pill>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-[#344054]">{resourceCategoryLabel(item.category)}</td>
                    <td className="px-4 py-4 text-xs font-bold text-[#344054]">
                      {item.mediaAssetId ? formatFileSize(item.sizeBytes) : "Liên kết ngoài"}
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-[#344054]">{formatVnDate(item.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" onClick={() => setEditing(item)} className={smallButtonClassName}>
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={busyIds.includes(item.id)}
                          onClick={() => togglePublished(item)}
                          className={smallButtonClassName}
                        >
                          {item.isPublished ? "Ẩn" : "Xuất bản"}
                        </button>
                        {item.isPublished ? (
                          <Link href={`/library/${item.id}`} target="_blank" className={`${smallButtonClassName} no-underline`}>
                            Xem
                          </Link>
                        ) : (
                          item.url && (
                            <a href={item.url} target="_blank" rel="noreferrer" className={`${smallButtonClassName} no-underline`}>
                              Mở file
                            </a>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 text-xs font-bold text-[#667085] sm:flex-row">
        <span>
          {filtered.length} / {resources.length} tài liệu
        </span>
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {editing && (
        <AdminResourceForm
          key={editing === "new" ? "new" : editing.id}
          resource={editing === "new" ? null : editing}
          defaultCategory={category !== "all" && category !== "none" ? category : null}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={save}
          onDelete={editing === "new" ? undefined : () => remove(editing)}
        />
      )}
    </>
  );
}
