-- Ban mục vụ (vào trang quản trị): quản trị viên, quản nhiệm, nhân sự đang hoạt động.
create or replace function public.is_staff()
returns boolean
language sql
stable security definer
set search_path to ''
as $function$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'pastor', 'staff') and status = 'active'
  );
$function$;
