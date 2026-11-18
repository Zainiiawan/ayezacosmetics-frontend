import { db, getSql, newId, Doc } from './db';
import { createNotification } from './commerce';
import { logger } from './logger';
import { getMemberSettings, isPartner, round, MemberSettings } from './members';

/**
 * The multi-level network (Oriflame-style):
 * - Upline: a member's sponsor is `referredBy`; level 1 is the direct sponsor,
 *   level 2 that sponsor's sponsor, and so on.
 * - Points: every order credits BP and BV to the buyer ("personal") and to each
 *   upline partner up to `maxTeamLevels` ("team"). Each credit is one row in
 *   `points_entries`, reversed (kept, status 'reversed') if the order is closed.
 *   Group BV = personal BV + team BV for the month.
 * - Commission: `levelCommissionPct[n-1]` % of the order's value to the level-n
 *   upline, if that person is an active partner (an inactive level is skipped,
 *   not compressed: the level above still earns its own level's rate).
 * - Performance bonus: monthly, on group BV, as a differential (see payPerformanceBonus).
 */

export type CommissionShare = { user: string; level: number; pct: number; amount: number };

const month = (d?: string | Date) => new Date(d ?? Date.now()).toISOString().slice(0, 7);
const eligible = (u: Doc | null | undefined) => Boolean(u && isPartner(u) && u.isActive !== false);

/** People above `start` (start itself is level 1), up to `max` levels. Stops at a loop. */
export async function uplineFrom(start: Doc | null, max: number): Promise<{ level: number; user: Doc }[]> {
  const out: { level: number; user: Doc }[] = [];
  const seen = new Set<string>();
  let cur = start;
  for (let level = 1; cur && level <= max && !seen.has(cur._id); level++) {
    seen.add(cur._id);
    out.push({ level, user: cur });
    cur = cur.referredBy ? await db.users.findById(cur.referredBy) : null;
  }
  return out;
}

/** Whether `ancestorId` is somewhere above `userId` (used to stop loops and to scope tree views). */
export async function isInUpline(userId: string, ancestorId: string, max = 100): Promise<boolean> {
  const seen = new Set<string>();
  let cur = await db.users.findById(userId);
  for (let i = 0; cur?.referredBy && i < max && !seen.has(cur._id); i++) {
    seen.add(cur._id);
    if (cur.referredBy === ancestorId) return true;
    cur = await db.users.findById(cur.referredBy);
  }
  return false;
}

/** Commission for each upline level of an order whose direct sponsor is `sponsor`. */
export async function commissionChain(sponsor: Doc | null, buyerId: string | undefined, base: number, ms: MemberSettings): Promise<CommissionShare[]> {
  if (!sponsor || base <= 0) return [];
  const chain = await uplineFrom(sponsor, ms.levelCommissionPct.length);
  return chain
    .filter(({ level, user }) => eligible(user) && user._id !== buyerId && (ms.levelCommissionPct[level - 1] ?? 0) > 0)
    .map(({ level, user }) => {
      const pct = ms.levelCommissionPct[level - 1];
      return { user: user._id, level, pct, amount: round((base * pct) / 100) };
    })
    .filter((c) => c.amount > 0);
}

// ---------------------------------------------------------------------------
// Points ledger
// ---------------------------------------------------------------------------
/** Credit the order's BP/BV: personal to the buyer, team to each upline partner. Safe to call twice. */
export async function creditOrderPoints(order: Doc) {
  const m = order.member ?? {};
  const bp = Number(m.bp ?? 0);
  const bv = Number(m.bv ?? 0);
  if (!bp && !bv) return;
  const ms = await getMemberSettings();
  const period = month(order.createdAt);
  const base = { order: order._id, orderNumber: order.orderNumber, fromUser: order.user ?? null, bp, bv, month: period, status: 'active' };
  const rows: Record<string, unknown>[] = [];
  if (order.user) rows.push({ ...base, user: order.user, kind: 'personal', level: 0 });
  const sponsor = m.sponsor ? await db.users.findById(m.sponsor) : null;
  for (const { level, user } of await uplineFrom(sponsor, ms.maxTeamLevels)) {
    if (eligible(user) && user._id !== order.user) rows.push({ ...base, user: user._id, kind: 'team', level });
  }
  const sql = getSql();
  const now = new Date().toISOString();
  for (const r of rows) {
    const data = { ...r, createdAt: now, updatedAt: now };
    await sql`insert into points_entries (_id, data, created_at, updated_at) values (${newId()}, ${sql.json(data as any)}, ${now}, ${now})
              on conflict ("order", "user") do nothing`;
  }
}

/** The order was cancelled, refunded or returned: its points no longer count. */
export async function reverseOrderPoints(order: Doc, reason: string) {
  const sql = getSql();
  const now = new Date().toISOString();
  const patch = JSON.stringify({ status: 'reversed', reversedAt: now, reversedBecause: reason, updatedAt: now });
  await sql`update points_entries set data = data || ${patch}::text::jsonb, updated_at = ${now} where "order" = ${order._id} and status = 'active'`;
}

