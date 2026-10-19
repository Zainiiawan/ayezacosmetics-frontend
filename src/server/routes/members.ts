import { z } from 'zod';
import { db, getSql, Doc } from '../db';
import { Router, json, validate, authenticate, adminOnly, BadRequestError, NotFoundError, ForbiddenError } from '../http';
import { createNotification, notifyAdmins, getSettings, applyProductDiscount } from '../commerce';
import {
  MEMBER_DEFAULTS,
  accountType,
  getMemberSettings,
  isBusiness,
  isPartner,
  nextTier,
  partnerDiscountPct,
  postEntries,
  postCredits,
  uniqueMemberCode,
  walletSummary,
  wholesaleTerms,
  findSponsor,
  titleProgress,
  INVITE_CODE_RE,
} from '../members';
import crypto from 'crypto';
import { hashToken } from '../jwt';
import { canSendEmail } from '../email';

export const members = new Router();

const phone = z.string().min(7).max(20);
const cnic = z.string().regex(/^\d{5}-?\d{7}-?\d$/, 'CNIC must be 13 digits, e.g. 35202-1234567-1');

const maskName = (u: Doc) => `${u.firstName ?? ''} ${String(u.lastName ?? '').slice(0, 1)}.`.trim();

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
  );
}

/** Everything the account screens need about the signed-in member. */
async function memberProfile(u: Doc) {
  const ms = await getMemberSettings();
  const type = accountType(u);
  const monthlyBV = Number(u.monthlyBV ?? 0);
  const profile: Record<string, any> = {
    accountType: type,
    memberCode: u.memberCode ?? null,
    partner: u.partner ?? null,
    business: u.business ?? null,
    kyc: u.kyc ? { ...u.kyc, accountNumber: u.kyc.accountNumber ? `•••• ${String(u.kyc.accountNumber).slice(-4)}` : undefined } : null,
    loyaltyPoints: Number(u.loyaltyPoints ?? 0),
    monthlyBV,
    lastMonthBV: Number(u.lastMonthBV ?? 0),
    totalBV: Number(u.totalBV ?? 0),
    referredBV: Number(u.referredBV ?? 0),
    wallet: await walletSummary(u._id),
    settings: {
      referralCommissionPct: ms.referralCommissionPct,
      partnerDiscountTiers: ms.partnerDiscountTiers,
      minWithdrawal: ms.minWithdrawal,
      minRedeemPoints: ms.minRedeemPoints,
      pointValueRs: ms.pointValueRs,
      loyaltyRsPerPoint: ms.loyaltyRsPerPoint,
      wholesaleDefaultDiscountPct: ms.wholesaleDefaultDiscountPct,
      wholesaleDefaultMinQty: ms.wholesaleDefaultMinQty,
    },
  };
  if (type === 'partner') {
    profile.discountPct = partnerDiscountPct(ms, monthlyBV);
    profile.nextTier = nextTier(ms, monthlyBV);
    const code = u.inviteAlias ?? u.memberCode;
    profile.inviteAlias = u.inviteAlias ?? null;
    profile.inviteCode = code;
    profile.links = {
      store: `${siteUrl()}/?ref=${code}`,
      join: `${siteUrl()}/join?ref=${code}`,
      member: `${siteUrl()}/register?ref=${code}`,
    };
    profile.titleProgress = await titleProgress(u, ms);
  }
  profile.preferences = { shareContact: Boolean(u.preferences?.shareContact), myWhy: u.preferences?.myWhy ?? '' };
  profile.welcomeDiscountPct = ms.welcomeDiscountPct;
  profile.cashbackPct = ms.cashbackPct;
  if (u.referredBy) {
    const s = await db.users.findById(u.referredBy);
    if (s) {
      profile.sponsor = { name: maskName(s), memberCode: s.memberCode };
      // Contact details only when the sponsor chose to share them
      if (s.preferences?.shareContact) {
        profile.sponsor.phone = s.partner?.whatsapp || s.partner?.phone || s.phone || null;
        profile.sponsor.email = s.email;
      }
    }
  }
  return profile;
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------
members.get('/ref/:code', async ({ params }) => {
  const s = await findSponsor(params.code);
  return json({ success: true, message: 'Referral code', data: s ? { valid: true, name: maskName(s), memberCode: s.memberCode } : { valid: false } });
});

members.get('/programme', async () => {
  const ms = await getMemberSettings();
  return json({
    success: true,
    message: 'Programme',
    data: {
      referralCommissionPct: ms.referralCommissionPct,
      partnerDiscountTiers: ms.partnerDiscountTiers,
      wholesaleDefaultDiscountPct: ms.wholesaleDefaultDiscountPct,
      wholesaleDefaultMinQty: ms.wholesaleDefaultMinQty,
      minWithdrawal: ms.minWithdrawal,
      loyaltyRsPerPoint: ms.loyaltyRsPerPoint,
      pointValueRs: ms.pointValueRs,
      minRedeemPoints: ms.minRedeemPoints,
    },
  });
});

// ---------------------------------------------------------------------------
// Signed-in member
// ---------------------------------------------------------------------------
members.get('/me', authenticate, async ({ user }) => {
  const u = await db.users.findById(user!._id);
  if (!u) throw new NotFoundError('User');
  return json({ success: true, message: 'Member profile', data: await memberProfile(u) });
});

const partnerApplySchema = z.object({
  phone,
  whatsapp: z.string().max(20).optional(),
  cnic,
  city: z.string().min(2).max(60),
  address: z.string().max(200).optional(),
  dateOfBirth: z.string().max(20).optional(),
  experience: z.string().max(500).optional(),
  refCode: z.string().max(20).optional(),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'Please accept the Brand Partner terms' }) }),
});

