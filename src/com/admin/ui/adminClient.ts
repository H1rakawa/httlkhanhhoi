/** Tiện ích phía trình duyệt cho các trang quản trị. */

export type UploadedAsset = {
  id: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  kind: "image" | "video" | "audio" | "document";
  fileName: string;
};

export async function adminFetch<T>(url: string, init?: { method?: string; body?: unknown }) {
  const response = await fetch(url, {
    method: init?.method ?? "GET",
    headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Thao tác không thành công.");
  return data;
}

function putWithProgress(
  url: string,
  apikey: string,
  file: File,
  onProgress?: (percent: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("apikey", apikey);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error("Tải file lên Storage không thành công."));
    xhr.onerror = () => reject(new Error("Mất kết nối khi tải file."));
    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("", file);
    xhr.send(form);
  });
}

/** Xin đường dẫn có chữ ký → tải thẳng lên Storage → ghi media_assets. */
export async function uploadAdminFile(
  file: File,
  relatedTable: string,
  onProgress?: (percent: number) => void,
) {
  const sign = await adminFetch<{
    bucket: string;
    objectPath: string;
    uploadUrl: string;
    apikey: string;
  }>("/api/admin/media", {
    method: "POST",
    body: { action: "sign", fileName: file.name, mimeType: file.type, size: file.size },
  });
  await putWithProgress(sign.uploadUrl, sign.apikey, file, onProgress);
  const { asset } = await adminFetch<{ asset: UploadedAsset }>("/api/admin/media", {
    method: "POST",
    body: {
      action: "register",
      bucket: sign.bucket,
      objectPath: sign.objectPath,
      fileName: file.name,
      relatedTable,
    },
  });
  return asset;
}

const VN_TIME_ZONE = "Asia/Ho_Chi_Minh";

/** ISO → "YYYY-MM-DDTHH:mm" theo giờ Việt Nam (cho input datetime-local). */
export function toVnInputValue(iso: string | null | undefined) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** "YYYY-MM-DDTHH:mm" (giờ Việt Nam) → ISO có múi giờ +07:00. */
export function fromVnInputValue(value: string) {
  return value ? `${value}:00+07:00` : null;
}

export function formatVnDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatVnDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 || value >= 100 ? 0 : 1)} ${units[index]}`;
}

/** Xuất CSV (có BOM để Excel đọc đúng tiếng Việt). */
export function downloadCsv(fileName: string, rows: Array<Array<string | number | null>>) {
  const escape = (value: string | number | null) => {
    const text = value == null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
