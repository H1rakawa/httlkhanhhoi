import { describe, expect, it } from "vitest";
import { pageItems } from "@/com/lib/Pagination";

describe("pageItems", () => {
  it("hiện đủ trang khi ít trang", () => {
    expect(pageItems(1, 5, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("giữ trang đầu, trang cuối và cửa sổ quanh trang hiện tại", () => {
    expect(pageItems(10, 20, 5)).toEqual([1, "gap", 8, 9, 10, 11, 12, "gap", 20]);
  });

  it("không có khoảng trống thừa ở đầu danh sách", () => {
    expect(pageItems(1, 20, 5)).toEqual([1, 2, 3, 4, 5, 6, "gap", 20]);
  });

  it("không có khoảng trống thừa ở cuối danh sách", () => {
    expect(pageItems(20, 20, 5)).toEqual([1, "gap", 15, 16, 17, 18, 19, 20]);
  });
});
