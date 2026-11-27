"use client";

/** Lỗi ở chính layout gốc: thay toàn bộ trang nên phải tự có <html> và <body>. */
export default function GlobalError({ unstable_retry }: { error: Error; unstable_retry: () => void }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#f2f4f8" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 24 }}>Đã có lỗi xảy ra</h1>
          <p style={{ color: "#66717e" }}>Vui lòng thử lại sau ít phút.</p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{ marginTop: 16, padding: "12px 24px", borderRadius: 14, border: 0, background: "#0066cc", color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
