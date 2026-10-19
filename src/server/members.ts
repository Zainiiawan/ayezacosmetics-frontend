import crypto from 'crypto';
import { db, getSql, newId, Doc } from './db';
import { BadRequestError } from './http';
import { getSettings, createNotification } from './commerce';
import { logger } from './logger';

/**
 * Member programme: Brand Partners (single-level referral commission and a
 * partner discount on their own orders), wholesale (B2B) accounts, the wallet
 * ledger, loyalty points and monthly points (BV).
 *
 * Money rules:
 * - The wallet is a ledger (`wallet_entries`). Balance is the sum of rows with
 *   status 'available'. Every debit takes a per-user advisory lock inside a
 *   transaction, so two requests can never spend the same balance.
 * - A commission is created 'pending' when an order is placed, becomes
 *   'available' when the order is delivered and 'cancelled' if the order is
 *   cancelled/refunded before that. A refund after delivery books a reversal.
 */

export type MemberSettings = {
  referralCommissionPct: number;
  partnerDiscountTiers: { minBV: number; pct: number }[];
  wholesaleDefaultDiscountPct: number;
  wholesaleDefaultMinQty: number;
  minWithdrawal: number;
  loyaltyRsPerPoint: number;
  pointValueRs: number;
  minRedeemPoints: number;
  rsPerBV: number;
  couponsForMembers: boolean;
  /** First order of a customer who came through a partner's link */
  welcomeDiscountPct: number;
  /** Credited to a registered customer's wallet when their order is delivered */
  cashbackPct: number;
  claimWindowDays: number;
  /** Partner titles, lowest first. Group BV = own points plus points from people they referred, this month. */
  titles: Title[];
};

export type Title = { name: string; minPersonalBV: number; minGroupBV: number; minRecruits: number };

export const MEMBER_DEFAULTS: MemberSettings = {
  referralCommissionPct: 10,
  partnerDiscountTiers: [
    { minBV: 0, pct: 20 },
    { minBV: 100, pct: 25 },
    { minBV: 250, pct: 30 },
  ],
  wholesaleDefaultDiscountPct: 30,
  wholesaleDefaultMinQty: 6,
  minWithdrawal: 1000,
  loyaltyRsPerPoint: 100,
  pointValueRs: 1,
  minRedeemPoints: 100,
  rsPerBV: 100,
  couponsForMembers: false,
  welcomeDiscountPct: 0,
  cashbackPct: 0,
  claimWindowDays: 14,
  titles: [
    { name: 'Brand Partner', minPersonalBV: 0, minGroupBV: 0, minRecruits: 0 },
    { name: 'Senior Partner', minPersonalBV: 50, minGroupBV: 200, minRecruits: 1 },
    { name: 'Team Leader', minPersonalBV: 100, minGroupBV: 600, minRecruits: 3 },
    { name: 'Manager', minPersonalBV: 100, minGroupBV: 1500, minRecruits: 5 },
    { name: 'Director', minPersonalBV: 150, minGroupBV: 4000, minRecruits: 10 },
  ],
};

export async function getMemberSettings(): Promise<MemberSettings> {
  const s = await getSettings();
  const m = { ...MEMBER_DEFAULTS, ...(s.members ?? {}) };
  m.partnerDiscountTiers = [...(m.partnerDiscountTiers ?? MEMBER_DEFAULTS.partnerDiscountTiers)].sort((a, b) => a.minBV - b.minBV);
  m.titles = [...(m.titles?.length ? m.titles : MEMBER_DEFAULTS.titles)].sort((a, b) => a.minGroupBV - b.minGroupBV);
  return m;
}

export const round = (n: number) => Math.round(n);

// ---------------------------------------------------------------------------
// Account type
// ---------------------------------------------------------------------------
export const isPartner = (u?: Doc | null) => u?.partner?.status === 'approved';
export const isBusiness = (u?: Doc | null) => u?.business?.status === 'approved';

