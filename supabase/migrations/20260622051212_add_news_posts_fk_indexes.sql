-- Lấy từ supabase_migrations.schema_migrations (đã áp dụng trên project).

create index if not exists news_posts_media_asset_id_idx
on public.news_posts (media_asset_id);

create index if not exists news_posts_created_by_idx
on public.news_posts (created_by);