members.post('/partner/apply', authenticate, validate(partnerApplySchema), async ({ body, user }) => {
  const u = await db.users.findById(user!._id);
  if (!u) throw new NotFoundError('User');
  if (u.role === 'admin') throw new BadRequestError('Admin accounts cannot join as partners');
  if (isBusiness(u)) throw new BadRequestError('Wholesale accounts cannot also be Brand Partners');
  if (u.partner?.status === 'approved') throw new BadRequestError('You are already a Brand Partner');
  if (u.partner?.status === 'pending') throw new BadRequestError('Your application is already under review');
  if (u.partner?.status === 'suspended') throw new ForbiddenError('Your partner account is suspended. Please contact us.');

  if (!u.referredBy && body.refCode) {
    const s = await findSponsor(body.refCode);
    if (!s) throw new BadRequestError('That referral code is not valid');
    if (s._id !== u._id) Object.assign(u, { referredBy: s._id, referredAt: new Date().toISOString() });
  }
  const { agreeTerms, refCode, ...details } = body;
  void agreeTerms;
  void refCode;
  u.partner = { ...details, cnic: details.cnic.replace(/-/g, ''), status: 'pending', appliedAt: new Date().toISOString() };
  if (!u.phone) u.phone = body.phone;
  await db.users.save(u);
  await notifyAdmins({ type: 'general', title: 'New Brand Partner application', message: `${u.firstName} ${u.lastName} applied to become a Brand Partner.`, link: '/admin/members?tab=partners' });
  return json({ success: true, message: 'Application received. We will review it shortly.', data: await memberProfile(u) }, 201);
});

const businessApplySchema = z.object({
  companyName: z.string().min(2).max(120),
  businessType: z.enum(['salon', 'retail_shop', 'pharmacy', 'distributor', 'online_store', 'other']),
  contactPhone: phone,
  city: z.string().min(2).max(60),
  address: z.string().min(5).max(250),
  ntn: z.string().max(20).optional(),
  monthlyVolume: z.string().max(60).optional(),
  notes: z.string().max(500).optional(),
});

members.post('/business/apply', authenticate, validate(businessApplySchema), async ({ body, user }) => {
  const u = await db.users.findById(user!._id);
  if (!u) throw new NotFoundError('User');
  if (u.role === 'admin') throw new BadRequestError('Admin accounts cannot open wholesale accounts');
  if (isPartner(u)) throw new BadRequestError('Brand Partner accounts cannot also be wholesale accounts');
  if (u.business?.status === 'approved') throw new BadRequestError('Your wholesale account is already active');
  if (u.business?.status === 'pending') throw new BadRequestError('Your application is already under review');
  if (u.business?.status === 'suspended') throw new ForbiddenError('Your wholesale account is suspended. Please contact us.');
  u.business = { ...body, status: 'pending', appliedAt: new Date().toISOString() };
  await db.users.save(u);
  await notifyAdmins({ type: 'general', title: 'New wholesale application', message: `${body.companyName} (${u.firstName} ${u.lastName}) applied for a wholesale account.`, link: '/admin/members?tab=business' });
  return json({ success: true, message: 'Application received. We will review it shortly.', data: await memberProfile(u) }, 201);
});

const kycSchema = z.object({
  cnic,
  method: z.enum(['bank', 'jazzcash', 'easypaisa']),
  accountTitle: z.string().min(2).max(80),
  accountNumber: z.string().min(6).max(34),
  bankName: z.string().max(80).optional(),
});

members.post('/kyc', authenticate, validate(kycSchema), async ({ body, user }) => {
  const u = await db.users.findById(user!._id);
  if (!u) throw new NotFoundError('User');
  if (u.kyc?.status === 'pending') throw new BadRequestError('Your details are already under review');
  if (body.method === 'bank' && !body.bankName) throw new BadRequestError('Bank name is required');
  u.kyc = { ...body, cnic: body.cnic.replace(/-/g, ''), status: 'pending', submittedAt: new Date().toISOString() };
  await db.users.save(u);
  await notifyAdmins({ type: 'general', title: 'Payout details to verify', message: `${u.firstName} ${u.lastName} submitted payout details.`, link: '/admin/members?tab=kyc' });
  return json({ success: true, message: 'Details submitted for verification', data: await memberProfile(u) }, 201);
});

members.get('/referrals', authenticate, async ({ user }) => {
  const u = await db.users.findById(user!._id);
  if (!isPartner(u)) throw new ForbiddenError('Only Brand Partners have referrals');
  const sql = getSql();
  const people = await db.users.find({ referredBy: u!._id }, { sort: { createdAt: -1 }, limit: 500 });
  const commissions = await sql`
    select coalesce(sum(case when status <> 'cancelled' then (data->>'amount')::numeric end),0) as total, data->>'fromUser' as from_user, count(*)::int as orders
    from wallet_entries where "user" = ${u!._id} and type = 'commission' group by data->>'fromUser'`;
  const byUser = new Map(commissions.map((r: any) => [r.from_user, r]));
  const list = people.map((p) => {
    const c: any = byUser.get(p._id);
    return {
      _id: p._id,
      name: maskName(p),
      joinedAt: p.referredAt ?? p.createdAt,
      type: accountType(p),
      orders: c ? c.orders : 0,
      commission: c ? Number(c.total) : 0,
    };
  });
  const guest: any = byUser.get(null as any);
  return json({ success: true, message: 'Referrals', data: { people: list, guestOrders: guest ? { orders: guest.orders, commission: Number(guest.total) } : { orders: 0, commission: 0 } } });
});

