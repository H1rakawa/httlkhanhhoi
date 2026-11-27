create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  insert into public.profiles (id, name, email, phone, avatar_url, role)
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
    ),
    'member'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(nullif(public.profiles.name, ''), excluded.name),
    phone = coalesce(public.profiles.phone, excluded.phone),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$function$;

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  insert into public.profiles (id, name, email, phone, avatar_url, role)
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
    ),
    'member'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(nullif(excluded.name, ''), public.profiles.name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  return new;
end;
$function$;
