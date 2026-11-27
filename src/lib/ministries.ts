/**
 * Ban ngành của Hội Thánh (khớp ràng buộc profiles_ministries_valid). Một thành viên có thể thuộc
 * nhiều ban. Thêm ban mới: thêm ở đây và cập nhật ràng buộc bằng migration.
 */
export const MINISTRIES = [
  "thieu_nhi",
  "thieu_nien",
  "thanh_nien",
  "thanh_trang",
  "trang_nien",
  "trung_nien",
  "lao_nien",
  "phu_nu",
  "dan",
  "am_thanh",
  "may_chieu",
  "giu_xe",
  "cam_hoa",
] as const;

export type Ministry = (typeof MINISTRIES)[number];

export const MINISTRY_LABELS: Record<Ministry, string> = {
  thieu_nhi: "Ban Thiếu nhi",
  thieu_nien: "Ban Thiếu niên",
  thanh_nien: "Ban Thanh niên",
  thanh_trang: "Ban Thanh tráng",
  trang_nien: "Ban Tráng niên",
  trung_nien: "Ban Trung niên",
  lao_nien: "Ban Lão niên",
  phu_nu: "Ban Phụ nữ",
  dan: "Ban Đàn",
  am_thanh: "Ban Âm thanh",
  may_chieu: "Ban Máy chiếu",
  giu_xe: "Ban Giữ xe",
  cam_hoa: "Ban Cắm hoa",
};

export function isMinistry(value: unknown): value is Ministry {
  return typeof value === "string" && (MINISTRIES as readonly string[]).includes(value);
}

/** Lọc giá trị hợp lệ, bỏ trùng và giữ đúng thứ tự trong MINISTRIES. */
export function normalizeMinistries(value: unknown): Ministry[] {
  if (!Array.isArray(value)) return [];
  const picked = new Set(value.filter(isMinistry));
  return MINISTRIES.filter((ministry) => picked.has(ministry));
}
