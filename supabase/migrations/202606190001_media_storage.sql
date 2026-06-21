insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'church-images',
    'church-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'church-videos',
    'church-videos',
    true,
    524288000,
    array['video/mp4', 'video/webm', 'video/quicktime']::text[]
  ),
  (
    'church-audio',
    'church-audio',
    true,
    104857600,
    array['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg']::text[]
  ),
  (
    'church-documents',
    'church-documents',
    true,
    52428800,
    array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  object_path text not null,
  public_url text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  media_kind text not null check (media_kind in ('image', 'video', 'audio', 'document')),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  related_table text check (related_table in ('resources', 'assignments', 'profiles', 'events')),
  related_id text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_id, object_path)
);

create index if not exists media_assets_related_idx
on public.media_assets (related_table, related_id, created_at desc);

create index if not exists media_assets_uploaded_by_idx
on public.media_assets (uploaded_by, created_at desc);

alter table public.resources
add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null,
add column if not exists thumbnail_url text,
add column if not exists mime_type text,
add column if not exists size_bytes bigint check (size_bytes is null or size_bytes >= 0);

alter table public.assignments
add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null;

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

alter table public.media_assets enable row level security;

drop policy if exists "media_assets_public_read" on public.media_assets;
create policy "media_assets_public_read"
on public.media_assets for select
to anon, authenticated
using (visibility = 'public' or uploaded_by = auth.uid() or public.is_staff());

drop policy if exists "media_assets_authenticated_insert" on public.media_assets;
create policy "media_assets_authenticated_insert"
on public.media_assets for insert
to authenticated
with check (uploaded_by = auth.uid() or public.is_staff());

drop policy if exists "media_assets_owner_or_staff_update" on public.media_assets;
create policy "media_assets_owner_or_staff_update"
on public.media_assets for update
to authenticated
using (uploaded_by = auth.uid() or public.is_staff())
with check (uploaded_by = auth.uid() or public.is_staff());

drop policy if exists "media_assets_owner_or_staff_delete" on public.media_assets;
create policy "media_assets_owner_or_staff_delete"
on public.media_assets for delete
to authenticated
using (uploaded_by = auth.uid() or public.is_staff());

drop policy if exists "church_media_public_read" on storage.objects;
create policy "church_media_public_read"
on storage.objects for select
to anon, authenticated
using (
  bucket_id in ('church-images', 'church-videos', 'church-audio', 'church-documents')
);

drop policy if exists "church_media_authenticated_upload_own_folder" on storage.objects;
create policy "church_media_authenticated_upload_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('church-images', 'church-videos', 'church-audio', 'church-documents')
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "church_media_owner_or_staff_update" on storage.objects;
create policy "church_media_owner_or_staff_update"
on storage.objects for update
to authenticated
using (
  bucket_id in ('church-images', 'church-videos', 'church-audio', 'church-documents')
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
)
with check (
  bucket_id in ('church-images', 'church-videos', 'church-audio', 'church-documents')
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
);

drop policy if exists "church_media_owner_or_staff_delete" on storage.objects;
create policy "church_media_owner_or_staff_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('church-images', 'church-videos', 'church-audio', 'church-documents')
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
);
