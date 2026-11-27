-- Backend update theo "Phân tích dự án HTTL Khánh Hội" (26/11/2026), mục 4.2 và 4.3.
-- 1. Cập nhật: assignment_question_options, submissions, events, resources, media_assets, notifications
-- 2. Tạo mới: prayer_requests, prayer_comments, prayer_intercessions, event_registrations,
--    contact_messages, testimonies, submission_answers, activity_logs

-- ---------------------------------------------------------------------------
-- 0. Helper
-- ---------------------------------------------------------------------------

-- true khi người gọi là staff (teacher/admin active), service_role, hoặc chạy SQL trực tiếp /
-- bên trong hàm SECURITY DEFINER. Dùng trong các trigger chặn thành viên tự sửa trường nhạy cảm.
create or replace function private.is_privileged()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user not in ('anon', 'authenticated') or public.is_staff();
$$;

grant usage on schema private to anon, authenticated;
revoke all on function private.is_privileged() from public;
grant execute on function private.is_privileged() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. assignment_question_options: thành viên không được đọc is_correct
-- ---------------------------------------------------------------------------

revoke select on public.assignment_question_options from anon, authenticated;
grant select (id, question_id, option_text, sort_order, created_at, updated_at)
  on public.assignment_question_options to authenticated;
revoke insert, update, delete, truncate on public.assignment_question_options from anon;

-- ---------------------------------------------------------------------------
-- 2. submissions: thêm graded_by, graded_at, updated_at; chặn tự sửa điểm
-- ---------------------------------------------------------------------------

alter table public.submissions
  add column if not exists graded_by uuid references public.profiles(id) on delete set null,
  add column if not exists graded_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists submissions_graded_by_idx on public.submissions (graded_by);

drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

create or replace function private.guard_submission_grading()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_privileged() then
    if new.status = 'graded' and new.graded_at is null then
      new.graded_at := now();
      new.graded_by := coalesce(new.graded_by, auth.uid());
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status = 'graded'
       or new.grade is not null
       or new.feedback is not null
       or new.graded_by is not null
       or new.graded_at is not null then
      raise exception 'Thành viên không được tự chấm điểm bài nộp.' using errcode = '42501';
    end if;
  else
    if new.grade is distinct from old.grade
       or new.feedback is distinct from old.feedback
       or new.graded_by is distinct from old.graded_by
       or new.graded_at is distinct from old.graded_at
       or (new.status = 'graded' and old.status <> 'graded')
       or new.user_id <> old.user_id
       or new.assignment_id <> old.assignment_id then
      raise exception 'Thành viên không được sửa điểm, nhận xét hoặc chủ bài nộp.' using errcode = '42501';
    end if;
  end if;

  if new.status = 'submitted' and new.submitted_at is null then
    new.submitted_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists submissions_guard_grading on public.submissions;
create trigger submissions_guard_grading
  before insert or update on public.submissions
  for each row execute function private.guard_submission_grading();

-- Thành viên chỉ sửa được bài của mình khi còn là bản nháp.
drop policy if exists submissions_update_own_or_staff on public.submissions;
create policy submissions_update_own_draft_or_staff
on public.submissions
for update
to authenticated
using (
  (user_id = (select auth.uid()) and status = 'draft')
  or (select public.is_staff())
)
with check (
  (user_id = (select auth.uid()) and status in ('draft', 'submitted'))
  or (select public.is_staff())
);

drop policy if exists submissions_insert_own on public.submissions;
create policy submissions_insert_own
on public.submissions
for insert
to authenticated
with check (user_id = (select auth.uid()) or (select public.is_staff()));

drop policy if exists submissions_select_own_or_staff on public.submissions;
create policy submissions_select_own_or_staff
on public.submissions
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()));

revoke insert, update, delete, truncate on public.submissions from anon;

-- ---------------------------------------------------------------------------
-- 3. events: bổ sung cột cho /calendar và /preachout
-- ---------------------------------------------------------------------------

