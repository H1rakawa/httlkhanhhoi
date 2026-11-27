-- Ban ngành của thành viên (một người có thể thuộc nhiều ban). Chỉ quản trị viên đổi được
-- (cột không cấp quyền UPDATE cho authenticated). Danh sách khớp src/lib/ministries.ts.
alter table public.profiles
  add column if not exists ministries text[] not null default '{}';

alter table public.profiles
  add constraint profiles_ministries_valid check (
    ministries <@ array[
      'thieu_nhi', 'thieu_nien', 'thanh_nien', 'thanh_trang', 'trang_nien', 'trung_nien',
      'lao_nien', 'phu_nu', 'dan', 'am_thanh', 'may_chieu', 'giu_xe', 'cam_hoa'
    ]::text[]
  );

create index if not exists profiles_ministries_idx on public.profiles using gin (ministries);
