-- Lấy từ supabase_migrations.schema_migrations (đã áp dụng trên project).

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update
on public.profiles
for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

drop function if exists public.is_admin();
