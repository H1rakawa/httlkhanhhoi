-- anon không có quyền EXECUTE public.is_staff() (xem restrict_security_definer_functions),
-- nên các policy SELECT dùng chung cho anon + authenticated có gọi is_staff() làm khách
-- gặp lỗi "permission denied for function is_staff" khi đọc events (embed media_assets),
-- resources và testimonies. Tách policy: anon chỉ đọc dữ liệu công khai, authenticated giữ nguyên.

-- media_assets
drop policy if exists media_assets_public_read on public.media_assets;

create policy media_assets_anon_read_public
on public.media_assets
for select
to anon
using (visibility = 'public');

create policy media_assets_authenticated_read
on public.media_assets
for select
to authenticated
using (
  visibility = 'public'
  or uploaded_by = (select auth.uid())
  or (select public.is_staff())
);

-- resources
drop policy if exists resources_read_published_or_staff on public.resources;

create policy resources_anon_read_published
on public.resources
for select
to anon
using (is_published);

create policy resources_authenticated_read
on public.resources
for select
to authenticated
using (is_published or (select public.is_staff()));

-- testimonies
drop policy if exists testimonies_select on public.testimonies;

create policy testimonies_anon_read_approved
on public.testimonies
for select
to anon
using (status = 'approved');

create policy testimonies_authenticated_read
on public.testimonies
for select
to authenticated
using (
  status = 'approved'
  or user_id = (select auth.uid())
  or (select public.is_staff())
);
