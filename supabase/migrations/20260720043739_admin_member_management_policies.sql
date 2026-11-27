-- Lấy từ supabase_migrations.schema_migrations (đã áp dụng trên project).

create extension if not exists pg_trgm with schema extensions;

create or replace function public.is_admin()
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

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_admin_update'
  ) then
    create policy profiles_admin_update
    on public.profiles
    for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
  end if;
end $$;

create index if not exists profiles_role_status_created_at_idx
on public.profiles (role, status, created_at desc);

create index if not exists profiles_name_email_search_idx
on public.profiles using gin ((name || ' ' || email) extensions.gin_trgm_ops);