/** An admin edited the order's lines: bring its still-active points in line with the new totals. */
export async function syncOrderPoints(order: Doc) {
  const m = order.member ?? {};
  const sql = getSql();
  const now = new Date().toISOString();
  const patch = JSON.stringify({ bp: Number(m.bp ?? 0), bv: Number(m.bv ?? 0), updatedAt: now });
  await sql`update points_entries set data = data || ${patch}::text::jsonb, updated_at = ${now} where "order" = ${order._id} and status = 'active'`;
}

type Totals = { bp: number; bv: number };
const zero = (): Totals => ({ bp: 0, bv: 0 });

/** Personal, team and group BP/BV for one month and for all time, and team points by level. */
export async function pointsSummary(userId: string, period = month()) {
  const sql = getSql();
  const rows = await sql`
    select kind, month = ${period} as this_month, coalesce((data->>'level')::int, 0) as level,
           sum((data->>'bp')::numeric) as bp, sum((data->>'bv')::numeric) as bv, count(*)::int as n
      from points_entries where "user" = ${userId} and status = 'active'
     group by 1, 2, 3`;
  const out = { month: period, personal: zero(), team: zero(), group: zero(), lifetime: { personal: zero(), team: zero(), group: zero() }, byLevel: [] as { level: number; bp: number; bv: number; orders: number }[] };
  for (const r of rows as any[]) {
    const t = { bp: Number(r.bp), bv: Number(r.bv) };
    const life = out.lifetime[r.kind as 'personal' | 'team'];
    life.bp += t.bp;
    life.bv += t.bv;
    if (r.this_month) {
      const cur = out[r.kind as 'personal' | 'team'];
      cur.bp += t.bp;
      cur.bv += t.bv;
      if (r.kind === 'team') out.byLevel.push({ level: r.level, bp: t.bp, bv: t.bv, orders: r.n });
    }
  }
  out.group = { bp: out.personal.bp + out.team.bp, bv: out.personal.bv + out.team.bv };
  out.lifetime.group = { bp: out.lifetime.personal.bp + out.lifetime.team.bp, bv: out.lifetime.personal.bv + out.lifetime.team.bv };
  out.byLevel.sort((a, b) => a.level - b.level);
  return out;
}

/** Points ledger rows for a member, newest first. */
export async function pointsHistory(userId: string, period?: string, limit = 200) {
  const sql = getSql();
  const rows = period
    ? await sql`select _id, data from points_entries where "user" = ${userId} and month = ${period} order by created_at desc limit ${limit}`
    : await sql`select _id, data from points_entries where "user" = ${userId} order by created_at desc limit ${limit}`;
  return (rows as any[]).map((r) => ({ _id: r._id, ...r.data }));
}

// ---------------------------------------------------------------------------
// Downline and genealogy
// ---------------------------------------------------------------------------
export type DownlineRow = {
  _id: string;
  sponsor: string;
  level: number;
  data: Doc;
  createdAt: string;
  directCount: number;
  personal: Totals;
  team: Totals;
};

/** Everyone below `rootId`, level by level (1 = direct), with this month's points. */
export async function downline(rootId: string, maxDepth: number, period = month()): Promise<DownlineRow[]> {
  const sql = getSql();
  const rows = await sql`
    with recursive tree as (
      select _id, referred_by, 1 as level, array[_id] as path from users where referred_by = ${rootId}
      union all
      select u._id, u.referred_by, t.level + 1, t.path || u._id
        from users u join tree t on u.referred_by = t._id
       where t.level < ${maxDepth} and not u._id = any(t.path) and u._id <> ${rootId}
    )
    select t._id, t.referred_by, t.level, u.data, u.created_at,
           (select count(*)::int from users c where c.referred_by = t._id) as direct_count,
           coalesce(p.bp, 0) as personal_bp, coalesce(p.bv, 0) as personal_bv,
           coalesce(tm.bp, 0) as team_bp, coalesce(tm.bv, 0) as team_bv
      from tree t
      join users u on u._id = t._id
      left join lateral (select sum((e.data->>'bp')::numeric) as bp, sum((e.data->>'bv')::numeric) as bv from points_entries e
                          where e."user" = t._id and e.month = ${period} and e.status = 'active' and e.kind = 'personal') p on true
      left join lateral (select sum((e.data->>'bp')::numeric) as bp, sum((e.data->>'bv')::numeric) as bv from points_entries e
                          where e."user" = t._id and e.month = ${period} and e.status = 'active' and e.kind = 'team') tm on true
     order by t.level, u.created_at
     limit 5000`;
  return (rows as any[]).map((r) => ({
    _id: r._id,
    sponsor: r.referred_by,
    level: r.level,
    data: r.data,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    directCount: r.direct_count,
    personal: { bp: Number(r.personal_bp), bv: Number(r.personal_bv) },
    team: { bp: Number(r.team_bp), bv: Number(r.team_bv) },
  }));
}

