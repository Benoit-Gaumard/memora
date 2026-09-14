-- Allows signing in with a username instead of an email.
-- The profiles table is RLS-protected (users can only read their own row),
-- so this security-definer function exposes only the minimal lookup needed
-- to resolve "username -> auth email" for the login form, without letting
-- anonymous visitors browse the profiles table itself.

create or replace function public.get_login_email(p_username text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select email
  from public.profiles
  where lower(username) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.get_login_email(text) from public;
grant execute on function public.get_login_email(text) to anon, authenticated;
