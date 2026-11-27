-- Số người đã đăng ký (tổng attendees, không tính bản huỷ) cho từng sự kiện.
-- anon không SELECT được event_registrations, nên /calendar và /preachout đọc số đếm qua hàm này.
-- Chỉ trả về số tổng, không lộ thông tin cá nhân người đăng ký.
create or replace function public.event_registration_counts()
returns table (event_id bigint, registered bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select r.event_id, coalesce(sum(r.attendees), 0)::bigint as registered
  from public.event_registrations r
  where r.status <> 'cancelled'
  group by r.event_id;
$$;

revoke all on function public.event_registration_counts() from public;
grant execute on function public.event_registration_counts() to anon, authenticated;