// ---------------------------------------------------------------------------
// Performance bonus
// ---------------------------------------------------------------------------
export type BonusLine = { user: string; personalBV: number; groupBV: number; pct: number; amount: number; legs: { user: string; groupBV: number; pct: number }[] };

const tierPct = (pb: MemberSettings['performanceBonus'], groupBV: number) => {
  let pct = 0;
  for (const t of pb.tiers) if (groupBV >= t.minGroupBV) pct = t.pct;
  return pct;
};

/**
 * Work out the month's performance bonus for every partner, without paying it.
 * A partner earns tier% on the group BV that is not under another partner's
 * leg, plus the difference between their tier% and each direct partner's
 * tier% on that partner's group BV.
 */
export async function computePerformanceBonus(period: string, ms?: MemberSettings): Promise<BonusLine[]> {
  const settings = ms ?? (await getMemberSettings());
  const pb = settings.performanceBonus;
  const sql = getSql();
  const vol = await sql`
    select "user", coalesce(sum(case when kind = 'personal' then (data->>'bv')::numeric end), 0) as personal,
           coalesce(sum((data->>'bv')::numeric), 0) as grp
      from points_entries where month = ${period} and status = 'active' group by "user"`;
  const volume = new Map((vol as any[]).map((r) => [r.user, { personal: Number(r.personal), group: Number(r.grp) }]));
  const partners = await sql`select _id, referred_by, data#>>'{partner,status}' as pstatus, coalesce((data->>'isActive')::boolean, true) as active
                               from users where data#>>'{partner,status}' = 'approved'`;
  const partnerIds = new Set((partners as any[]).map((p) => p._id));
  const childrenOf = new Map<string, string[]>();
  for (const p of partners as any[]) {
    if (p.referred_by && partnerIds.has(p.referred_by)) childrenOf.set(p.referred_by, [...(childrenOf.get(p.referred_by) ?? []), p._id]);
  }
  const lines: BonusLine[] = [];
  for (const p of partners as any[]) {
    if (!p.active) continue;
    const v = volume.get(p._id) ?? { personal: 0, group: 0 };
    const pct = tierPct(pb, v.group);
    if (pct <= 0 || v.personal < pb.minPersonalBV) continue;
    const legs = (childrenOf.get(p._id) ?? []).map((c) => {
      const g = volume.get(c)?.group ?? 0;
      return { user: c, groupBV: g, pct: tierPct(pb, g) };
    });
    const own = Math.max(0, v.group - legs.reduce((s, l) => s + l.groupBV, 0));
    const pctPoints = pct * own + legs.reduce((s, l) => s + Math.max(0, pct - l.pct) * l.groupBV, 0);
    const amount = round((pctPoints / 100) * pb.rsPerBV);
    if (amount > 0) lines.push({ user: p._id, personalBV: v.personal, groupBV: v.group, pct, amount, legs });
  }
  return lines.sort((a, b) => b.amount - a.amount);
}

/** Pay the month's performance bonus into wallets. Paying a month twice is a no-op for whoever was already paid. */
export async function payPerformanceBonus(period: string) {
  const ms = await getMemberSettings();
  if (!ms.performanceBonus.enabled) return { paid: 0, total: 0, skipped: 0 };
  const lines = await computePerformanceBonus(period, ms);
  const sql = getSql();
  let paid = 0;
  let total = 0;
  let skipped = 0;
  for (const l of lines) {
    const now = new Date().toISOString();
    const data = {
      user: l.user,
      type: 'performance_bonus',
      amount: l.amount,
      status: 'available',
      month: period,
      pct: l.pct,
      groupBV: l.groupBV,
      note: `Performance bonus for ${period}: ${l.pct}% tier on ${l.groupBV.toLocaleString()} group BV`,
      createdAt: now,
      updatedAt: now,
    };
    const rows = await sql`insert into wallet_entries (_id, data, created_at, updated_at) values (${newId()}, ${sql.json(data as any)}, ${now}, ${now})
                           on conflict do nothing returning _id`;
    if (!rows.length) {
      skipped++;
      continue;
    }
    paid++;
    total += l.amount;
    try {
      await createNotification({
        userId: l.user,
        type: 'general',
        title: 'Performance bonus paid',
        message: `Rs. ${l.amount.toLocaleString()} for ${period} (${l.pct}% tier on ${l.groupBV.toLocaleString()} group BV) is in your wallet.`,
        link: '/account/partner?tab=wallet',
      });
    } catch (err) {
      logger.error('bonus notification failed', err);
    }
  }
  return { paid, total, skipped };
}
