alter table public.assignments
add column if not exists admin_status text not null default 'draft'
  check (admin_status in ('ongoing', 'upcoming', 'ended', 'draft')),
add column if not exists icon_tone text not null default 'blue'
  check (icon_tone in ('blue', 'gold', 'dark'));

create index if not exists assignments_admin_status_due_date_idx
on public.assignments (admin_status, due_date);

with admin_profile as (
  select id
  from public.profiles
  where role = 'admin'
  order by created_at asc
  limit 1
)
insert into public.assignments
  (title, description, week_number, due_date, created_by, admin_status, icon_tone)
select
  seed.title,
  seed.description,
  seed.week_number,
  seed.due_date,
  admin_profile.id,
  seed.admin_status,
  seed.icon_tone
from (
  values
    (
      'Thiền định buổi sáng - Cấp độ 1',
      'Bài tập thực hành giúp học viên xây dựng thói quen tĩnh lặng mỗi ngày.',
      1,
      date '2024-12-20',
      'ongoing',
      'blue'
    ),
    (
      'Bài viết về chánh niệm',
      'Viết suy ngẫm ngắn về cách thực hành chánh niệm trong đời sống.',
      2,
      date '2024-12-25',
      'upcoming',
      'gold'
    ),
    (
      'Phân tích hành vi tự thân',
      'Quan sát một thói quen cá nhân và ghi lại điều Chúa nhắc nhở.',
      1,
      date '2024-12-15',
      'ended',
      'dark'
    ),
    (
      'Thiền quán tưởng cơ bản',
      'Thực hành suy ngẫm có hướng dẫn và viết lại trải nghiệm.',
      3,
      date '2024-12-30',
      'ongoing',
      'blue'
    )
) as seed(title, description, week_number, due_date, admin_status, icon_tone)
cross join admin_profile
where not exists (
  select 1
  from public.assignments
  where assignments.title = seed.title
);
