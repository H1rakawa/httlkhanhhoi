-- Lấy từ supabase_migrations.schema_migrations (đã áp dụng trên project).

-- Keep public.profiles tightly coupled to auth.users while keeping user-editable fields safe.

-- 1) Ensure every current auth user has a profile and normalize profile email.
insert into public.profiles (id, name, email, phone, avatar_url, role, status, created_at, updated_at)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    nullif(u.raw_user_meta_data ->> 'display_name', ''),
    nullif(u.raw_user_meta_data ->> 'preferred_username', ''),
    split_part(coalesce(u.email, u.id::text || '@no-email.local'), '@', 1),
    ''
  ) as name,
  lower(coalesce(u.email, u.id::text || '@no-email.local')) as email,
  nullif(u.raw_user_meta_data ->> 'phone', '') as phone,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(u.raw_user_meta_data ->> 'picture', '')
  ) as avatar_url,
  'member'::public.user_role,
  'active'::public.user_status,
  coalesce(u.created_at, now()),
  now()
from auth.users u
on conflict (id) do update set
  email = excluded.email,
  name = coalesce(nullif(public.profiles.name, ''), excluded.name),
  phone = coalesce(public.profiles.phone, excluded.phone),
  avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
  updated_at = now();

-- 2) Harden profile creation from Auth. Use upsert so retries/manual pre-creation do not break sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
      split_part(coalesce(new.email, new.id::text || '@no-email.local'), '@', 1),
      ''
    ),
    lower(coalesce(new.email, new.id::text || '@no-email.local')),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    )
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
    phone = coalesce(public.profiles.phone, excluded.phone),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

-- 3) Sync safe profile fields when Auth user metadata/email changes.
create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
      split_part(coalesce(new.email, new.id::text || '@no-email.local'), '@', 1),
      ''
    ),
    lower(coalesce(new.email, new.id::text || '@no-email.local')),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(new.raw_user_meta_data ->> 'picture', '')
    )
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(nullif(excluded.name, ''), public.profiles.name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row
execute function public.sync_profile_from_auth_user();

-- 4) Query indexes for dashboard/admin/member filtering.
create index if not exists profiles_role_status_idx on public.profiles (role, status);
create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_lower_email_idx on public.profiles (lower(email));
create index if not exists profiles_created_at_desc_idx on public.profiles (created_at desc);

-- 5) Keep the auth.users -> profiles relationship explicit even if older migrations drift.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_id_fkey
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
end;
$$;

-- 6) Tighten grants. RLS still decides rows; grants decide editable columns.
revoke all on table public.profiles from anon;
revoke update (id, email, role, status, created_at, updated_at) on public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (name, phone, avatar_url) on public.profiles to authenticated;

-- Recreate the self-update policy so it is simple and column grants carry sensitive-field protection.
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
