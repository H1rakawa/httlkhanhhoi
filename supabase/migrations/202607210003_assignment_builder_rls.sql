alter table public.assignment_questions enable row level security;
alter table public.assignment_question_options enable row level security;

drop policy if exists "Authenticated users can read assignment questions"
on public.assignment_questions;

create policy "Authenticated users can read assignment questions"
on public.assignment_questions
for select
to authenticated
using (true);

drop policy if exists "Admins can manage assignment questions"
on public.assignment_questions;

create policy "Admins can manage assignment questions"
on public.assignment_questions
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  )
);

drop policy if exists "Authenticated users can read assignment question options"
on public.assignment_question_options;

create policy "Authenticated users can read assignment question options"
on public.assignment_question_options
for select
to authenticated
using (
  exists (
    select 1
    from public.assignment_questions
    where assignment_questions.id = assignment_question_options.question_id
  )
);

drop policy if exists "Admins can manage assignment question options"
on public.assignment_question_options;

create policy "Admins can manage assignment question options"
on public.assignment_question_options
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
      and profiles.status = 'active'
  )
);