members.get('/wallet', authenticate, async ({ user, query }) => {
  const sql = getSql();
  const limit = Math.min(200, Number(query.limit ?? 50));
  const rows = await sql`select _id, data from wallet_entries where "user" = ${user!._id} order by created_at desc limit ${limit}`;
  const withdrawals = await db.withdrawals.find({ user: user!._id }, { sort: { createdAt: -1 }, limit: 50 });
  return json({
    success: true,
    message: 'Wallet',
    data: {
      summary: await walletSummary(user!._id),
      entries: rows.map((r: any) => ({ _id: r._id, ...r.data })),
      withdrawals,
    },
  });
});

const withdrawSchema = z.object({ amount: z.number().positive() });

members.post('/withdrawals', authenticate, validate(withdrawSchema), async ({ body, user }) => {
  const u = await db.users.findById(user!._id);
  if (!u) throw new NotFoundError('User');
  const ms = await getMemberSettings();
  if (u.kyc?.status !== 'approved') throw new BadRequestError('Verify your payout details before withdrawing');
  const amount = Math.floor(body.amount);
  if (amount < ms.minWithdrawal) throw new BadRequestError(`The minimum withdrawal is Rs. ${ms.minWithdrawal.toLocaleString()}`);
  const pending = await db.withdrawals.count({ user: u._id, status: 'requested' });
  if (pending > 0) throw new BadRequestError('You already have a withdrawal waiting to be paid');

  const w = await db.withdrawals.create({
    user: u._id,
    amount,
    status: 'requested',
    method: u.kyc.method,
    accountTitle: u.kyc.accountTitle,
    accountNumber: u.kyc.accountNumber,
    bankName: u.kyc.bankName,
    memberCode: u.memberCode,
    name: `${u.firstName} ${u.lastName}`,
  });
  try {
    // Holds the money now (fails cleanly if the balance is too low)
    await postEntries([{ user: u._id, type: 'withdrawal', amount: -amount, status: 'available', withdrawal: w._id, note: `Withdrawal to ${u.kyc.method === 'bank' ? u.kyc.bankName : u.kyc.method}` }]);
  } catch (err) {
    await db.withdrawals.deleteById(w._id);
    throw err;
  }
  await notifyAdmins({ type: 'general', title: 'Withdrawal request', message: `${u.firstName} ${u.lastName} requested Rs. ${amount.toLocaleString()}.`, link: '/admin/members?tab=withdrawals' });
  return json({ success: true, message: 'Withdrawal requested', data: w }, 201);
});

members.get('/wholesale-prices', authenticate, async ({ user }) => {
  const u = await db.users.findById(user!._id);
  if (!isBusiness(u)) throw new ForbiddenError('Only approved wholesale accounts can see wholesale prices');
  const ms = await getMemberSettings();
  const products = await db.products.find({ isActive: true }, { sort: { name: 1 } });
  const data = products.map((p) => {
    const retail = applyProductDiscount(p, p.basePrice);
    const t = wholesaleTerms(p, retail, ms);
    return { productId: p._id, slug: p.slug, name: p.name, image: p.images?.[0]?.url ?? '', retailPrice: retail, price: Math.min(retail, t.price), minQty: t.minQty, stock: p.stock };
  });
  return json({ success: true, message: 'Wholesale prices', data });
});


// ---------------------------------------------------------------------------
// Partner tools
// ---------------------------------------------------------------------------
async function requirePartner(userId: string) {
  const u = await db.users.findById(userId);
  if (!u) throw new NotFoundError('User');
  if (!isPartner(u)) throw new ForbiddenError('This is for Brand Partners');
  return u;
}

const inviteSchema = z.object({ code: z.string().trim().min(4).max(20) });

/** A partner picks a personal invite code (e.g. SARA-BEAUTY) used in their links. */
members.put('/invite-code', authenticate, validate(inviteSchema), async ({ body, user }) => {
  const u = await requirePartner(user!._id);
  const code = body.code.toUpperCase();
  if (!INVITE_CODE_RE.test(code)) throw new BadRequestError('Use 4 to 20 letters, numbers or dashes');
  if (/^AZ-\d{6}$/.test(code)) throw new BadRequestError('Pick a code that is different from member codes');
  const last = u.inviteAliasChangedAt ? new Date(u.inviteAliasChangedAt).getTime() : 0;
  if (u.inviteAlias && Date.now() - last < 30 * 86400000) throw new BadRequestError('You can change your invite code once every 30 days');
  const taken = await db.users.findOne({ inviteAlias: code });
  if (taken && taken._id !== u._id) throw new BadRequestError('That code is taken. Try another.');
  try {
    await db.users.updateById(u._id, { inviteAlias: code, inviteAliasChangedAt: new Date().toISOString() });
  } catch {
    throw new BadRequestError('That code is taken. Try another.');
  }
  return json({ success: true, message: 'Invite code saved', data: await memberProfile((await db.users.findById(u._id))!) });
});

