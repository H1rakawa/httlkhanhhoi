"use client";

import { Dropdown, toast } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import {
  getUserAvatarUrl,
  getUserDisplayEmail,
  getUserDisplayName,
  type DisplayUser,
} from "@/lib/supabase/user-display";

type Account = {
  user: DisplayUser;
  profile: {
    name: string;
    email: string;
    avatar_url: string | null;
    role?: string;
    status?: string;
  } | null;
};

function normalizeRole(role?: string | null) {
  return (role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isAdminAccount(account: Account | null) {
  const metadata = account?.user.user_metadata as
    | ({ role?: string } & NonNullable<DisplayUser["user_metadata"]>)
    | undefined;
  const profileRole = normalizeRole(account?.profile?.role);
  const metadataRole = normalizeRole(metadata?.role || metadata?.display_name);

  return [profileRole, metadataRole].some((role) =>
    ["admin", "administrator", "quan_tri", "quan_tri_vien"].includes(role),
  );
}

const accountRoutes: Record<string, string> = {
  admin: "/admin",
  dashboard: "/dashboard",
  assignments: "/assignment",
  library: "/library",
  pray: "/pray",
};

export default function HeaderAccountMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAccount = () =>
      fetch("/api/auth/me", { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as Account;
        })
        .then((data) => {
          if (isMounted) setAccount(data);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

    loadAccount();

    const handleFocus = () => {
      loadAccount().catch(() => {
        if (isMounted) setIsLoading(false);
      });
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const email = account ? getUserDisplayEmail(account.user, account.profile) : "";
  const name = account ? getUserDisplayName(account.user, account.profile) : "";
  const avatarUrl = account ? getUserAvatarUrl(account.user, account.profile) : null;
  const initial = (email.charAt(0) || name.charAt(0) || "T").toUpperCase();
  const canOpenAdmin = isAdminAccount(account);

  const handleAction = async (key: React.Key) => {
    setIsOpen(false);

    if (String(key) === "logout") {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) return;

      setAccount(null);
      toast.success("Đăng xuất thành công", {
        description: "Hẹn gặp lại bạn.",
        timeout: 3500,
      });
      router.replace("/");
      router.refresh();
      return;
    }

    const destination = accountRoutes[String(key)];
    if (destination) router.push(destination);
  };

  const itemClassName = (key: keyof typeof accountRoutes) =>
    [
      "account-menu-item",
      pathname === accountRoutes[key] ||
      pathname.startsWith(`${accountRoutes[key]}/`)
        ? "account-menu-item-active"
        : "",
    ].join(" ");

  if (isLoading) {
    return (
      <span
        className="h-10 w-[68px] rounded-full border border-white/20 bg-white/10"
        aria-hidden="true"
      />
    );
  }

  if (!account) {
    return (
      <a
        href="/auth"
        className="flex h-8 items-center rounded-full bg-[#0066cc] px-4 text-sm font-semibold text-white no-underline hover:bg-[#0077ee]"
      >
        Đăng nhập<span className="hidden sm:inline"> / Đăng ký</span>
      </a>
    );
  }

  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <Dropdown.Trigger
        aria-label={`Mở menu tài khoản của ${name}`}
        aria-expanded={isOpen}
        className="flex h-10 items-center gap-2 rounded-full border border-white/55 bg-white/14 py-1 pl-1 pr-3 text-sm font-bold text-white shadow-[0_6px_18px_rgba(0,0,0,0.22)] outline-none backdrop-blur-xl hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-[#2997ff]"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/75 bg-[#087be8] text-xs text-white shadow-[0_3px_10px_rgba(0,0,0,0.2)]">
          {avatarUrl ? (
            <span
              className="block h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url("${avatarUrl}")` }}
            />
          ) : (
            <span aria-hidden="true">{initial}</span>
          )}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={[
            "h-4 w-4 text-white/84 transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0",
          ].join(" ")}
          aria-hidden="true"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </Dropdown.Trigger>

      <Dropdown.Popover
        placement="bottom end"
        className="mt-2 min-w-[300px] overflow-hidden rounded-[18px] border border-[#dfe4ea] bg-white p-0 text-[#1d1d1f] shadow-[0_24px_60px_rgba(31,48,70,0.24)]"
      >
        <div className="border-b border-[#8aa0b5]/20 px-6 py-5">
          <p className="text-lg font-semibold">{name}</p>
          <p className="mt-1 max-w-[250px] truncate text-sm text-[#6e6e73]">
            {email}
          </p>
        </div>
        <Dropdown.Menu
          aria-label="Menu tài khoản"
          onAction={handleAction}
          className="p-3 outline-none"
        >
          {canOpenAdmin && (
            <Dropdown.Item id="admin" className={itemClassName("admin")}>
              <DashboardIcon name="settings" className="h-5 w-5" />
              <span>Admin</span>
            </Dropdown.Item>
          )}
          <Dropdown.Item id="dashboard" className={itemClassName("dashboard")}>
            <DashboardIcon name="dashboard" className="h-5 w-5" />
            <span>Bảng điều khiển</span>
          </Dropdown.Item>
          <Dropdown.Item
            id="assignments"
            className={itemClassName("assignments")}
          >
            <DashboardIcon name="document" className="h-5 w-5" />
            <span>Danh sách bài tập</span>
          </Dropdown.Item>
          <Dropdown.Item id="library" className={itemClassName("library")}>
            <DashboardIcon name="book" className="h-5 w-5" />
            <span>Thư viện</span>
          </Dropdown.Item>
          <Dropdown.Item id="pray" className={itemClassName("pray")}>
            <DashboardIcon name="community" className="h-5 w-5" />
            <span>Cầu thay</span>
          </Dropdown.Item>
          <Dropdown.Item
            id="logout"
            className="account-menu-item mt-2 border-t border-[#8aa0b5]/20 pt-4 text-[#0077dd]"
          >
            <DashboardIcon name="logout" className="h-5 w-5" />
            <span>Đăng xuất</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
