-- Lấy từ supabase_migrations.schema_migrations (đã áp dụng trên project).

drop policy if exists "news_posts_public_read_published" on public.news_posts;
create policy "news_posts_public_read_published"
on public.news_posts for select
to anon, authenticated
using (status = 'published');