const prefsSchema = z.object({ shareContact: z.boolean().optional(), myWhy: z.string().max(500).optional() });

members.put('/preferences', authenticate, validate(prefsSchema), async ({ body, user }) => {
  const u = await db.users.findById(user!._id);
  if (!u) throw new NotFoundError('User');
  await db.users.updateById(u._id, { preferences: { ...(u.preferences ?? {}), ...body } });
  return json({ success: true, message: 'Preferences saved', data: await memberProfile((await db.users.findById(u._id))!) });
});

/** Downline report: everyone the partner referred, with this month's activity. */
members.get('/team', authenticate, async ({ user, query }) => {
  const u = await requirePartner(user!._id);
  const sql = getSql();
  const month = new Date().toISOString().slice(0, 7);
  const rows = await sql`
    select p._id, p.data, p.created_at,
      (select count(*)::int from orders o where o.user_id = p._id and o.status not in ('cancelled','refunded','returned') and to_char(o.created_at,'YYYY-MM') = ${month}) as month_orders,
      (select coalesce(sum((o.data->>'total')::numeric),0) from orders o where o.user_id = p._id and o.status not in ('cancelled','refunded','returned') and to_char(o.created_at,'YYYY-MM') = ${month}) as month_sales,
      (select coalesce(sum((o.data#>>'{member,bv}')::numeric),0) from orders o where o.user_id = p._id and o.status not in ('cancelled','refunded','returned') and to_char(o.created_at,'YYYY-MM') = ${month}) as month_bv,
      (select count(*)::int from orders o where o.user_id = p._id and o.status not in ('cancelled','refunded','returned')) as all_orders,
      (select max(o.created_at) from orders o where o.user_id = p._id) as last_order
    from users p where p.referred_by = ${u._id}
    order by p.created_at desc limit 1000`;
  const now = Date.now();
  let people = rows.map((r: any) => {
    const d = r.data;
    const joined = d.referredAt ?? r.created_at;
    return {
      _id: r._id,
      name: maskName(d),
      city: d.partner?.city ?? d.addresses?.[0]?.city ?? '',
      type: accountType(d),
      joinedAt: joined,
      activated: !d.activationToken,
      monthOrders: r.month_orders,
      monthSales: Number(r.month_sales),
      monthBV: Number(r.month_bv),
      allOrders: r.all_orders,
      lastOrderAt: r.last_order,
      isNew: now - new Date(joined).getTime() < 31 * 86400000,
      starter: r.all_orders > 0 && now - new Date(joined).getTime() < 62 * 86400000,
    };
  });
  const filter = String(query.filter ?? 'all');
  if (filter === 'new') people = people.filter((p) => p.isNew);
  if (filter === 'active') people = people.filter((p) => p.monthOrders > 0);
  if (filter === 'inactive') people = people.filter((p) => p.monthOrders === 0);
  if (filter === 'partners') people = people.filter((p) => p.type === 'partner');
  if (filter === 'not_activated') people = people.filter((p) => !p.activated);
  const totals = {
    people: rows.length,
    active: rows.filter((r: any) => r.month_orders > 0).length,
    newThisMonth: rows.filter((r: any) => String(r.data.referredAt ?? r.created_at.toISOString()).slice(0, 7) === month).length,
    monthSales: rows.reduce((s: number, r: any) => s + Number(r.month_sales), 0),
    monthBV: rows.reduce((s: number, r: any) => s + Number(r.month_bv), 0),
  };
  return json({ success: true, message: 'Team', data: { people, totals, month } });
});

/** Earnings for one month: what was earned, by kind, and what the member saved. */
members.get('/earnings', authenticate, async ({ user, query }) => {
  const sql = getSql();
  const period = /^\d{4}-\d{2}$/.test(String(query.period ?? '')) ? String(query.period) : new Date().toISOString().slice(0, 7);
  const rows = await sql`
    select type, status, coalesce(sum((data->>'amount')::numeric),0) as amount, count(*)::int as n
      from wallet_entries
     where "user" = ${user!._id} and to_char(created_at, 'YYYY-MM') = ${period}
     group by type, status`;
  const pick = (type: string, status?: string) =>
    rows.filter((r: any) => r.type === type && (!status || r.status === status)).reduce((s: number, r: any) => s + Number(r.amount), 0);
  const saved = await sql`
    select coalesce(sum((data#>>'{member,memberDiscount}')::numeric),0) as member_discount,
           coalesce(sum((data->>'discount')::numeric),0) as discounts,
           coalesce(sum((data->>'pointsDiscount')::numeric),0) as points
      from orders where user_id = ${user!._id} and status not in ('cancelled','refunded','returned') and to_char(created_at,'YYYY-MM') = ${period}`;
  const months = await sql`
    select distinct to_char(created_at,'YYYY-MM') as p from wallet_entries where "user" = ${user!._id}
    union select distinct to_char(created_at,'YYYY-MM') from orders where user_id = ${user!._id}
    order by 1 desc limit 24`;
  const sv: any = saved[0];
  const data = {
    period,
    periods: Array.from(new Set([new Date().toISOString().slice(0, 7), ...months.map((m: any) => m.p)])),
    commission: { pending: pick('commission', 'pending'), available: pick('commission', 'available'), cancelled: pick('commission', 'cancelled') },
    cashback: { pending: pick('cashback', 'pending'), available: pick('cashback', 'available') },
    claimRefunds: pick('claim_refund', 'available'),
    reversals: pick('commission_reversal') + pick('cashback_reversal'),
    adjustments: pick('adjustment'),
    withdrawn: -(pick('withdrawal') + pick('withdrawal_reversal')),
    immediateDiscounts: Number(sv.member_discount) + Number(sv.discounts) + Number(sv.points),
  };
  const total = data.commission.pending + data.commission.available + data.cashback.pending + data.cashback.available + data.claimRefunds + data.reversals + data.adjustments;
  return json({ success: true, message: 'Earnings', data: { ...data, estimated: total } });
});