alter table public.events
  add column if not exists event_type text not null default 'regular',
  add column if not exists category text not null default 'Thờ phượng',
  add column if not exists end_time timestamptz,
  add column if not exists capacity integer,
  add column if not exists image_url text,
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null,
  add column if not exists status text not null default 'upcoming',
  add column if not exists schedule jsonb not null default '[]'::jsonb,
  add column if not exists registration_open boolean not null default false,
  add column if not exists featured boolean not null default false;

alter table public.events
  drop constraint if exists events_event_type_check,
  add constraint events_event_type_check check (event_type in ('regular', 'outreach')),
  drop constraint if exists events_category_check,
  add constraint events_category_check check (category in ('Thờ phượng', 'Đào tạo', 'Thiện nguyện', 'Giới trẻ')),
  drop constraint if exists events_end_time_check,
  add constraint events_end_time_check check (end_time is null or end_time > event_time),
  drop constraint if exists events_capacity_check,
  add constraint events_capacity_check check (capacity is null or capacity > 0),
  drop constraint if exists events_status_check,
  add constraint events_status_check check (status in ('preparing', 'open', 'upcoming', 'ended', 'cancelled')),
  drop constraint if exists events_schedule_check,
  add constraint events_schedule_check check (jsonb_typeof(schedule) = 'array');

create index if not exists events_event_time_idx on public.events (event_time);
create index if not exists events_type_status_idx on public.events (event_type, status);
create index if not exists events_media_asset_id_idx on public.events (media_asset_id);
create index if not exists events_created_by_idx on public.events (created_by);

revoke insert, update, delete, truncate on public.events from anon;

-- ---------------------------------------------------------------------------
-- 4. resources: description, category, is_published, updated_at
-- ---------------------------------------------------------------------------

alter table public.resources
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists is_published boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists resources_category_idx on public.resources (category);
create index if not exists resources_media_asset_id_idx on public.resources (media_asset_id);
create index if not exists resources_uploaded_by_idx on public.resources (uploaded_by);

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- Chỉ hiện tài liệu đã xuất bản (staff xem được tất cả). Tách policy để không trùng permissive.
drop policy if exists resources_public_read on public.resources;
drop policy if exists resources_staff_manage on public.resources;

create policy resources_read_published_or_staff
on public.resources
for select
to anon, authenticated
using (is_published or (select public.is_staff()));

create policy resources_staff_insert
on public.resources
for insert
to authenticated
with check ((select public.is_staff()));

create policy resources_staff_update
on public.resources
for update
to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy resources_staff_delete
on public.resources
for delete
to authenticated
using ((select public.is_staff()));

revoke insert, update, delete, truncate on public.resources from anon;

-- ---------------------------------------------------------------------------
-- 5. media_assets: cho phép liên kết với prayer_requests, testimonies
-- ---------------------------------------------------------------------------

alter table public.media_assets
  drop constraint if exists media_assets_related_table_check,
  add constraint media_assets_related_table_check check (
    related_table in (
      'resources', 'assignments', 'profiles', 'events', 'news_posts',
      'prayer_requests', 'testimonies'
    )
  );

revoke insert, update, delete, truncate on public.media_assets from anon;

-- ---------------------------------------------------------------------------
-- 6. notifications: title, type, link
-- ---------------------------------------------------------------------------

alter table public.notifications
  add column if not exists title text not null default '',
  add column if not exists type text not null default 'system',
  add column if not exists link text;

alter table public.notifications
  drop constraint if exists notifications_type_check,
  add constraint notifications_type_check check (type in ('assignment', 'prayer', 'event', 'system'));

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read, created_at desc);

revoke all on public.notifications from anon;

-- ---------------------------------------------------------------------------
-- 7. prayer_requests
-- ---------------------------------------------------------------------------

create table if not exists public.prayer_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null default 'Tâm linh'
    check (category in ('Sức khỏe', 'Gia đình', 'Tâm linh', 'Tài chính', 'Khác')),
  privacy text not null default 'public' check (privacy in ('public', 'private')),
  is_anonymous boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'answered', 'rejected')),
  image_url text,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  intercession_count integer not null default 0 check (intercession_count >= 0),
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prayer_requests_user_id_idx on public.prayer_requests (user_id);
create index if not exists prayer_requests_status_created_idx on public.prayer_requests (status, created_at desc);
create index if not exists prayer_requests_media_asset_id_idx on public.prayer_requests (media_asset_id);
create index if not exists prayer_requests_approved_by_idx on public.prayer_requests (approved_by);

