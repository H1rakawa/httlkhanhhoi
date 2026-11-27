import { supabaseCountedRequest } from "@/lib/admin/contact";
import { supabaseDataRequest } from "@/lib/supabase/auth";

export type AdminStatValues = {
  totalMembers: number | null;
  assignments: number | null;
  libraryResources: number | null;
  upcomingEvents: number | null;
};

export type AdminTodo = {
  key: "prayers" | "contacts" | "grading";
  title: string;
  count: number | null;
  href: string;
  action: string;
};

export type AdminProgressItem = {
  label: string;
  detail: string;
  /** null = chưa có dữ liệu để tính. */
  value: number | null;
};

export type AdminActivityTone = "green" | "slate" | "violet" | "blue" | "gold";

export type AdminActivity = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
  status: string;
  tone: AdminActivityTone;
  avatarUrl: string | null;
  href: string | null;
};

export type AdminOverview = {
  stats: AdminStatValues;
  todos: AdminTodo[];
  progress: AdminProgressItem[];
  activities: AdminActivity[];
};

type Person = { name: string | null; email?: string | null; avatar_url: string | null } | null;

const personName = (person: Person, fallback = "Thành viên") =>
  person?.name || person?.email?.split("@")[0] || fallback;

async function count(path: string, accessToken: string) {
  try {
    const separator = path.includes("?") ? "&" : "?";
    const { total } = await supabaseCountedRequest<unknown[]>(
      `${path}${separator}limit=1`,
      accessToken,
    );
    return total;
  } catch {
    return null;
  }
}

async function list<T>(path: string, accessToken: string) {
  try {
    return await supabaseDataRequest<T[]>(path, accessToken);
  } catch {
    return [] as T[];
  }
}

const ACTION_LABELS: Record<string, string> = {
  approve: "đã duyệt",
  reject: "đã từ chối",
  delete: "đã xóa",
  update: "đã cập nhật",
  create: "đã tạo",
  publish: "đã đăng",
  grade: "đã chấm",
  change_role: "đã đổi vai trò",
  block: "đã khoá tài khoản",
  unblock: "đã mở khoá tài khoản",
};

const TABLE_LABELS: Record<string, { label: string; href: string | null }> = {
  prayer_requests: { label: "lời cầu thay", href: "/admin/pray" },
  assignments: { label: "bài tập", href: "/admin/assignment" },
  profiles: { label: "thành viên", href: "/admin/member" },
  contact_messages: { label: "lời nhắn liên hệ", href: "/admin/contact" },
  events: { label: "sự kiện", href: "/admin/events" },
  event_registrations: { label: "đăng ký sự kiện", href: "/admin/events" },
  resources: { label: "tài liệu", href: "/admin/library" },
  news_posts: { label: "bài viết", href: "/admin/news" },
  testimonies: { label: "lời làm chứng", href: "/admin/preachout" },
  submissions: { label: "bài nộp", href: "/admin/assignment" },
};

