import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { redirect } from "next/navigation";
import AuthBackdrop from "@/com/auth/AuthBackdrop";
import AuthTabs from "@/com/auth/AuthTabs";
import { getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập hoặc đăng ký tài khoản thành viên.",
  robots: { index: false, follow: false },
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent px-4 py-14 text-[#1d1d1f] md:px-6 md:py-16">
      <AuthBackdrop />
      <section className="relative z-10 flex w-full flex-col items-center justify-center gap-8 md:gap-10">
        <NextLink
          href="/"
          className="liquid-glass flex items-center px-6 py-4 no-underline"
        >
          <Image
            src="/logo.png"
            alt="Hội Thánh Tin Lành Khánh Hội"
            width={355}
            height={101}
            priority
            className="h-14 w-auto md:h-16"
          />
        </NextLink>
        <AuthTabs initialError={Array.isArray(error) ? error[0] : error} />
      </section>
    </main>
  );
}