/** This month's leading partners (first name, initial and city only). */
members.get('/recognition', authenticate, async ({ user }) => {
  const me = await db.users.findById(user!._id);
  if (!isPartner(me) && me?.role !== 'admin') throw new ForbiddenError('Recognition is for Brand Partners');
  const sql = getSql();
  const month = new Date().toISOString().slice(0, 7);
  const rows = await sql`
    select u._id, u.data,
      coalesce((u.data->>'monthlyBV')::numeric,0)
      + coalesce((select sum((o.data#>>'{member,bv}')::numeric) from orders o where o.data#>>'{member,sponsor}' = u._id and o.status not in ('cancelled','refunded','returned') and to_char(o.created_at,'YYYY-MM') = ${month}),0) as group_bv,
      coalesce((u.data->>'monthlyBV')::numeric,0) as personal_bv
    from users u
    where u.data#>>'{partner,status}' = 'approved' and coalesce((u.data->>'isActive')::boolean, true)
    order by group_bv desc, u.created_at asc limit 100`;
  const ms = await getMemberSettings();
  const titleFor = (personal: number, group: number) => {
    let t = ms.titles[0].name;
    for (const x of ms.titles) if (personal >= x.minPersonalBV && group >= x.minGroupBV) t = x.name;
    return t;
  };
  const list = rows
    .filter((r: any) => Number(r.group_bv) > 0)
    .map((r: any, i: number) => ({
      rank: i + 1,
      name: maskName(r.data),
      city: r.data.partner?.city ?? '',
      groupBV: Number(r.group_bv),
      title: titleFor(Number(r.personal_bv), Number(r.group_bv)),
      isMe: r._id === user!._id,
    }));
  return json({ success: true, message: 'Recognition', data: { month, list } });
});

/** Products a partner cannot sell right now. */
members.get('/out-of-stock', authenticate, async ({ user }) => {
  await requirePartner(user!._id);
  const list = await db.products.find({ isActive: true }, { sort: { name: 1 } });
  const data = list
    .filter((p) => Number(p.stock ?? 0) <= 0 || (p.variants ?? []).some((v: any) => Number(v.stock ?? 0) <= 0))
    .map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      image: p.images?.[0]?.url ?? '',
      stock: Number(p.stock ?? 0),
      variantsOut: (p.variants ?? []).filter((v: any) => Number(v.stock ?? 0) <= 0).map((v: any) => v.value ?? v.name ?? v.sku),
    }));
  return json({ success: true, message: 'Out of stock', data });
});

// Register a friend: the partner fills in the details, the friend sets a password from a private link
const ACTIVATION_DAYS = 7;
const friendSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().min(7).max(20),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().max(200).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Your friend must agree to be registered' }) }),
});

async function activationLink(userId: string) {
  const token = crypto.randomBytes(24).toString('hex');
  await db.users.updateById(userId, { activationToken: hashToken(token), activationExpiry: new Date(Date.now() + ACTIVATION_DAYS * 86400000).toISOString() });
  return `${siteUrl()}/activate?token=${token}`;
}

members.post('/register-friend', authenticate, validate(friendSchema), async ({ body, user }) => {
  const u = await requirePartner(user!._id);
  const email = body.email.toLowerCase();
  if (await db.users.findOne({ email })) throw new BadRequestError('Someone already has an account with this email');
  const recent = await getSql()`select count(*)::int as n from users where referred_by = ${u._id} and data->>'registeredBy' = ${u._id} and created_at > now() - interval '1 day'`;
  if (Number((recent[0] as any).n) >= 20) throw new BadRequestError('You can register up to 20 people a day');
  const created = await db.users.create({
    firstName: body.firstName,
    lastName: body.lastName,
    email,
    phone: body.phone,
    // no usable password until the friend sets one
    password: `!unset-${crypto.randomBytes(16).toString('hex')}`,
    isEmailVerified: false,
    isActive: true,
    role: 'customer',
    referredBy: u._id,
    referredAt: new Date().toISOString(),
    registeredBy: u._id,
    addresses: body.address
      ? [{ _id: crypto.randomBytes(12).toString('hex'), label: 'Home', firstName: body.firstName, lastName: body.lastName, phone: body.phone, street: body.address, city: body.city, state: body.city, postalCode: '00000', country: 'Pakistan', isDefault: true }]
      : [],
    wishlist: [],
    compare: [],
    recentlyViewed: [],
    refreshTokens: [],
  });
  const link = await activationLink(created._id);
  return json(
    {
      success: true,
      message: `${body.firstName} is registered. Send them the activation link to finish.`,
      data: { _id: created._id, name: `${body.firstName} ${body.lastName}`, activationLink: link, expiresInDays: ACTIVATION_DAYS, emailSent: false, canEmail: canSendEmail() },
    },
    201
  );
});

