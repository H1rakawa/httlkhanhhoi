-- Vai trò mới: quản trị viên (admin), quản nhiệm (pastor), nhân sự (staff, thay cho teacher),
-- chấp sự (deacon), tín hữu (member).
alter type public.user_role rename value 'teacher' to 'staff';
alter type public.user_role add value if not exists 'deacon' before 'admin';
alter type public.user_role add value if not exists 'pastor' before 'admin';