export function accountType(u?: Doc | null): 'business' | 'partner' | 'customer' {
  if (isBusiness(u)) return 'business';
  if (isPartner(u)) return 'partner';
  return 'customer';
}

export function partnerDiscountPct(settings: MemberSettings, monthlyBV = 0): number {
  let pct = 0;
  for (const t of settings.partnerDiscountTiers) if (monthlyBV >= t.minBV) pct = t.pct;
  return pct;
}

export function nextTier(settings: MemberSettings, monthlyBV = 0) {
  return settings.partnerDiscountTiers.find((t) => t.minBV > monthlyBV) ?? null;
}

/** Points (BV) for one unit: the product's own value, else price / rsPerBV. */
export function unitBV(product: Doc, salePrice: number, settings: MemberSettings): number {
  if (typeof product.bv === 'number' && product.bv >= 0) return product.bv;
  return Math.max(0, Math.round(salePrice / Math.max(1, settings.rsPerBV)));
}

export function wholesaleTerms(product: Doc, retailPrice: number, settings: MemberSettings) {
  const price =
    typeof product.wholesalePrice === 'number' && product.wholesalePrice > 0
      ? product.wholesalePrice
      : round(retailPrice * (1 - settings.wholesaleDefaultDiscountPct / 100));
  const minQty = product.wholesaleMinQty && product.wholesaleMinQty > 0 ? product.wholesaleMinQty : settings.wholesaleDefaultMinQty;
  return { price, minQty };
}

// ---------------------------------------------------------------------------
// Member codes
// ---------------------------------------------------------------------------
export async function uniqueMemberCode(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = 'AZ-' + (100000 + crypto.randomInt(900000));
    if (!(await db.users.findOne({ memberCode: code }))) return code;
  }
  throw new Error('Could not generate a member code');
}

/** Personal invite codes: letters, digits and dashes. */
export const INVITE_CODE_RE = /^[A-Z0-9][A-Z0-9-]{2,18}[A-Z0-9]$/;

/** An approved, active partner with this member code or personal invite code (case-insensitive), or null. */
export async function findSponsor(code?: string | null): Promise<Doc | null> {
  if (!code) return null;
  const clean = String(code).trim().toUpperCase();
  if (!INVITE_CODE_RE.test(clean)) return null;
  const u = /^AZ-\d{6}$/.test(clean) ? await db.users.findOne({ memberCode: clean }) : await db.users.findOne({ inviteAlias: clean });
  if (!u || !isPartner(u) || u.isActive === false) return null;
  return u;
}

// ---------------------------------------------------------------------------
// Wallet ledger
// ---------------------------------------------------------------------------
type EntryInput = {
  user: string;
  type: 'commission' | 'cashback' | 'claim_refund' | 'withdrawal' | 'withdrawal_reversal' | 'order_payment' | 'order_refund' | 'adjustment' | 'commission_reversal' | 'cashback_reversal';
  amount: number; // signed: + credit, - debit
  status: 'pending' | 'available' | 'cancelled';
  order?: string;
  orderNumber?: string;
  fromUser?: string;
  note?: string;
  withdrawal?: string;
};

export async function walletSummary(userId: string) {
  const sql = getSql();
  const rows = await sql`
    select
      coalesce(sum(case when status = 'available' then (data->>'amount')::numeric end), 0) as available,
      coalesce(sum(case when status = 'pending' then (data->>'amount')::numeric end), 0) as pending,
      coalesce(sum(case when status = 'available' and type = 'commission' then (data->>'amount')::numeric end), 0) as earned,
      coalesce(-sum(case when status = 'available' and type in ('withdrawal', 'withdrawal_reversal') then (data->>'amount')::numeric end), 0) as withdrawn
    from wallet_entries where "user" = ${userId}`;
  const r = rows[0] as any;
  return {
    available: Number(r.available),
    pending: Number(r.pending),
    earned: Number(r.earned),
    withdrawn: Number(r.withdrawn),
  };
}