/** People this partner registered who have not set their password yet. */
members.get('/registered', authenticate, async ({ user }) => {
  const u = await requirePartner(user!._id);
  const list = await db.users.find({ registeredBy: u._id }, { sort: { createdAt: -1 }, limit: 200 });
  return json({
    success: true,
    message: 'Registered by you',
    data: list.map((p) => ({ _id: p._id, name: `${p.firstName} ${p.lastName}`, email: p.email, phone: p.phone, createdAt: p.createdAt, activated: !p.activationToken && p.isEmailVerified, expired: p.activationExpiry ? new Date(p.activationExpiry).getTime() < Date.now() : false })),
  });
});

members.post('/registered/:id/link', authenticate, async ({ user, params }) => {
  const u = await requirePartner(user!._id);
  const p = await db.users.findById(params.id);
  if (!p || p.registeredBy !== u._id) throw new NotFoundError('Member');
  if (!p.activationToken) throw new BadRequestError('This member has already activated their account');
  return json({ success: true, message: 'New activation link', data: { activationLink: await activationLink(p._id), expiresInDays: ACTIVATION_DAYS } });
});

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
const adminUser = (u: Doc) => ({
  _id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  phone: u.phone,
  memberCode: u.memberCode,
  partner: u.partner,
  business: u.business,
  kyc: u.kyc,
  referredBy: u.referredBy,
  monthlyBV: u.monthlyBV ?? 0,
  totalBV: u.totalBV ?? 0,
  referredBV: u.referredBV ?? 0,
  loyaltyPoints: u.loyaltyPoints ?? 0,
  createdAt: u.createdAt,
});

members.get('/admin/overview', adminOnly, async () => {
  const sql = getSql();
  const counts = await sql`
    select
      count(*) filter (where data#>>'{partner,status}' = 'approved')::int as partners,
      count(*) filter (where data#>>'{partner,status}' = 'pending')::int as partner_pending,
      count(*) filter (where data#>>'{business,status}' = 'approved')::int as businesses,
      count(*) filter (where data#>>'{business,status}' = 'pending')::int as business_pending,
      count(*) filter (where data#>>'{kyc,status}' = 'pending')::int as kyc_pending
    from users`;
  const money = await sql`
    select
      coalesce(sum(case when type='commission' and status='pending' then (data->>'amount')::numeric end),0) as commission_pending,
      coalesce(sum(case when type='commission' and status='available' then (data->>'amount')::numeric end),0) as commission_released,
      coalesce(sum(case when status='available' then (data->>'amount')::numeric end),0) as wallet_liability
    from wallet_entries`;
  const wd = await sql`select count(*)::int as n, coalesce(sum((data->>'amount')::numeric),0) as amt from withdrawals where status = 'requested'`;
  const c: any = counts[0];
  const m: any = money[0];
  return json({
    success: true,
    message: 'Members overview',
    data: {
      partners: c.partners,
      partnerPending: c.partner_pending,
      businesses: c.businesses,
      businessPending: c.business_pending,
      kycPending: c.kyc_pending,
      commissionPending: Number(m.commission_pending),
      commissionReleased: Number(m.commission_released),
      walletLiability: Number(m.wallet_liability),
      withdrawalsRequested: wd[0].n,
      withdrawalsRequestedAmount: Number(wd[0].amt),
    },
  });
});

members.get('/admin/list', adminOnly, async ({ query }) => {
  const kind = String(query.kind ?? 'partner'); // partner | business | kyc
  const status = query.status ? String(query.status) : undefined;
  const field = kind === 'business' ? 'business.status' : kind === 'kyc' ? 'kyc.status' : 'partner.status';
  const filter: Record<string, any> = status ? { [field]: status } : { [field]: { $in: ['pending', 'approved', 'rejected', 'suspended'] } };
  const list = await db.users.find(filter, { sort: { updatedAt: -1 }, limit: 500 });
  const sponsorIds = Array.from(new Set(list.map((u) => u.referredBy).filter(Boolean)));
  const sponsors = new Map((await db.users.findByIds(sponsorIds)).map((s) => [s._id, s]));
  const data = await Promise.all(
    list.map(async (u) => ({
      ...adminUser(u),
      sponsor: u.referredBy && sponsors.get(u.referredBy) ? { name: maskName(sponsors.get(u.referredBy)!), memberCode: sponsors.get(u.referredBy)!.memberCode } : null,
      wallet: kind === 'partner' ? await walletSummary(u._id) : undefined,
    }))
  );
  return json({ success: true, message: 'Members', data });
});

members.get('/admin/withdrawals', adminOnly, async ({ query }) => {
  const filter = query.status ? { status: String(query.status) } : {};
  const list = await db.withdrawals.find(filter, { sort: { createdAt: -1 }, limit: 500 });
  return json({ success: true, message: 'Withdrawals', data: list });
});

const payoutSchema = z.object({ action: z.enum(['paid', 'reject']), reference: z.string().max(80).optional(), note: z.string().max(300).optional() });