create trigger prayer_requests_set_updated_at
  before update on public.prayer_requests
  for each row execute function public.set_updated_at();

-- Thành viên không tự duyệt bài, không sửa intercession_count; chỉ được chuyển approved -> answered.
create or replace function private.guard_prayer_request()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_privileged() then
    if new.status = 'approved' and new.approved_at is null then
      new.approved_at := now();
      new.approved_by := coalesce(new.approved_by, auth.uid());
    end if;
    if new.status = 'answered' and new.answered_at is null then
      new.answered_at := now();
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.intercession_count := 0;
    new.approved_by := null;
    new.approved_at := null;
    new.answered_at := null;
    return new;
  end if;

  if new.user_id <> old.user_id
     or new.intercession_count <> old.intercession_count
     or new.approved_by is distinct from old.approved_by
     or new.approved_at is distinct from old.approved_at then
    raise exception 'Bạn không có quyền sửa trường này của lời cầu nguyện.' using errcode = '42501';
  end if;

  if new.status <> old.status then
    if not (old.status = 'approved' and new.status = 'answered') then
      raise exception 'Chỉ ban mục vụ mới được đổi trạng thái lời cầu nguyện.' using errcode = '42501';
    end if;
    new.answered_at := now();
  elsif new.answered_at is distinct from old.answered_at then
    raise exception 'Bạn không có quyền sửa thời điểm nhậm lời.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger prayer_requests_guard
  before insert or update on public.prayer_requests
  for each row execute function private.guard_prayer_request();

alter table public.prayer_requests enable row level security;

create policy prayer_requests_select
on public.prayer_requests
for select
to authenticated
using (
  (privacy = 'public' and status in ('approved', 'answered'))
  or user_id = (select auth.uid())
  or (select public.is_staff())
);

create policy prayer_requests_insert_own
on public.prayer_requests
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy prayer_requests_update_own_or_staff
on public.prayer_requests
for update
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()))
with check (user_id = (select auth.uid()) or (select public.is_staff()));

create policy prayer_requests_delete_own_or_staff
on public.prayer_requests
for delete
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()));

-- ---------------------------------------------------------------------------
-- 8. prayer_comments
-- ---------------------------------------------------------------------------

create table if not exists public.prayer_comments (
  id bigint generated always as identity primary key,
  prayer_id bigint not null references public.prayer_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(btrim(message)) > 0),
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists prayer_comments_prayer_id_idx on public.prayer_comments (prayer_id, created_at);
create index if not exists prayer_comments_user_id_idx on public.prayer_comments (user_id);

alter table public.prayer_comments enable row level security;

-- Đọc được khi đọc được lời cầu nguyện gốc (RLS của prayer_requests áp dụng trong subquery).
create policy prayer_comments_select
on public.prayer_comments
for select
to authenticated
using (exists (select 1 from public.prayer_requests p where p.id = prayer_comments.prayer_id));

create policy prayer_comments_insert_own
on public.prayer_comments
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.prayer_requests p
    where p.id = prayer_comments.prayer_id
      and (p.status in ('approved', 'answered') or p.user_id = (select auth.uid()))
  )
);

create policy prayer_comments_update_own
on public.prayer_comments
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy prayer_comments_delete_own_or_staff
on public.prayer_comments
for delete
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()));

-- ---------------------------------------------------------------------------
-- 9. prayer_intercessions
-- ---------------------------------------------------------------------------

create table if not exists public.prayer_intercessions (
  prayer_id bigint not null references public.prayer_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (prayer_id, user_id)
);

create index if not exists prayer_intercessions_user_id_idx on public.prayer_intercessions (user_id);

-- Cập nhật prayer_requests.intercession_count (SECURITY DEFINER vì người cầu thay
-- không có quyền UPDATE lời cầu nguyện của người khác).
create or replace function private.sync_prayer_intercession_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.prayer_requests
      set intercession_count = intercession_count + 1
      where id = new.prayer_id;
    return new;
  end if;

  update public.prayer_requests
    set intercession_count = greatest(intercession_count - 1, 0)
    where id = old.prayer_id;
  return old;