/** Insert ledger rows in one transaction. Debits (negative available amounts) must be covered by the balance. */
export async function postEntries(entries: EntryInput[]): Promise<Doc[]> {
  const sql = getSql();
  const users = Array.from(new Set(entries.map((e) => e.user))).sort();
  return sql.begin(async (tx: any) => {
    for (const u of users) await tx`select pg_advisory_xact_lock(hashtext(${'wallet:' + u}))`;
    for (const u of users) {
      const debit = entries
        .filter((e) => e.user === u && e.status === 'available' && e.amount < 0)
        .reduce((s, e) => s + e.amount, 0);
      if (debit < 0) {
        const rows = await tx`select coalesce(sum((data->>'amount')::numeric), 0) as bal from wallet_entries where "user" = ${u} and status = 'available'`;
        const bal = Number(rows[0].bal);
        if (bal + debit < -0.0001) throw new BadRequestError('Insufficient wallet balance');
      }
    }
    const out: Doc[] = [];
    const now = new Date().toISOString();
    for (const e of entries) {
      const id = newId();
      const data = JSON.parse(JSON.stringify({ ...e, amount: round(e.amount * 100) / 100, createdAt: now, updatedAt: now }));
      await tx`insert into wallet_entries (_id, data, created_at, updated_at) values (${id}, ${tx.json(data)}, ${now}, ${now})`;
      out.push({ _id: id, ...data });
    }
    return out;
  });
}

async function setEntryStatus(entryId: string, status: EntryInput['status'], extra: Record<string, unknown> = {}) {
  const sql = getSql();
  const now = new Date().toISOString();
  const patch = JSON.stringify({ status, ...extra, updatedAt: now });
  await sql`update wallet_entries set data = data || ${patch}::text::jsonb, updated_at = ${now} where _id = ${entryId}`;
}