members.post('/admin/withdrawals/:id', adminOnly, validate(payoutSchema), async ({ params, body, user: admin }) => {
  const w = await db.withdrawals.findById(params.id);
  if (!w) throw new NotFoundError('Withdrawal');
  if (w.status !== 'requested') throw new BadRequestError('This withdrawal is already closed');
  const now = new Date().toISOString();
  if (body.action === 'paid') {
    if (!body.reference) throw new BadRequestError('Enter the transfer reference');
    Object.assign(w, { status: 'paid', reference: body.reference, note: body.note, processedAt: now, processedBy: admin!._id });
    await db.withdrawals.save(w);
    await createNotification({ userId: w.user, type: 'general', title: 'Withdrawal paid', message: `Rs. ${Number(w.amount).toLocaleString()} was sent to your ${w.method} account (ref ${body.reference}).`, link: '/account/partner?tab=wallet' });
  } else {
    Object.assign(w, { status: 'rejected', note: body.note, processedAt: now, processedBy: admin!._id });
    await db.withdrawals.save(w);
    await postCredits([{ user: w.user, type: 'withdrawal_reversal', amount: Number(w.amount), status: 'available', withdrawal: w._id, note: `Withdrawal returned${body.note ? `: ${body.note}` : ''}` }]);
    await createNotification({ userId: w.user, type: 'general', title: 'Withdrawal returned', message: `Your withdrawal of Rs. ${Number(w.amount).toLocaleString()} was returned to your wallet.${body.note ? ` ${body.note}` : ''}`, link: '/account/partner?tab=wallet' });
  }
  return json({ success: true, message: 'Withdrawal updated', data: w });
});

members.get('/admin/commissions', adminOnly, async ({ query }) => {
  const sql = getSql();
  const status = query.status ? String(query.status) : null;
  const rows = status
    ? await sql`select _id, data from wallet_entries where type in ('commission','commission_reversal') and status = ${status} order by created_at desc limit 500`
    : await sql`select _id, data from wallet_entries where type in ('commission','commission_reversal') order by created_at desc limit 500`;
  const entries = rows.map((r: any) => ({ _id: r._id, ...r.data }));
  const users = new Map((await db.users.findByIds(Array.from(new Set(entries.map((e) => e.user))))).map((u) => [u._id, u]));
  return json({
    success: true,
    message: 'Commissions',
    data: entries.map((e) => ({ ...e, partner: users.get(e.user) ? { name: `${users.get(e.user)!.firstName} ${users.get(e.user)!.lastName}`, memberCode: users.get(e.user)!.memberCode } : null })),
  });
});

const adjustSchema = z.object({ userId: z.string(), amount: z.number().refine((n) => n !== 0, 'Amount cannot be zero'), note: z.string().min(3).max(200) });

members.post('/admin/wallet-adjust', adminOnly, validate(adjustSchema), async ({ body, user: admin }) => {
  const u = await db.users.findById(body.userId);
  if (!u) throw new NotFoundError('User');
  const entry = { user: u._id, type: 'adjustment' as const, amount: body.amount, status: 'available' as const, note: `${body.note} (by ${admin!.firstName})` };
  if (body.amount < 0) await postEntries([entry]);
  else await postCredits([entry]);
  await createNotification({ userId: u._id, type: 'general', title: 'Wallet adjusted', message: `${body.amount > 0 ? 'Rs. ' + body.amount + ' added to' : 'Rs. ' + -body.amount + ' deducted from'} your wallet: ${body.note}`, link: '/account/partner?tab=wallet' });
  return json({ success: true, message: 'Wallet adjusted', data: await walletSummary(u._id) });
});

const settingsSchema = z.object({
  referralCommissionPct: z.number().min(0).max(50),
  partnerDiscountTiers: z.array(z.object({ minBV: z.number().min(0), pct: z.number().min(0).max(80) })).min(1).max(10),
  wholesaleDefaultDiscountPct: z.number().min(0).max(80),
  wholesaleDefaultMinQty: z.number().int().min(1).max(1000),
  minWithdrawal: z.number().min(0),
  loyaltyRsPerPoint: z.number().min(1),
  pointValueRs: z.number().min(0),
  minRedeemPoints: z.number().int().min(0),
  rsPerBV: z.number().min(1),
  couponsForMembers: z.boolean(),
  welcomeDiscountPct: z.number().min(0).max(50).default(MEMBER_DEFAULTS.welcomeDiscountPct),
  cashbackPct: z.number().min(0).max(30).default(MEMBER_DEFAULTS.cashbackPct),
  claimWindowDays: z.number().int().min(1).max(90).default(MEMBER_DEFAULTS.claimWindowDays),
  titles: z
    .array(z.object({ name: z.string().min(2).max(40), minPersonalBV: z.number().min(0), minGroupBV: z.number().min(0), minRecruits: z.number().int().min(0) }))
    .min(1)
    .max(12)
    .default(MEMBER_DEFAULTS.titles),
});

members.get('/admin/settings', adminOnly, async () => json({ success: true, message: 'Member settings', data: await getMemberSettings() }));

members.put('/admin/settings', adminOnly, validate(settingsSchema), async ({ body }) => {
  const s = await getSettings();
  s.members = { ...MEMBER_DEFAULTS, ...body };
  await db.settings.save(s);
  return json({ success: true, message: 'Member settings saved', data: await getMemberSettings() });
});

