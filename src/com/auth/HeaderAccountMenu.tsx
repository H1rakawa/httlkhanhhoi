"use client";

import { Dropdown, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardIcon from "@/com/dashboard/DashboardIcon";

type Account = {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  profile: {
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
};

const accountRoutes: Record<string, string> = {
  dashboard: "/dashboard",
  assignments: "/dashboard#assignments",
  discussion: "/contact",
  library: "/news",
  activity: "/calendar",
};

export default function HeaderAccountMenu() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAction = async (key: React.Key) => {
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

  if (isLoading) {
    return (
      <span
        className="h-9 w-9 rounded-full border border-white/20 bg-white/10"
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
        Đăng nhập / Đăng ký
      </a>
    );
  }

  const email = account.profile?.email || account.user.email || "";
  const name =
    account.profile?.name ||
    account.user.user_metadata?.full_name ||
    email.split("@")[0] ||
    "Thành viên";
  const avatarUrl =
    account.profile?.avatar_url || account.user.user_metadata?.avatar_url;
  const initial = email.charAt(0).toUpperCase() || name.charAt(0).toUpperCase();

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`Mở menu tài khoản của ${name}`}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white/75 bg-[#087be8] p-0 text-sm font-bold text-white shadow-[0_6px_18px_rgba(0,0,0,0.22)] outline-none focus-visible:ring-2 focus-visible:ring-[#2997ff]"
      >
        {avatarUrl ? (
          <span
            className="block h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url("${avatarUrl}")` }}
          />
        ) : (
          <span aria-hidden="true">{initial}</span>
        )}
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
          <Dropdown.Item id="dashboard" className="account-menu-item">
            <DashboardIcon name="dashboard" className="h-5 w-5" />
            <span>Bảng điều khiển</span>
          </Dropdown.Item>
          <Dropdown.Item id="assignments" className="account-menu-item">
            <DashboardIcon name="document" className="h-5 w-5" />
            <span>Danh sách bài tập</span>
          </Dropdown.Item>
          <Dropdown.Item id="discussion" className="account-menu-item">
            <DashboardIcon name="community" className="h-5 w-5" />
            <span>Thảo luận</span>
          </Dropdown.Item>
          <Dropdown.Item id="library" className="account-menu-item">
            <DashboardIcon name="book" className="h-5 w-5" />
            <span>Thư viện</span>
          </Dropdown.Item>
          <Dropdown.Item id="activity" className="account-menu-item">
            <DashboardIcon name="calendar" className="h-5 w-5" />
            <span>Hoạt động</span>
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
