import Image from "next/image";
import NextLink from "next/link";
import { redirect } from "next/navigation";
import AuthBackdrop from "@/com/auth/AuthBackdrop";
import AuthTabs from "@/com/auth/AuthTabs";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function AuthPage() {
  if (await getCurrentUser()) redirect("/dashboard");

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
        <AuthTabs />
      </section>
    </main>
  );
}
