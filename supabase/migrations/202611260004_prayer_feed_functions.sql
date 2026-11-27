-- Đọc lời cầu thay và lời động viên kèm tên người gửi.
--
-- Bảng profiles chỉ cho thành viên đọc hồ sơ của chính mình, nên trang /pray
-- không lấy được tên người khác qua REST. Hai hàm SECURITY DEFINER dưới đây
-- trả về đúng những gì người gọi được xem:
--   * cùng điều kiện hiển thị với policy prayer_requests_select;
--   * lời cầu nguyện ẩn danh không lộ tên/ảnh (trừ chính chủ và ban mục vụ);
--   * chỉ trả tên + ảnh đại diện, không trả email hay số điện thoại.

create or replace function public.get_prayer_feed(p_limit integer default null)
returns table (
  id bigint,
  title text,
  content text,
  category text,
  privacy text,
  is_anonymous boolean,
  status text,
  image_url text,
  intercession_count integer,
  created_at timestamptz,
  answered_at timestamptz,
  is_mine boolean,
  has_interceded boolean,
  comment_count bigint,
  author_name text,
  author_avatar text
)
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select (select auth.uid()) as uid, public.is_staff() as staff
  )
  select
    p.id,
    p.title,
    p.content,
    p.category,
    p.privacy,
    p.is_anonymous,
    p.status,
    p.image_url,
    p.intercession_count,
    p.created_at,
    p.answered_at,
    p.user_id = v.uid as is_mine,
    exists (
      select 1 from public.prayer_intercessions i
      where i.prayer_id = p.id and i.user_id = v.uid
    ) as has_interceded,
    (select count(*) from public.prayer_comments c where c.prayer_id = p.id) as comment_count,
    case when p.is_anonymous and p.user_id <> v.uid and not v.staff
      then null else pr.name end as author_name,
    case when p.is_anonymous and p.user_id <> v.uid and not v.staff
      then null else pr.avatar_url end as author_avatar
  from public.prayer_requests p
  cross join viewer v
  left join public.profiles pr on pr.id = p.user_id
  where v.uid is not null
    and (
      (p.privacy = 'public' and p.status in ('approved', 'answered'))
      or p.user_id = v.uid
      or v.staff
    )
  order by p.created_at desc
  limit p_limit;
$$;

create or replace function public.get_prayer_comments(p_prayer_id bigint)
returns table (
  id bigint,
  message text,
  image_url text,
  created_at timestamptz,
  is_mine boolean,
  author_name text,
  author_avatar text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    c.message,
    c.image_url,
    c.created_at,
    c.user_id = (select auth.uid()) as is_mine,
    pr.name,
    pr.avatar_url
  from public.prayer_comments c
  join public.prayer_requests p on p.id = c.prayer_id
  left join public.profiles pr on pr.id = c.user_id
  where c.prayer_id = p_prayer_id
    and (select auth.uid()) is not null
    and (
      (p.privacy = 'public' and p.status in ('approved', 'answered'))
      or p.user_id = (select auth.uid())
      or public.is_staff()
    )
  order by c.created_at asc;
$$;

revoke all on function public.get_prayer_feed(integer) from public, anon;
revoke all on function public.get_prayer_comments(bigint) from public, anon;
grant execute on function public.get_prayer_feed(integer) to authenticated;
grant execute on function public.get_prayer_comments(bigint) to authenticated;