/** Month-end: store this month's points per member and start the new month from zero. */
members.post('/admin/close-month', adminOnly, async ({ user: admin }) => {
  const s = await getSettings();
  const period = new Date().toISOString().slice(0, 7);
  if (s.lastClosedPeriod === period) throw new BadRequestError(`${period} is already closed`);
  const sql = getSql();
  const rows = await sql`
    update users set data = data
        || jsonb_build_object('lastMonthBV', coalesce((data->>'monthlyBV')::numeric, 0), 'monthlyBV', 0)
        || jsonb_build_object('bvHistory', coalesce(data->'bvHistory', '[]'::jsonb) || jsonb_build_array(jsonb_build_object('period', ${period}::text, 'bv', coalesce((data->>'monthlyBV')::numeric, 0)))),
      updated_at = now()
    where coalesce((data->>'monthlyBV')::numeric, 0) <> 0 or data#>>'{partner,status}' = 'approved'
    returning _id`;
  s.lastClosedPeriod = period;
  s.monthCloses = [...(s.monthCloses ?? []), { period, closedAt: new Date().toISOString(), by: admin!._id, members: rows.length }].slice(-36);
  await db.settings.save(s);
  return json({ success: true, message: `Closed ${period} for ${rows.length} members`, data: { period, members: rows.length } });
});


// Move a member to another sponsor (or remove their sponsor). Kept in their history.
const reallocateSchema = z.object({ userId: z.string(), sponsorCode: z.string().trim().max(20).optional().or(z.literal('')), note: z.string().min(3).max(200) });

members.post('/admin/reallocate', adminOnly, validate(reallocateSchema), async ({ body, user: admin }) => {
  const u = await db.users.findById(body.userId);
  if (!u) throw new NotFoundError('User');
  let sponsor: Doc | null = null;
  if (body.sponsorCode) {
    sponsor = await findSponsor(body.sponsorCode);
    if (!sponsor) throw new BadRequestError('No active Brand Partner has that code');
    if (sponsor._id === u._id) throw new BadRequestError('A member cannot sponsor themselves');
    if (sponsor.referredBy === u._id) throw new BadRequestError('That partner is in this member\'s own team');
  }
  const now = new Date().toISOString();
  const history = [...(u.sponsorHistory ?? []), { from: u.referredBy ?? null, to: sponsor?._id ?? null, at: now, by: admin!._id, note: body.note }];
  await db.users.updateById(u._id, { referredBy: sponsor?._id ?? null, referredAt: sponsor ? now : null, sponsorHistory: history });
  if (sponsor) await createNotification({ userId: sponsor._id, type: 'general', title: 'New team member', message: `${maskName(u)} has joined your team.`, link: '/account/partner?tab=team' });
  return json({ success: true, message: sponsor ? `Moved to ${maskName(sponsor)}` : 'Sponsor removed', data: adminUser((await db.users.findById(u._id))!) });
});

// Generic review route last, so the fixed /admin/... paths above match first
const decisionSchema = z.object({ action: z.enum(['approve', 'reject', 'suspend', 'reinstate']), note: z.string().max(300).optional() });

members.post('/admin/:userId/:kind', adminOnly, validate(decisionSchema), async ({ params, body, user: admin }) => {
  const kind = params.kind;
  if (!['partner', 'business', 'kyc'].includes(kind)) throw new NotFoundError('Route');
  const u = await db.users.findById(params.userId);
  if (!u) throw new NotFoundError('User');
  const rec = u[kind];
  if (!rec) throw new BadRequestError('Nothing to review for this user');
  const now = new Date().toISOString();
  const { action, note } = body;
  const statusFor = { approve: 'approved', reject: 'rejected', suspend: 'suspended', reinstate: 'approved' } as const;
  if (kind === 'kyc' && (action === 'suspend' || action === 'reinstate')) throw new BadRequestError('Use approve or reject for payout details');

  rec.status = statusFor[action as keyof typeof statusFor];
  rec.reviewedAt = now;
  rec.reviewedBy = admin!._id;
  if (note) rec.note = note;
  if (action === 'approve') rec.approvedAt = rec.approvedAt ?? now;
  if (kind === 'partner' && rec.status === 'approved' && !u.memberCode) u.memberCode = await uniqueMemberCode();
  if (kind === 'business' && rec.status === 'approved' && !u.memberCode) u.memberCode = await uniqueMemberCode();
  u[kind] = rec;
  await db.users.save(u);

  const label = kind === 'partner' ? 'Brand Partner' : kind === 'business' ? 'wholesale account' : 'payout details';
  const messages: Record<string, string> = {
    approved: kind === 'kyc' ? 'Your payout details are verified. You can now withdraw your earnings.' : `Your ${label} is active. Welcome to Azeeora!${u.memberCode ? ` Your member code is ${u.memberCode}.` : ''}`,
    rejected: `Your ${label} application was not approved.${note ? ` ${note}` : ''}`,
    suspended: `Your ${label} has been suspended.${note ? ` ${note}` : ''}`,
  };
  await createNotification({
    userId: u._id,
    type: 'general',
    title: kind === 'kyc' ? 'Payout details' : label[0].toUpperCase() + label.slice(1),
    message: messages[rec.status],
    link: kind === 'business' ? '/account/business' : '/account/partner',
  });
  return json({ success: true, message: `Updated`, data: adminUser(u) });
});

