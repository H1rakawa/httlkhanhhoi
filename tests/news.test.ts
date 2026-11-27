import { describe, expect, it } from "vitest";
import { isAllowedNewsPhoto, slugify } from "@/com/admin/news/adminNewsData";

describe("slugify", () => {
  it("bỏ dấu tiếng Việt và chữ đ", () => {
    expect(slugify("Lễ Kỷ Niệm 10 Năm Đền Thờ")).toBe("le-ky-niem-10-nam-den-tho");
  });

  it("gộp ký tự đặc biệt và cắt gạch ở hai đầu", () => {
    expect(slugify("  --Thông báo!!! (mới)--  ")).toBe("thong-bao-moi");
  });

  it("giới hạn 100 ký tự", () => {
    expect(slugify("a".repeat(150))).toHaveLength(100);
  });
});

describe("isAllowedNewsPhoto", () => {
  it("chỉ nhận https từ các host đã khai báo cho next/image", () => {
    expect(isAllowedNewsPhoto("https://images.unsplash.com/photo-1")).toBe(true);
    expect(isAllowedNewsPhoto("http://images.unsplash.com/photo-1")).toBe(false);
    expect(isAllowedNewsPhoto("https://example.com/a.jpg")).toBe(false);
    expect(isAllowedNewsPhoto("không phải url")).toBe(false);
  });
});
