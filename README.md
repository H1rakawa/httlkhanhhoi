# HTTL. Khánh Hội

Website của Hội Thánh Tin Lành Khánh Hội: trang công khai (giới thiệu, tin tức, lịch sự kiện, thư viện,
truyền giảng, cầu thay, liên hệ), khu vực thành viên (bài tập, kết quả, hồ sơ) và trang quản trị cho ban mục vụ.

- **Next.js 16** (App Router, `src/proxy.ts` thay cho middleware), React 19, Tailwind CSS 4, HeroUI.
- **Supabase**: Postgres + RLS, Auth, Storage. Ứng dụng gọi PostgREST trực tiếp qua `supabaseDataRequest`
  bằng token của người dùng; chỉ một số API quản trị dùng service role.
- Deploy: Vercel, tự động khi push lên `main`.

## Chạy trên máy

```bash
yarn install
```

```bash
cp .env.example .env
```

Điền các biến trong `.env` (xem chú thích trong `.env.example`), rồi:

```bash
yarn dev
```

Mở <http://localhost:3000>.

| Lệnh | Việc |
| --- | --- |
| `yarn dev` | Chạy dev server |
| `yarn build` | Build production (nên chạy trước khi deploy) |
| `yarn lint` | ESLint |
| `yarn typecheck` | Kiểm tra kiểu TypeScript |
| `yarn test` | Unit test (Vitest, thư mục `tests/`) |

## Cấu trúc

```
src/
  app/            Trang và route API (App Router)
    admin/        Trang quản trị (chỉ ban mục vụ)
    api/          Route API; api/admin/* kiểm tra quyền bằng requireStaffApi
  com/            Component giao diện, chia theo khu vực
  lib/            Truy cập dữ liệu và nghiệp vụ (Supabase, quyền, chấm bài…)
  proxy.ts        Làm mới phiên đăng nhập khi access token sắp hết hạn
supabase/
  migrations/     Toàn bộ lịch sử schema, tên file khớp phiên bản trên Supabase
tests/            Unit test
```

## Phân quyền

| Vai trò | Được làm |
| --- | --- |
| `member` | Trang công khai, khu vực thành viên, làm bài tập, gửi cầu thay và lời làm chứng |
| `teacher` | Như member, cộng thêm toàn bộ trang quản trị **trừ** quản lý thành viên |
| `admin` | Toàn quyền, gồm quản lý thành viên |

Chỉ tài khoản có `status = 'active'` mới được vào trang quản trị. Ở mã nguồn, quyền được kiểm tra bằng
`requireStaffPage()` / `requireStaffApi()` trong `src/lib/admin/staff.ts` (truyền `{ adminOnly: true }`
cho chức năng chỉ dành cho admin). Ở database, RLS dùng `public.is_staff()` và `private.is_admin()`.
Sidebar quản trị ẩn các mục mà vai trò hiện tại không được dùng.

## Phiên đăng nhập

Đăng nhập lưu access token (1 giờ) và refresh token (30 ngày) trong cookie httpOnly. `src/proxy.ts` chạy
trước mỗi request trang/API: khi access token còn dưới 2 phút hoặc đã hết, proxy đổi refresh token lấy cặp
token mới, nên các trang render ở server không bị đăng xuất sau 1 giờ.

## Database

Các migration trong `supabase/migrations/` là bản đã áp dụng trên project. Khi đổi schema:

1. Viết file mới `supabase/migrations/<YYYYMMDDHHMMSS>_<ten>.sql`.
2. Áp dụng bằng Supabase CLI (`supabase db push`) hoặc SQL editor; nếu áp bằng công cụ khác, đổi tên file
   theo đúng `version` được ghi trong `supabase_migrations.schema_migrations`.

Cài Supabase CLI và liên kết project để đối chiếu repo với database:

```bash
supabase link --project-ref <project-ref>
```

```bash
supabase db pull
```

## Nội dung

- Dải thông báo trên trang chủ lấy bài **"Thông báo"** mới nhất đã đăng ở `/admin/news`.
- Sự kiện, tài liệu thư viện, lời làm chứng và bài tập nhập ở các trang quản trị tương ứng.
- Link Facebook/YouTube ở footer đặt bằng `NEXT_PUBLIC_FACEBOOK_URL` / `NEXT_PUBLIC_YOUTUBE_URL`.
