-- Member tools: claims and returns, service requests, "What's new" news,
-- favourite lists, personal invite codes and member cashback. Same document
-- shape as 0001.

-- Personal invite code chosen by a partner (in addition to the AZ-123456 code)
alter table public.users add column if not exists invite_alias text generated always as (data->>'inviteAlias') stored;
create unique index if not exists users_invite_alias_key on public.users (invite_alias) where invite_alias is not null;
-- Members a partner registered, waiting to set their password
alter table public.users add column if not exists activation_token text generated always as (data->>'activationToken') stored;
create index if not exists users_activation_token_idx on public.users (activation_token) where activation_token is not null;

-- one cashback per order
create unique index if not exists wallet_entries_cashback_key on public.wallet_entries ("order") where type = 'cashback';

create table if not exists public.claims (
  _id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  "user" text generated always as (data->>'user') stored,
  "order" text generated always as (data->>'order') stored,
  status text generated always as (data->>'status') stored
);
create index if not exists claims_user_idx on public.claims ("user");
create index if not exists claims_order_idx on public.claims ("order");
-- at most one open claim per order
create unique index if not exists claims_open_key on public.claims ("order") where status = 'open';

create table if not exists public.tickets (
  _id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  "user" text generated always as (data->>'user') stored,
  status text generated always as (data->>'status') stored
);
create index if not exists tickets_user_idx on public.tickets ("user");

create table if not exists public.news (
  _id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favourite_lists (
  _id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  "user" text generated always as (data->>'user') stored,
  share_token text generated always as (data->>'shareToken') stored
);
create index if not exists favourite_lists_user_idx on public.favourite_lists ("user");
create unique index if not exists favourite_lists_share_key on public.favourite_lists (share_token);

alter table public.claims enable row level security;
alter table public.tickets enable row level security;
alter table public.news enable row level security;
alter table public.favourite_lists enable row level security;

do $$
declare t text;
begin
  if exists (select 1 from pg_roles where rolname = 'azeeora_app') then
    foreach t in array array['claims','tickets','news','favourite_lists']
    loop
      execute format('grant select, insert, update, delete on public.%I to azeeora_app', t);
      if not exists (select 1 from pg_policies where tablename = t and policyname = 'azeeora_app_all') then
        execute format('create policy azeeora_app_all on public.%I for all to azeeora_app using (true) with check (true)', t);
      end if;
    end loop;
  end if;
end $$;
