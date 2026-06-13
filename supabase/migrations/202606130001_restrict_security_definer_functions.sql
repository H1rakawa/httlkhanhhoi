revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;
