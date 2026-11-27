-- Lấy từ supabase_migrations.schema_migrations (đã áp dụng trên project).

-- Profiles are created by auth.users triggers, not directly by browser clients.
revoke insert on table public.profiles from authenticated;
revoke insert on table public.profiles from anon;
