-- Multi-level network: points ledger (BP/BV), commission per upline level,
-- and the monthly performance bonus. Same document shape as 0001.

-- Points ledger: one row per credit. kind 'personal' is the buyer's own
-- points (level 0); kind 'team' is an upline's credit from a downline order
-- (level 1 = direct sponsor, 2 = their sponsor, ...). Reversed rows stay for
-- the record with status 'reversed'.
create table if not exists public.points_entries (
  _id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  "user" text generated always as (data->>'user') stored,
  "order" text generated always as (data->>'order') stored,
  kind text generated always as (data->>'kind') stored,
  month text generated always as (data->>'month') stored,
  status text generated always as (data->>'status') stored
);
create index if not exists points_entries_user_month_idx on public.points_entries ("user", month, status);
create index if not exists points_entries_order_idx on public.points_entries ("order");
-- an order credits each person once
create unique index if not exists points_entries_order_user_key on public.points_entries ("order", "user");

-- Commission: one per order per upline (was one per order)
drop index if exists public.wallet_entries_commission_key;
create unique index if not exists wallet_entries_commission_key on public.wallet_entries ("order", "user") where type = 'commission';

-- Performance bonus: once per partner per month
create unique index if not exists wallet_entries_bonus_month_key on public.wallet_entries ("user", (data->>'month')) where type = 'performance_bonus';

alter table public.points_entries enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'azeeora_app') then
    grant select, insert, update, delete on public.points_entries to azeeora_app;
    if not exists (select 1 from pg_policies where tablename = 'points_entries' and policyname = 'azeeora_app_all') then
      create policy azeeora_app_all on public.points_entries for all to azeeora_app using (true) with check (true);
    end if;
  end if;
end $$;
