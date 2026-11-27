-- Lấy từ supabase_migrations.schema_migrations (đã áp dụng trên project).

alter table public.profiles
add column if not exists is_online boolean not null default false,
add column if not exists last_seen_at timestamptz;

create index if not exists profiles_presence_idx
on public.profiles (is_online, last_seen_at desc);
