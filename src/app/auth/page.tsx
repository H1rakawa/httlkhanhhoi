import Image from "next/image";
import NextLink from "next/link";
import AuthTabs from "@/com/auth/AuthTabs";

export default function AuthPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f5f7] px-6 py-16 text-[#1d1d1f]">
      <section className="flex w-full flex-col items-center justify-center gap-10">
        <NextLink href="/" className="flex items-center no-underline">
          <Image
            src="/logo.png"
            alt="Hội Thánh Tin Lành Khánh Hội"
            width={355}
            height={101}
            priority
            className="h-16 w-auto"
          />
        </NextLink>
        <AuthTabs />
      </section>
    </main>
  );
}