end;
$$;

revoke all on function private.sync_prayer_intercession_count() from public;

create trigger prayer_intercessions_sync_count
  after insert or delete on public.prayer_intercessions
  for each row execute function private.sync_prayer_intercession_count();

alter table public.prayer_intercessions enable row level security;

create policy prayer_intercessions_select
on public.prayer_intercessions
for select
to authenticated
using (exists (select 1 from public.prayer_requests p where p.id = prayer_intercessions.prayer_id));

create policy prayer_intercessions_insert_own
on public.prayer_intercessions
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.prayer_requests p
    where p.id = prayer_intercessions.prayer_id
      and p.status in ('approved', 'answered')
  )
);

create policy prayer_intercessions_delete_own_or_staff
on public.prayer_intercessions
for delete
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()));

-- ---------------------------------------------------------------------------
-- 10. event_registrations
-- ---------------------------------------------------------------------------

create table if not exists public.event_registrations (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null check (char_length(btrim(full_name)) > 0),
  phone text,
  email text,
  attendees integer not null default 1 check (attendees > 0),
  status text not null default 'registered' check (status in ('registered', 'cancelled', 'attended')),
  note text,
  created_at timestamptz not null default now(),
  unique (event_id, user_id),
  -- Khách chưa có tài khoản phải để lại SĐT hoặc email.
  constraint event_registrations_guest_contact_check
    check (user_id is not null or phone is not null or email is not null)
);

create index if not exists event_registrations_event_status_idx on public.event_registrations (event_id, status);
create index if not exists event_registrations_user_id_idx on public.event_registrations (user_id);

-- Kiểm tra sự kiện đang mở đăng ký và còn chỗ (khoá dòng events để tránh vượt sức chứa khi
-- nhiều người đăng ký cùng lúc). Staff / service_role được bỏ qua.
create or replace function private.guard_event_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_taken integer;
begin
  if coalesce(auth.role(), 'service_role') not in ('anon', 'authenticated') or public.is_staff() then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.event_id <> old.event_id or new.user_id is distinct from old.user_id then
      raise exception 'Không được đổi sự kiện hoặc người đăng ký.' using errcode = '42501';
    end if;
    if new.status = 'attended' and old.status <> 'attended' then
      raise exception 'Chỉ ban tổ chức mới được điểm danh.' using errcode = '42501';
    end if;
    -- Huỷ đăng ký hoặc chỉ sửa ghi chú thì không cần kiểm tra chỗ.
    if new.status = 'cancelled' or (old.status <> 'cancelled' and new.attendees <= old.attendees) then
      return new;
    end if;
  elsif new.status <> 'registered' then
    raise exception 'Đăng ký mới phải ở trạng thái registered.' using errcode = '42501';
  end if;

  select * into v_event from public.events where id = new.event_id for update;

  if not found then
    raise exception 'Sự kiện không tồn tại.' using errcode = '23503';
  end if;

  if not v_event.registration_open or v_event.status in ('ended', 'cancelled') then
    raise exception 'Sự kiện này hiện không nhận đăng ký.' using errcode = 'P0001';
  end if;

  if v_event.capacity is not null then
    select coalesce(sum(attendees), 0) into v_taken
      from public.event_registrations
      where event_id = new.event_id
        and status <> 'cancelled'
        and (tg_op = 'INSERT' or id <> new.id);

    if v_taken + new.attendees > v_event.capacity then
      raise exception 'Sự kiện đã đủ chỗ.' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.guard_event_registration() from public;

create trigger event_registrations_guard
  before insert or update on public.event_registrations
  for each row execute function private.guard_event_registration();

alter table public.event_registrations enable row level security;

create policy event_registrations_select_own_or_staff
on public.event_registrations
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()));

-- Khách (anon) đăng ký không gắn tài khoản. Dùng Prefer: return=minimal vì anon không SELECT được.
create policy event_registrations_insert_guest
on public.event_registrations
for insert
to anon
with check (user_id is null and status = 'registered');

