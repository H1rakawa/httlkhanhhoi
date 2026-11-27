-- Trang /assignment/[id]/result cần cho thành viên thấy đáp án đúng của câu trắc nghiệm.
-- Cột assignment_question_options.is_correct vẫn bị chặn SELECT với thành viên
-- (tránh lộ đáp án khi đang làm bài). Hàm này chỉ trả đáp án khi người gọi đã có
-- bài nộp ĐÃ CHẤM cho bài tập đó, hoặc là ban mục vụ.

create or replace function public.get_assignment_answer_key(p_assignment_id bigint)
returns table (question_id bigint, option_id bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select o.question_id, o.id
  from public.assignment_question_options o
  join public.assignment_questions q on q.id = o.question_id
  where q.assignment_id = p_assignment_id
    and o.is_correct
    and (
      public.is_staff()
      or exists (
        select 1
        from public.submissions s
        where s.assignment_id = p_assignment_id
          and s.user_id = (select auth.uid())
          and s.status = 'graded'
      )
    )
  order by o.question_id, o.sort_order;
$$;

revoke execute on function public.get_assignment_answer_key(bigint) from public, anon;
grant execute on function public.get_assignment_answer_key(bigint) to authenticated;