async function getRecentActivities(accessToken: string): Promise<AdminActivity[]> {
  const limit = 6;
  const [members, submissions, prayers, registrations, contacts, logs] = await Promise.all([
    list<{ id: string; name: string; email: string; avatar_url: string | null; created_at: string }>(
      `profiles?select=id,name,email,avatar_url,created_at&order=created_at.desc&limit=${limit}`,
      accessToken,
    ),
    list<{
      id: number;
      assignment_id: number;
      submitted_at: string;
      student: Person;
      assignment: { title: string } | null;
    }>(
      `submissions?select=id,assignment_id,submitted_at,student:user_id(name,email,avatar_url),assignment:assignment_id(title)&submitted_at=not.is.null&order=submitted_at.desc&limit=${limit}`,
      accessToken,
    ),
    list<{ id: number; title: string; created_at: string; author: Person }>(
      `prayer_requests?select=id,title,created_at,author:user_id(name,email,avatar_url)&order=created_at.desc&limit=${limit}`,
      accessToken,
    ),
    list<{
      id: number;
      full_name: string;
      created_at: string;
      event: { title: string } | null;
      person: Person;
    }>(
      `event_registrations?select=id,full_name,created_at,event:event_id(title),person:user_id(name,email,avatar_url)&order=created_at.desc&limit=${limit}`,
      accessToken,
    ),
    list<{ id: number; name: string; created_at: string }>(
      `contact_messages?select=id,name,created_at&order=created_at.desc&limit=${limit}`,
      accessToken,
    ),
    list<{
      id: number;
      action: string;
      target_table: string | null;
      metadata: { title?: string } | null;
      created_at: string;
      actor: Person;
    }>(
      `activity_logs?select=id,action,target_table,metadata,created_at,actor:actor_id(name,email,avatar_url)&order=created_at.desc&limit=${limit}`,
      accessToken,
    ),
  ]);

  const activities: AdminActivity[] = [
    ...members.map((row) => ({
      id: `member-${row.id}`,
      name: personName(row),
      body: "đã tham gia cộng đồng",
      createdAt: row.created_at,
      status: "Thành viên mới",
      tone: "slate" as const,
      avatarUrl: row.avatar_url,
      href: "/admin/member",
    })),
    ...submissions.map((row) => ({
      id: `submission-${row.id}`,
      name: personName(row.student),
      body: `đã nộp bài tập "${row.assignment?.title ?? "Bài tập"}"`,
      createdAt: row.submitted_at,
      status: "Đã nộp",
      tone: "green" as const,
      avatarUrl: row.student?.avatar_url ?? null,
      href: `/admin/assignment/${row.assignment_id}`,
    })),
    ...prayers.map((row) => ({
      id: `prayer-${row.id}`,
      name: personName(row.author),
      body: `đã gửi lời cầu thay "${row.title}"`,
      createdAt: row.created_at,
      status: "Cầu thay",
      tone: "violet" as const,
      avatarUrl: row.author?.avatar_url ?? null,
      href: "/admin/pray",
    })),
    ...registrations.map((row) => ({
      id: `registration-${row.id}`,
      name: row.full_name || personName(row.person, "Khách"),
      body: `đã đăng ký sự kiện "${row.event?.title ?? "Sự kiện"}"`,
      createdAt: row.created_at,
      status: "Đăng ký",
      tone: "blue" as const,
      avatarUrl: row.person?.avatar_url ?? null,
      href: "/admin/events",
    })),
    ...contacts.map((row) => ({
      id: `contact-${row.id}`,
      name: row.name || "Khách",
      body: "đã gửi lời nhắn liên hệ",
      createdAt: row.created_at,
      status: "Liên hệ",
      tone: "gold" as const,
      avatarUrl: null,
      href: "/admin/contact",
    })),
    ...logs.map((row) => {
      const target = TABLE_LABELS[row.target_table ?? ""];
      const title = row.metadata?.title ? ` "${row.metadata.title}"` : "";
      return {
        id: `log-${row.id}`,
        name: personName(row.actor, "Quản trị viên"),
        body: `${ACTION_LABELS[row.action] ?? row.action} ${target?.label ?? row.target_table ?? ""}${title}`.trim(),
        createdAt: row.created_at,
        status: "Quản trị",
        tone: "slate" as const,
        avatarUrl: row.actor?.avatar_url ?? null,
        href: target?.href ?? null,
      };
    }),
  ];

  return activities
    .filter((activity) => activity.createdAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
}

async function getProgress(accessToken: string): Promise<AdminProgressItem[]> {
  const nowIso = new Date().toISOString();
  const [graded, submitted, upcoming] = await Promise.all([
    count("submissions?select=id&status=eq.graded", accessToken),
    count("submissions?select=id&status=eq.submitted", accessToken),
    list<{ capacity: number | null; event_registrations: Array<{ attendees: number | null; status: string | null }> }>(
      `events?select=capacity,event_registrations(attendees,status)&event_time=gte.${encodeURIComponent(nowIso)}&status=neq.cancelled&capacity=not.is.null`,
      accessToken,
    ),
  ]);

  const handedIn = (graded ?? 0) + (submitted ?? 0);
  const capacity = upcoming.reduce((sum, event) => sum + (event.capacity ?? 0), 0);
  const registered = upcoming.reduce(
    (sum, event) =>
      sum +
      event.event_registrations
        .filter((registration) => registration.status !== "cancelled")
        .reduce((total, registration) => total + (registration.attendees ?? 1), 0),
    0,
  );

  return [
    {
      label: "Bài nộp đã chấm",
      detail: handedIn ? `${graded ?? 0}/${handedIn} bài` : "Chưa có bài nộp",
      value: handedIn ? Math.round(((graded ?? 0) / handedIn) * 100) : null,
    },
    {
      label: "Chỗ đã đăng ký (sự kiện sắp tới)",
      detail: capacity ? `${registered}/${capacity} chỗ` : "Chưa có sự kiện giới hạn chỗ",
      value: capacity ? Math.min(100, Math.round((registered / capacity) * 100)) : null,
    },
  ];
}

export async function getAdminOverview(accessToken: string): Promise<AdminOverview> {
  const nowIso = encodeURIComponent(new Date().toISOString());
  const [
    totalMembers,
    assignments,
    libraryResources,
    upcomingEvents,
    pendingPrayers,
    newContacts,
    awaitingGrade,
    progress,
    activities,
  ] = await Promise.all([
    count("profiles?select=id&status=eq.active", accessToken),
    count("assignments?select=id", accessToken),
    count("resources?select=id&is_published=is.true", accessToken),
    count(`events?select=id&event_time=gte.${nowIso}&status=neq.cancelled`, accessToken),
    count("prayer_requests?select=id&status=eq.pending", accessToken),
    count("contact_messages?select=id&status=eq.new", accessToken),
    count("submissions?select=id&status=eq.submitted", accessToken),
    getProgress(accessToken),
    getRecentActivities(accessToken),
  ]);

  return {
    stats: { totalMembers, assignments, libraryResources, upcomingEvents },
    todos: [
      {
        key: "prayers",
        title: "Lời cầu thay chờ duyệt",
        count: pendingPrayers,
        href: "/admin/pray",
        action: "Đi tới duyệt",
      },
      {
        key: "contacts",
        title: "Lời nhắn liên hệ mới",
        count: newContacts,
        href: "/admin/contact",
        action: "Mở hộp thư",
      },
      {
        key: "grading",
        title: "Bài nộp chờ chấm",
        count: awaitingGrade,
        href: "/admin/assignment",
        action: "Xem bài tập",
      },
    ],
    progress,
    activities,
  };
}