create policy event_registrations_insert_own_or_staff
on public.event_registrations
for insert
to authenticated
with check (user_id = (select auth.uid()) or (select public.is_staff()));

create policy event_registrations_update_own_or_staff
on public.event_registrations
for update
to authenticated
using (user_id = (select auth.uid()) or (select public.is_staff()))
with check (
  (user_id = (select auth.uid()) and status in ('registered', 'cancelled'))
  or (select public.is_staff())
);

create policy event_registrations_staff_delete
on public.event_registrations
for delete
to authenticated
using ((select public.is_staff()));

-- ---------------------------------------------------------------------------
-- 11. contact_messages: anon được INSERT, chỉ staff đọc
-- ---------------------------------------------------------------------------

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  email text not null check (char_length(email) <= 320 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null check (char_length(btrim(phone)) between 1 and 30),
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  handled_by uuid references public.profiles(id) on delete set null,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_status_created_idx on public.contact_messages (status, created_at desc);
create index if not exists contact_messages_handled_by_idx on public.contact_messages (handled_by);

alter table public.contact_messages enable row level security;

create policy contact_messages_public_insert
on public.contact_messages
for insert
to anon, authenticated
with check (status = 'new' and handled_by is null and replied_at is null);

create policy contact_messages_staff_select
on public.contact_messages
for select
to authenticated
using ((select public.is_staff()));

create policy contact_messages_staff_update
on public.contact_messages
for update
to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy contact_messages_staff_delete
on public.contact_messages
for delete
to authenticated
using ((select public.is_staff()));

-- ---------------------------------------------------------------------------
-- 12. testimonies
-- ---------------------------------------------------------------------------

create table if not exists public.testimonies (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  event_id bigint references public.events(id) on delete set null,
  name text not null,
  role text,
  quote text not null,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonies_status_created_idx on public.testimonies (status, created_at desc);
create index if not exists testimonies_user_id_idx on public.testimonies (user_id);
create index if not exists testimonies_event_id_idx on public.testimonies (event_id);
create index if not exists testimonies_approved_by_idx on public.testimonies (approved_by);

create trigger testimonies_set_updated_at
  before update on public.testimonies
  for each row execute function public.set_updated_at();

create or replace function private.guard_testimony()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_privileged() then
    if new.status = 'approved' and new.approved_by is null then
      new.approved_by := auth.uid();
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.approved_by := null;
    return new;
  end if;

  if new.status <> old.status
     or new.approved_by is distinct from old.approved_by
     or new.user_id is distinct from old.user_id then
    raise exception 'Chỉ ban mục vụ mới được duyệt lời làm chứng.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger testimonies_guard
  before insert or update on public.testimonies
  for each row execute function private.guard_testimony();

alter table public.testimonies enable row level security;

create policy testimonies_select
on public.testimonies
for select
to anon, authenticated
using (
  status = 'approved'
  or user_id = (select auth.uid())
  or (select public.is_staff())
);

create policy testimonies_insert_own_or_staff
on public.testimonies
for insert
to authenticated
with check (user_id = (select auth.uid()) or (select public.is_staff()));

create policy testimonies_update_own_pending_or_staff
on public.testimonies
for update
to authenticated
using ((user_id = (select auth.uid()) and status = 'pending') or (select public.is_staff()))
with check (user_id = (select auth.uid()) or (select public.is_staff()));

create policy testimonies_delete_own_pending_or_staff
on public.testimonies
for delete
to authenticated
using ((user_id = (select auth.uid()) and status = 'pending') or (select public.is_staff()));

-- ---------------------------------------------------------------------------
-- 13. submission_answers
-- ---------------------------------------------------------------------------

create table if not exists public.submission_answers (
  id bigint generated always as identity primary key,
  submission_id bigint not null references public.submissions(id) on delete cascade,
  question_id bigint not null references public.assignment_questions(id) on delete cascade,
  answer_text text,
  selected_option_ids bigint[] not null default '{}',
  scripture_ref text,
  is_correct boolean,
  points_awarded numeric check (points_awarded is null or points_awarded >= 0),
  teacher_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, question_id)
);

create index if not exists submission_answers_question_id_idx on public.submission_answers (question_id);

create trigger submission_answers_set_updated_at
  before update on public.submission_answers
  for each row execute function public.set_updated_at();

-- Câu hỏi phải thuộc đúng bài tập của bài nộp; thành viên không tự ghi kết quả chấm.
create or replace function private.guard_submission_answer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.submissions s
    join public.assignment_questions q on q.assignment_id = s.assignment_id
    where s.id = new.submission_id and q.id = new.question_id
  ) then
    raise exception 'Câu hỏi không thuộc bài tập của bài nộp này.' using errcode = '23514';
  end if;

  if private.is_privileged() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.is_correct is not null or new.points_awarded is not null or new.teacher_comment is not null then
      raise exception 'Thành viên không được tự chấm câu trả lời.' using errcode = '42501';
    end if;
  elsif new.is_correct is distinct from old.is_correct
     or new.points_awarded is distinct from old.points_awarded
     or new.teacher_comment is distinct from old.teacher_comment
     or new.submission_id <> old.submission_id then
    raise exception 'Thành viên không được tự chấm câu trả lời.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger submission_answers_guard
  before insert or update on public.submission_answers
  for each row execute function private.guard_submission_answer();

