-- Upline (level 2+) commission is stored as type 'team_commission', so the
-- original one-commission-per-order index can stay as it is. Each upline is
-- paid at most once per order.
create unique index if not exists wallet_entries_team_commission_key on public.wallet_entries ("order", "user") where type = 'team_commission';
