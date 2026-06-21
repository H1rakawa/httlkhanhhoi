create index if not exists resources_uploaded_by_idx
on public.resources (uploaded_by);

create index if not exists resources_media_asset_id_idx
on public.resources (media_asset_id);

create index if not exists assignments_created_by_idx
on public.assignments (created_by);

create index if not exists assignments_media_asset_id_idx
on public.assignments (media_asset_id);

create index if not exists events_created_by_idx
on public.events (created_by);

create index if not exists comments_user_id_idx
on public.comments (user_id);

drop policy if exists "media_assets_public_read" on public.media_assets;
create policy "media_assets_public_read"
on public.media_assets for select
to anon, authenticated
using (
  visibility = 'public'
  or uploaded_by = (select auth.uid())
  or (select public.is_staff())
);

drop policy if exists "media_assets_authenticated_insert" on public.media_assets;
create policy "media_assets_authenticated_insert"
on public.media_assets for insert
to authenticated
with check (uploaded_by = (select auth.uid()) or (select public.is_staff()));

drop policy if exists "media_assets_owner_or_staff_update" on public.media_assets;
create policy "media_assets_owner_or_staff_update"
on public.media_assets for update
to authenticated
using (uploaded_by = (select auth.uid()) or (select public.is_staff()))
with check (uploaded_by = (select auth.uid()) or (select public.is_staff()));

drop policy if exists "media_assets_owner_or_staff_delete" on public.media_assets;
create policy "media_assets_owner_or_staff_delete"
on public.media_assets for delete
to authenticated
using (uploaded_by = (select auth.uid()) or (select public.is_staff()));

drop policy if exists "church_media_authenticated_upload_own_folder" on storage.objects;
create policy "church_media_authenticated_upload_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('church-images', 'church-videos', 'church-audio', 'church-documents')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "church_media_owner_or_staff_update" on storage.objects;
create policy "church_media_owner_or_staff_update"
on storage.objects for update
to authenticated
using (
  bucket_id in ('church-images', 'church-videos', 'church-audio', 'church-documents')
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_staff()))
)
with check (
  bucket_id in ('church-images', 'church-videos', 'church-audio', 'church-documents')
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_staff()))
);

drop policy if exists "church_media_owner_or_staff_delete" on storage.objects;
create policy "church_media_owner_or_staff_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('church-images', 'church-videos', 'church-audio', 'church-documents')
  and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_staff()))
);