alter table public.submission_answers enable row level security;

create policy submission_answers_select_own_or_staff
on public.submission_answers
for select
to authenticated
using (
  (select public.is_staff())
  or exists (
    select 1 from public.submissions s
    where s.id = submission_answers.submission_id
      and s.user_id = (select auth.uid())
  )
);

create policy submission_answers_insert_own_draft_or_staff
on public.submission_answers
for insert
to authenticated
with check (
  (select public.is_staff())
  or exists (
    select 1 from public.submissions s
    where s.id = submission_answers.submission_id
      and s.user_id = (select auth.uid())
      and s.status = 'draft'
  )
);

create policy submission_answers_update_own_draft_or_staff
on public.submission_answers
for update
to authenticated
using (
  (select public.is_staff())
  or exists (
    select 1 from public.submissions s
    where s.id = submission_answers.submission_id
      and s.user_id = (select auth.uid())
      and s.status = 'draft'
  )
)
with check (
  (select public.is_staff())
  or exists (
    select 1 from public.submissions s
    where s.id = submission_answers.submission_id
      and s.user_id = (select auth.uid())
      and s.status = 'draft'
  )
);

create policy submission_answers_delete_own_draft_or_staff
on public.submission_answers
for delete
to authenticated
using (
  (select public.is_staff())
  or exists (
    select 1 from public.submissions s
    where s.id = submission_answers.submission_id
      and s.user_id = (select auth.uid())
      and s.status = 'draft'
  )
);

-- ---------------------------------------------------------------------------
-- 14. activity_logs: chỉ staff đọc; không sửa / xoá qua API
-- ---------------------------------------------------------------------------

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_actor_id_idx on public.activity_logs (actor_id);
create index if not exists activity_logs_target_idx on public.activity_logs (target_table, target_id);

alter table public.activity_logs enable row level security;

create policy activity_logs_staff_select
on public.activity_logs
for select
to authenticated
using ((select public.is_staff()));

create policy activity_logs_staff_insert
on public.activity_logs
for insert
to authenticated
with check ((select public.is_staff()) and actor_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 15. Quyền bảng mới: anon chỉ giữ đúng quyền cần dùng
-- ---------------------------------------------------------------------------

revoke all on public.prayer_requests, public.prayer_comments, public.prayer_intercessions,
  public.event_registrations, public.contact_messages, public.testimonies,
  public.submission_answers, public.activity_logs
from anon;

grant select, insert, update, delete on public.prayer_requests, public.prayer_comments,
  public.prayer_intercessions, public.event_registrations, public.contact_messages,
  public.testimonies, public.submission_answers
to authenticated;
grant select, insert on public.activity_logs to authenticated;
revoke update, delete, truncate on public.activity_logs from authenticated;

grant insert on public.event_registrations, public.contact_messages to anon;
grant select on public.testimonies to anon;
