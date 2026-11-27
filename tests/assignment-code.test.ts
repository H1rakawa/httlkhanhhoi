import { describe, expect, it } from "vitest";
import { assignmentCode, assignmentHref } from "@/com/assignment/assignmentData";
import { parseAttachment, parseDueDate } from "@/lib/admin/exams";

describe("mã và đường dẫn bài tập", () => {
  it("dùng mã nhập tay, chưa có thì HW-xxx", () => {
    expect(assignmentCode(9, "230")).toBe("230");
    expect(assignmentCode(9, "  ")).toBe("HW-009");
    expect(assignmentCode(9, null)).toBe("HW-009");
  });

  it("mã hoá đường dẫn và thêm /result khi cần", () => {
    expect(assignmentHref({ id: "230" })).toBe("/assignment/230");
    expect(assignmentHref({ id: "BH 01/A" }, true)).toBe("/assignment/BH%2001%2FA/result");
  });
});

describe("hạn nộp và file đính kèm", () => {
  it("kiểm tra hạn nộp", () => {
    expect(parseDueDate("")).toBeNull();
    expect(parseDueDate("2026-12-01")).toBe("2026-12-01");
    expect(() => parseDueDate("01/12/2026")).toThrow();
  });

  it("ưu tiên file đã tải lên, sau đó tới đường dẫn http(s)", () => {
    const id = "123e4567-e89b-42d3-a456-426614174000";
    expect(parseAttachment({ mediaAssetId: id, attachmentUrl: "https://x.y" })).toEqual({
      media_asset_id: id,
      attachment_url: null,
    });
    expect(parseAttachment({ attachmentUrl: "https://drive.google.com/a" }).attachment_url).toBe(
      "https://drive.google.com/a",
    );
    expect(parseAttachment({})).toEqual({ media_asset_id: null, attachment_url: null });
    expect(() => parseAttachment({ attachmentUrl: "javascript:alert(1)" })).toThrow();
  });
});
