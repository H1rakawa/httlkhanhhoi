-- Hiệu năng RLS (Supabase advisor):
-- 1. auth.uid() / is_staff() bọc trong (select ...) để chỉ tính một lần cho mỗi truy vấn.
-- 2. Gộp các policy permissive trùng hành động: tách policy "ALL" của ban mục vụ thành
--    insert / update / delete để SELECT chỉ còn một policy.
-- 3. Câu hỏi và đáp án bài tập: mở cho cả giáo viên (is_staff), thống nhất với bảng assignments.

-- profiles ------------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_staff()));

drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_update_own_or_admin on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));

-- notifications -------------------------------------------------------------
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists notifications_own_update on public.notifications;
create policy notifications_own_update on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists notifications_staff_insert on public.notifications;
create policy notifications_staff_insert on public.notifications
  for insert to authenticated
  with check ((select public.is_staff()));

-- comments ------------------------------------------------------------------
drop policy if exists comments_insert_own on public.comments;
create policy comments_insert_own on public.comments
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists comments_delete_own_or_staff on public.comments;
create policy comments_delete_own_or_staff on public.comments
  for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_staff()));

-- assignments ---------------------------------------------------------------
drop policy if exists assignments_staff_manage on public.assignments;
create policy assignments_staff_insert on public.assignments
  for insert to authenticated with check ((select public.is_staff()));
create policy assignments_staff_update on public.assignments
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy assignments_staff_delete on public.assignments
  for delete to authenticated using ((select public.is_staff()));

-- assignment_questions ------------------------------------------------------
drop policy if exists "Admins can manage assignment questions" on public.assignment_questions;
create policy assignment_questions_staff_insert on public.assignment_questions
  for insert to authenticated with check ((select public.is_staff()));
create policy assignment_questions_staff_update on public.assignment_questions
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy assignment_questions_staff_delete on public.assignment_questions
  for delete to authenticated using ((select public.is_staff()));

-- assignment_question_options -----------------------------------------------
drop policy if exists "Admins can manage assignment question options" on public.assignment_question_options;
create policy assignment_question_options_staff_insert on public.assignment_question_options
  for insert to authenticated with check ((select public.is_staff()));
create policy assignment_question_options_staff_update on public.assignment_question_options
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy assignment_question_options_staff_delete on public.assignment_question_options
  for delete to authenticated using ((select public.is_staff()));

-- events --------------------------------------------------------------------
drop policy if exists events_staff_manage on public.events;
create policy events_staff_insert on public.events
  for insert to authenticated with check ((select public.is_staff()));
create policy events_staff_update on public.events
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy events_staff_delete on public.events
  for delete to authenticated using ((select public.is_staff()));

-- news_posts: khách chỉ đọc bài đã đăng; người đăng nhập đọc bài đã đăng, ban mục vụ đọc tất cả.
drop policy if exists news_posts_public_read_published on public.news_posts;
drop policy if exists news_posts_staff_manage on public.news_posts;
create policy news_posts_anon_read_published on public.news_posts
  for select to anon using (status = 'published');
create policy news_posts_authenticated_read on public.news_posts
  for select to authenticated using (status = 'published' or (select public.is_staff()));
create policy news_posts_staff_insert on public.news_posts
  for insert to authenticated with check ((select public.is_staff()));
create policy news_posts_staff_update on public.news_posts
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy news_posts_staff_delete on public.news_posts
  for delete to authenticated using ((select public.is_staff()));