// ---------------------------------------------------------------------------
// Loyalty points and monthly BV (atomic counters on the user document)
// ---------------------------------------------------------------------------
/** Add (or with a negative delta, spend) a numeric counter on a user. Spending fails if it would go below zero. */
export async function bumpUserCounter(userId: string, field: 'loyaltyPoints' | 'monthlyBV' | 'totalBV' | 'referredBV', delta: number) {
  if (!delta) return true;
  const sql = getSql();
  const now = new Date().toISOString();
  const rows = await sql`
    update users
       set data = jsonb_set(data, ${[field]}::text[], to_jsonb(coalesce((data->>${field})::numeric, 0) + ${delta}::numeric)),
           updated_at = ${now}
     where _id = ${userId}
       and (${delta}::numeric >= 0 or coalesce((data->>${field})::numeric, 0) + ${delta}::numeric >= 0)
     returning _id`;
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Order lifecycle hooks
// ---------------------------------------------------------------------------

/**
 * Called right after an order is created. Books the pending commission and
 * credits points (BV) to the buyer (if a partner) and the sponsor's team BV.
 */
export async function onOrderPlaced(order: Doc) {
  try {
    const m = order.member ?? {};
    if (order.user && m.bv && m.buyerType === 'partner') {
      await bumpUserCounter(order.user, 'monthlyBV', m.bv);
      await bumpUserCounter(order.user, 'totalBV', m.bv);
    }
    if (order.user && m.cashback > 0) {
      await postEntries([
        { user: order.user, type: 'cashback', amount: m.cashback, status: 'pending', order: order._id, orderNumber: order.orderNumber, note: `${m.cashbackPct}% cashback on order ${order.orderNumber}` },
      ]);
    }
    if (m.sponsor && m.commission > 0) {
      await postEntries([
        {
          user: m.sponsor,
          type: 'commission',
          amount: m.commission,
          status: 'pending',
          order: order._id,
          orderNumber: order.orderNumber,
          fromUser: order.user ?? undefined,
          note: `${m.commissionPct}% referral commission on order ${order.orderNumber}`,
        },
      ]);
      if (m.bv) await bumpUserCounter(m.sponsor, 'referredBV', m.bv);
      await createNotification({
        userId: m.sponsor,
        type: 'general',
        title: 'New referral order',
        message: `Order ${order.orderNumber} earns you Rs. ${m.commission.toLocaleString()} once it is delivered.`,
        link: '/account/partner',
      });
    }
  } catch (err) {
    logger.error('onOrderPlaced failed', err);
  }
}

const CLOSED = ['cancelled', 'refunded', 'returned'];

/** Called whenever an order's status changes (admin status update, customer cancel, delete). */
export async function onOrderStatusChange(order: Doc, previousStatus: string) {
  const status = order.status;
  if (status === previousStatus) return;
  const m = order.member ?? {};
  const sql = getSql();

  try {
    const commissionRows = await sql`select _id, data from wallet_entries where "order" = ${order._id} and type = 'commission' limit 1`;
    const commission = commissionRows[0] as any;
    const cashbackRows = await sql`select _id, data from wallet_entries where "order" = ${order._id} and type = 'cashback' limit 1`;
    const cashback = cashbackRows[0] as any;

    if (status === 'delivered' && !CLOSED.includes(previousStatus)) {
      // Commission becomes spendable; loyalty points are earned
      if (commission && commission.data.status === 'pending') {
        await setEntryStatus(commission._id, 'available', { releasedAt: new Date().toISOString() });
        await createNotification({
          userId: commission.data.user,
          type: 'general',
          title: 'Commission added to your wallet',
          message: `Rs. ${Number(commission.data.amount).toLocaleString()} from order ${order.orderNumber} is now available.`,
          link: '/account/partner?tab=wallet',
        });
      }
      if (cashback && cashback.data.status === 'pending') {
        await setEntryStatus(cashback._id, 'available', { releasedAt: new Date().toISOString() });
        await createNotification({
          userId: cashback.data.user,
          type: 'general',
          title: 'Cashback added to your wallet',
          message: `Rs. ${Number(cashback.data.amount).toLocaleString()} cashback from order ${order.orderNumber} is ready to spend.`,
          link: '/account/earnings',
        });
      }
      if (order.user && m.pointsEarned > 0 && !m.pointsCredited) {
        await bumpUserCounter(order.user, 'loyaltyPoints', m.pointsEarned);
        await db.orders.updateById(order._id, { member: { ...m, pointsCredited: true } });
        order.member = { ...m, pointsCredited: true };
      }
    }

    if (CLOSED.includes(status) && !CLOSED.includes(previousStatus)) {
      const entries: EntryInput[] = [];
      if (commission) {
        if (commission.data.status === 'pending') {
          await setEntryStatus(commission._id, 'cancelled', { cancelledAt: new Date().toISOString() });
        } else if (commission.data.status === 'available') {
          entries.push({
            user: commission.data.user,
            type: 'commission_reversal',
            amount: -Number(commission.data.amount),
            status: 'available',
            order: order._id,
            orderNumber: order.orderNumber,
            note: `Order ${order.orderNumber} was ${status}`,
          });
        }
      }
      if (cashback) {
        if (cashback.data.status === 'pending') await setEntryStatus(cashback._id, 'cancelled', { cancelledAt: new Date().toISOString() });
        else if (cashback.data.status === 'available')
          entries.push({ user: cashback.data.user, type: 'cashback_reversal', amount: -Number(cashback.data.amount), status: 'available', order: order._id, orderNumber: order.orderNumber, note: `Cashback taken back: order ${order.orderNumber} was ${status}` });
      }
      // Give back wallet money and redeemed points to the buyer
      if (order.user && m.walletUsed > 0) {
        entries.push({
          user: order.user,
          type: 'order_refund',
          amount: m.walletUsed,
          status: 'available',
          order: order._id,
          orderNumber: order.orderNumber,
          note: `Refund for ${status} order ${order.orderNumber}`,
        });
      }
      // Reversals may take a partner's balance below zero, so they bypass the balance check
      if (entries.length) await postCredits(entries);
      if (order.user && m.pointsRedeemed > 0) await bumpUserCounter(order.user, 'loyaltyPoints', m.pointsRedeemed);
      if (order.user && m.pointsCredited && m.pointsEarned > 0) {
        // Take back what's left if some of the earned points were already spent
        const u = await db.users.findById(order.user);
        const back = Math.min(m.pointsEarned, Number(u?.loyaltyPoints ?? 0));
        if (back > 0) await bumpUserCounter(order.user, 'loyaltyPoints', -back);
      }
      if (order.user && m.bv && m.buyerType === 'partner' && !m.bvReversed) {
        await bumpUserCounter(order.user, 'monthlyBV', -m.bv);
        await bumpUserCounter(order.user, 'totalBV', -m.bv);
      }
      if (m.sponsor && m.bv) await bumpUserCounter(m.sponsor, 'referredBV', -m.bv);
      await db.orders.updateById(order._id, { member: { ...m, bvReversed: true } });
    }
  } catch (err) {
    logger.error('onOrderStatusChange failed', err);
  }
}

/** Ledger rows that must be written even if they take a balance negative (reversals, refunds). */
async function postCredits(entries: EntryInput[]) {
  const sql = getSql();
  const now = new Date().toISOString();
  await sql.begin(async (tx: any) => {
    for (const e of entries) {
      const data = JSON.parse(JSON.stringify({ ...e, createdAt: now, updatedAt: now }));
      await tx`insert into wallet_entries (_id, data, created_at, updated_at) values (${newId()}, ${tx.json(data)}, ${now}, ${now})`;
    }
  });
}

/** Admin edited an order's lines: keep a still-pending commission in step with the new total. */
export async function recalcPendingCommission(order: Doc) {
  const m = order.member ?? {};
  if (!m.sponsor || !m.commissionPct) return;
  const merchandise = Math.max(0, (order.subtotal ?? 0) - (order.discount ?? 0) - (order.manualDiscount ?? 0));
  const amount = round((merchandise * m.commissionPct) / 100);
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`update wallet_entries set data = data || ${JSON.stringify({ amount, updatedAt: now })}::text::jsonb, updated_at = ${now}
            where "order" = ${order._id} and type = 'commission' and status = 'pending'`;
  await db.orders.updateById(order._id, { member: { ...m, commission: amount } });
}

export { postCredits };

// ---------------------------------------------------------------------------
// Titles (rank qualification), worked out live for the current month
// ---------------------------------------------------------------------------
export async function titleProgress(u: Doc, ms?: MemberSettings) {
  const settings = ms ?? (await getMemberSettings());
  const sql = getSql();
  const month = new Date().toISOString().slice(0, 7);
  const personalBV = Number(u.monthlyBV ?? 0);
  const team = await sql`
    select coalesce(sum((data#>>'{member,bv}')::numeric), 0) as bv
      from orders
     where data#>>'{member,sponsor}' = ${u._id}
       and status not in ('cancelled', 'refunded', 'returned')
       and to_char(created_at, 'YYYY-MM') = ${month}`;
  const recruits = await sql`
    select count(*)::int as n from users
     where referred_by = ${u._id} and data#>>'{partner,status}' = 'approved'`;
  const groupBV = personalBV + Number((team[0] as any).bv);
  const recruitCount = Number((recruits[0] as any).n);
  const meets = (t: Title) => personalBV >= t.minPersonalBV && groupBV >= t.minGroupBV && recruitCount >= t.minRecruits;
  let current = settings.titles[0];
  for (const t of settings.titles) if (meets(t)) current = t;
  const idx = settings.titles.indexOf(current);
  const next = settings.titles[idx + 1] ?? null;
  return { title: current.name, personalBV, groupBV, recruits: recruitCount, next, titles: settings.titles };
}
