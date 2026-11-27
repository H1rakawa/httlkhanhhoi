import { describe, expect, it } from "vitest";
import { tokenExpiresAt } from "@/proxy";

const encode = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

describe("tokenExpiresAt", () => {
  it("đọc exp trong JWT", () => {
    const token = `${encode({ alg: "HS256" })}.${encode({ exp: 1_900_000_000, sub: "u" })}.sig`;
    expect(tokenExpiresAt(token)).toBe(1_900_000_000);
  });

  it("trả 0 với token hỏng để proxy làm mới phiên", () => {
    expect(tokenExpiresAt("khong-phai-jwt")).toBe(0);
    expect(tokenExpiresAt("a.@@@.c")).toBe(0);
  });
});
