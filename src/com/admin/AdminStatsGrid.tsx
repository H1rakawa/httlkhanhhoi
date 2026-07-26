"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardIcon from "@/com/dashboard/DashboardIcon";
import { adminStats } from "@/com/admin/adminData";

const toneClassName: Record<string, string> = {
  success: "text-[#2f8c52]",
  danger: "text-[#d33b34]",
  neutral: "text-[#6b7280]",
};

type StatKey = (typeof adminStats)[number]["key"];

type StatValues = Record<StatKey, number>;

type AdminMembersResponse = {
  total?: number;
  error?: string;
};

type AdminExamStatsResponse = {
  assignments?: number;
  error?: string;
};

type ApiEvent = {
  event_time?: string | null;
};

const initialValues: StatValues = {
  totalMembers: 0,
  assignments: 0,
  libraryResources: 0,
  upcomingEvents: 0,
};

function formatStatValue(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

async function readJson<T>(url: string, signal: AbortSignal) {
  const response = await fetch(url, {
    cache: "no-store",
    signal,
  });
  const data = (await response.json()) as T;

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Không thể tải dữ liệu thống kê.";
    throw new Error(message);
  }

  return data;
}

function countUpcomingEvents(events: ApiEvent[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events.filter((event) => {
    if (!event.event_time) return false;
    const eventTime = new Date(event.event_time);

    return !Number.isNaN(eventTime.getTime()) && eventTime >= today;
  }).length;
}

export default function AdminStatsGrid() {
  const [values, setValues] = useState<StatValues>(initialValues);
  const [failedKeys, setFailedKeys] = useState<StatKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      setIsLoading(true);
      setFailedKeys([]);

      const results = await Promise.allSettled([
        readJson<AdminMembersResponse>(
          "/api/admin/members?page=1&pageSize=1",
          controller.signal,
        ),
        readJson<AdminExamStatsResponse>(
          "/api/admin/exams?stats=1",
          controller.signal,
        ),
        readJson<ApiEvent[]>("/api/events", controller.signal),
        readJson<unknown[]>("/api/resources", controller.signal),
      ]);

      if (controller.signal.aborted) return;

      const nextValues: StatValues = { ...initialValues };
      const nextFailedKeys: StatKey[] = [];

      if (results[0].status === "fulfilled") {
        nextValues.totalMembers = Number(results[0].value.total ?? 0);
      } else {
        nextFailedKeys.push("totalMembers");
      }

      if (results[1].status === "fulfilled") {
        nextValues.assignments = Number(results[1].value.assignments ?? 0);
      } else {
        nextFailedKeys.push("assignments");
      }

      if (results[2].status === "fulfilled") {
        nextValues.upcomingEvents = countUpcomingEvents(results[2].value);
      } else {
        nextFailedKeys.push("upcomingEvents");
      }

      if (results[3].status === "fulfilled") {
        nextValues.libraryResources = results[3].value.length;
      } else {
        nextFailedKeys.push("libraryResources");
      }

      setValues(nextValues);
      setFailedKeys(nextFailedKeys);
      setIsLoading(false);
    }

    loadStats().catch(() => {
      if (controller.signal.aborted) return;
      setFailedKeys(adminStats.map((stat) => stat.key));
      setIsLoading(false);
    });

    return () => controller.abort();
  }, []);

  const failedKeySet = useMemo(() => new Set(failedKeys), [failedKeys]);

  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {adminStats.map((stat) => (
        <article
          key={stat.title}
          className="group min-h-[150px] rounded-[24px] border border-white/72 bg-white/36 p-6 shadow-[0_22px_54px_rgba(31,48,70,0.12)] backdrop-blur-2xl transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[#101418]/8 text-[#36434d] shadow-inner">
              <DashboardIcon name={stat.icon} className="h-5 w-5" />
            </span>
            <span
              className={[
                "text-sm font-extrabold",
                toneClassName[stat.tone] || toneClassName.neutral,
              ].join(" ")}
            >
              {failedKeySet.has(stat.key) ? "Không tải được" : stat.delta}
            </span>
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#6c747d]">
            {stat.title}
          </p>
          <p className="mt-3 text-xl font-extrabold text-[#111827]">
            {isLoading
              ? "Đang tải..."
              : failedKeySet.has(stat.key)
                ? stat.fallbackValue
                : formatStatValue(values[stat.key])}
          </p>
        </article>
      ))}
    </section>
  );
}
