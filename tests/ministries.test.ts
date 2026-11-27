import { describe, expect, it } from "vitest";
import { MINISTRIES, MINISTRY_LABELS, normalizeMinistries } from "@/lib/ministries";

describe("ban ngành", () => {
  it("có đủ 13 ban", () => {
    expect(MINISTRIES).toHaveLength(13);
    expect(MINISTRY_LABELS.giu_xe).toBe("Ban Giữ xe");
  });

  it("lọc giá trị lạ, bỏ trùng và giữ thứ tự chuẩn", () => {
    expect(normalizeMinistries(["cam_hoa", "dan", "x", "dan", 3, "thieu_nhi"])).toEqual([
      "thieu_nhi",
      "dan",
      "cam_hoa",
    ]);
    expect(normalizeMinistries("dan")).toEqual([]);
  });
});
