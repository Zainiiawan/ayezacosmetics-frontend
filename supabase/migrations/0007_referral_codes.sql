-- Every member gets a referral code in sequence: AZEEORA0001, AZEEORA0002, ...
-- Numbers come from a sequence, so two sign-ups at the same moment can never
-- get the same code; the unique index is the final guard.
create sequence if not exists public.referral_code_seq start 1;

alter table public.users add column if not exists referral_code text generated always as (data->>'referralCode') stored;
create unique index if not exists users_referral_code_key on public.users (referral_code) where referral_code is not null;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'azeeora_app') then
    grant usage, select, update on sequence public.referral_code_seq to azeeora_app;
  end if;
end $$;

-- Existing verified members, oldest first, get codes before anyone new
with todo as (
  select _id, row_number() over (order by created_at, _id) as n
    from public.users
   where data->>'referralCode' is null and coalesce((data->>'isEmailVerified')::boolean, false)
),
base as (select coalesce(max(substring(data->>'referralCode' from 8)::int), 0) as start from public.users where data->>'referralCode' ~ '^AZEEORA[0-9]+$')
update public.users u
   set data = jsonb_set(u.data, '{referralCode}', to_jsonb('AZEEORA' || lpad((base.start + todo.n)::text, greatest(4, length((base.start + todo.n)::text)), '0')))
  from todo, base
 where u._id = todo._id;

select setval('public.referral_code_seq', greatest(1, (select coalesce(max(substring(data->>'referralCode' from 8)::int), 0) from public.users where data->>'referralCode' ~ '^AZEEORA[0-9]+$')),
              (select count(*) > 0 from public.users where data->>'referralCode' ~ '^AZEEORA[0-9]+$'));
