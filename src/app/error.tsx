"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Lỗi khi render (vd: Supabase tạm thời không phản hồi): cho người dùng thử lại thay vì trang lỗi mặc định. */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#f2f4f8] px-5 py-20 text-[#111827]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_16%,rgba(255,246,219,0.58),transparent_26%),radial-gradient(circle_at_18%_78%,rgba(208,221,255,0.45),transparent_25%)]" />
      <div className="liquid-glass relative w-full max-w-[560px] rounded-[30px] px-8 py-12 text-center shadow-[0_34px_110px_rgba(31,48,70,0.16)] md:px-14">
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-[#15171d] md:text-3xl">
          Đã có lỗi xảy ra
        </h1>
        <p className="mx-auto mt-5 max-w-[380px] text-sm font-semibold leading-7 text-[#66717e]">
          Chúng tôi chưa tải được nội dung trang này. Có thể kết nối đang chập chờn; bạn vui lòng thử
          lại sau ít phút.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#0066cc] px-6 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(0,102,204,0.24)] transition hover:bg-[#0077ee]"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-[14px] border border-white/72 bg-white/60 px-6 text-sm font-extrabold text-[#303943] no-underline transition hover:bg-white/82"
          >
            Về Trang chủ
          </Link>
        </div>
        {error.digest && (
          <p className="mt-7 text-xs font-bold tracking-[0.12em] text-[#7a8491]">Mã lỗi: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
