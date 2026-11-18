// End-to-end check of the multi-level network: points (BP/BV), commission per
// level, downline, genealogy, performance bonus. Runs against a local database.
// Usage: DATABASE_URL=... BASE=http://localhost:3100 node scripts/dev/mlm-e2e.mjs
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BASE = process.env.BASE || 'http://localhost:3100';
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 2 });
let pass = 0, fail = 0;
const ok = (cond, label, extra) => { if (cond) { pass++; console.log('PASS ', label); } else { fail++; console.log('FAIL ', label, extra === undefined ? '' : JSON.stringify(extra).slice(0, 600)); } };
const id = () => Math.floor(Date.now() / 1000).toString(16).padStart(8, '0') + crypto.randomBytes(8).toString('hex');
async function call(method, path, body, token) {
  const res = await fetch(BASE + '/api' + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let j = {}; try { j = await res.json(); } catch {}
  return { status: res.status, ...j };
}

// --- fresh network: A > B > C > D (D is a customer) ----------------------------------
const testUsers = sql`select _id from users where data->>'email' like 'mlm-%@test.local'`;
await sql`delete from points_entries where "user" in (${testUsers})`;
await sql`delete from wallet_entries where "user" in (${testUsers})`;
await sql`delete from orders where data->>'customerEmail' like 'mlm-%@test.local'`;
await sql`delete from users where data->>'email' like 'mlm-%@test.local'`;
const pw = await bcrypt.hash('Test#12345', 10);
let codeN = 900100;
const mk = async (name, { role = 'customer', partner = false, sponsor = null } = {}) => {
  const _id = id();
  const now = new Date().toISOString();
  const data = { firstName: name, lastName: 'Tester', email: `mlm-${name.toLowerCase()}@test.local`, password: pw, role, isEmailVerified: true, isActive: true, addresses: [], wishlist: [], compare: [], recentlyViewed: [], refreshTokens: [], createdAt: now, updatedAt: now };
  if (partner) Object.assign(data, { partner: { status: 'approved', city: 'Lahore' }, memberCode: `AZ-${codeN++}` });
  if (sponsor) Object.assign(data, { referredBy: sponsor._id, referredAt: now });
  await sql`insert into users (_id, data, created_at, updated_at) values (${_id}, ${sql.json(data)}, now(), now())`;
  const r = await call('POST', '/auth/login', { email: data.email, password: 'Test#12345' });
  return { _id, token: r.data?.tokens?.accessToken, code: data.memberCode };
};
const admin = await mk('Admin', { role: 'admin' });
const A = await mk('Ana', { partner: true });
const B = await mk('Bilal', { partner: true, sponsor: A });
const C = await mk('Chand', { partner: true, sponsor: B });
const D = await mk('Dua', { sponsor: C });
ok([admin, A, B, C, D].every((u) => u.token), 'test users log in');

// --- settings: 3 commission levels, BP/BV, bonus tiers -----------------------------------
let r = await call('GET', '/members/admin/settings', null, admin.token);
const base = r.data;
ok(Array.isArray(base.levelCommissionPct) && base.levelCommissionPct.length === 3, 'settings have commission levels', base.levelCommissionPct);
r = await call('PUT', '/members/admin/settings', { ...base, levelCommissionPct: [10, 5, 3], maxTeamLevels: 10, rsPerBP: 100, performanceBonus: { enabled: true, rsPerBV: 10, minPersonalBV: 0, tiers: [{ minGroupBV: 10, pct: 3 }, { minGroupBV: 50, pct: 6 }] }, partnerDiscountTiers: [{ minBV: 0, pct: 0 }] }, admin.token);
ok(r.status === 200 && r.data.referralCommissionPct === 10, 'admin saves level rates; level 1 is the referral rate', r.message);
r = await call('PUT', '/members/admin/settings', { ...base, levelCommissionPct: [30, 20, 15] }, admin.token);
ok(r.status === 400, 'commission over 60% across levels is refused');

// --- product with BP and BV set in admin ------------------------------------------------
await sql`delete from products where data->>'sku' = 'MLM-TEST-1'`;
await sql`delete from categories where data->>'slug' = 'mlm-test'`;
r = await call('POST', '/categories', { name: 'MLM Test' }, admin.token);
const cat = r.data;
r = await call('POST', '/products', { name: 'MLM Test Cream', description: 'A product for the network test run.', sku: 'MLM-TEST-1', category: cat._id, images: [{ url: 'https://example.com/a.jpg', publicId: 'a', isMain: true }], basePrice: 1000, stock: 100, bp: 30, bv: 20 }, admin.token);
ok(r.status === 201 && r.data.bp === 30 && r.data.bv === 20, 'admin sets BP and BV on a product', r.message);
const P = r.data;
const ship = { firstName: 'T', lastName: 'Tester', phone: '03001234567', street: '1 Test Road', city: 'Lahore', state: 'Punjab', postalCode: '54000', country: 'Pakistan' };

// --- D buys 2: personal to D, team to C (1), B (2), A (3); commission 10/5/3 % -------------
r = await call('POST', '/orders/quote', { items: [{ productId: P._id, quantity: 2 }] }, D.token);
ok(r.data?.bp === 60 && r.data?.bv === 40, 'checkout preview shows BP 60 and BV 40', { bp: r.data?.bp, bv: r.data?.bv });
r = await call('POST', '/orders', { items: [{ productId: P._id, quantity: 2 }], shippingAddress: ship, paymentMethod: 'cod' }, D.token);
ok(r.status === 201, 'D places an order', r.message);
const o1 = r.data;
ok(o1.member && !('commissions' in o1.member) && !('sponsor' in o1.member) && !('commission' in o1.member), 'buyer does not see who earns commission', o1.member);
const pts = async (u) => (await call('GET', '/members/points', null, u.token)).data;
let p = await pts(D);
ok(p.personal.bp === 60 && p.personal.bv === 40 && p.team.bv === 0, 'D: personal BP 60, BV 40', p);
p = await pts(C);
ok(p.personal.bv === 0 && p.team.bp === 60 && p.team.bv === 40 && p.group.bv === 40 && p.byLevel[0]?.level === 1, 'C: team BP/BV from level 1', p);
p = await pts(B);
ok(p.team.bv === 40 && p.byLevel[0]?.level === 2, 'B: team BV from level 2', p.byLevel);
p = await pts(A);
ok(p.team.bv === 40 && p.byLevel[0]?.level === 3, 'A: team BV from level 3', p.byLevel);
const comm = async (orderId) => (await sql`select "user", status, (data->>'amount')::numeric as amount, (data->>'level')::int as level from wallet_entries where "order" = ${orderId} and type = 'commission' order by level`);
let c = await comm(o1._id);
ok(c.length === 3 && c[0].user === C._id && Number(c[0].amount) === 200 && c[1].user === B._id && Number(c[1].amount) === 100 && c[2].user === A._id && Number(c[2].amount) === 60 && c.every((x) => x.status === 'pending'),
  'commission: C 200 (L1 10%), B 100 (L2 5%), A 60 (L3 3%), all pending', c);

// --- delivery releases every level; cancel reverses points and commission --------------------
r = await call('PATCH', `/orders/${o1._id}/status`, { status: 'delivered', message: 'Delivered' }, admin.token);
c = await comm(o1._id);
ok(r.status === 200 && c.every((x) => x.status === 'available'), 'delivery makes all three commissions available', c);
r = await call('POST', '/orders', { items: [{ productId: P._id, quantity: 1 }], shippingAddress: ship, paymentMethod: 'cod' }, D.token);
const o2 = r.data;
ok((await pts(A)).team.bv === 60, 'a second order adds 20 BV to A');
await call('PATCH', `/orders/${o2._id}/status`, { status: 'cancelled', message: 'Cancelled' }, admin.token);
ok((await pts(A)).team.bv === 40 && (await pts(D)).personal.bv === 40, 'cancelling takes the points back from buyer and every upline');
c = await comm(o2._id);
ok(c.length === 3 && c.every((x) => x.status === 'cancelled'), 'cancelling cancels every level of commission', c);
const hist = (await pts(A)).history;
ok(hist.some((h) => h.status === 'reversed') && hist.some((h) => h.status === 'active'), 'points history keeps reversed rows for the record');

// --- B buys for themself: personal for B, team for A only ------------------------------------
r = await call('POST', '/orders', { items: [{ productId: P._id, quantity: 1 }], shippingAddress: ship, paymentMethod: 'cod' }, B.token);
const o3 = r.data;
p = await pts(B);
ok(p.personal.bv === 20 && p.team.bv === 40 && p.group.bv === 60, 'B: personal 20 + team 40 = group 60', p);
ok((await pts(C)).team.bv === 40, 'C gets nothing from their upline\'s order');
c = await comm(o3._id);
ok(c.length === 1 && c[0].user === A._id && c[0].level === 1, 'B\'s order pays A as level 1', c);

// --- downline and genealogy -----------------------------------------------------------
r = await call('GET', '/members/downline', null, A.token);
ok(r.status === 200 && r.data.totals.people === 3 && r.data.totals.direct === 1 && r.data.totals.indirect === 2, 'A sees 1 direct and 2 indirect members', r.data?.totals);
ok(r.data.people.map((x) => x.level).join() === '1,2,3', 'members listed level by level');
r = await call('GET', '/members/downline?level=3', null, A.token);
ok(r.data.people.length === 1 && r.data.people[0].name === 'Dua T.', 'level filter shows only level 3', r.data.people);
r = await call('GET', '/members/genealogy?depth=3', null, A.token);
const root = r.data?.root;
ok(root?.name === 'You' && root.children[0]?.children[0]?.children[0]?.name === 'Dua T.', 'genealogy tree nests A > B > C > D', root);
r = await call('GET', '/members/genealogy?depth=1', null, A.token);
ok(r.data.root.children[0].hasMore === true, 'tree marks members with more below');
r = await call('GET', `/members/genealogy?root=${C._id}&depth=2`, null, B.token);
ok(r.status === 200 && r.data.root.children[0]?.name === 'Dua T.', 'B can open C\'s branch');
r = await call('GET', `/members/genealogy?root=${A._id}`, null, C.token);
ok(r.status === 403, 'C cannot open their upline\'s tree');
r = await call('GET', '/members/downline', null, D.token);
ok(r.status === 403, 'a customer has no downline view');
r = await call('GET', `/members/genealogy?root=${B.code}&depth=2`, null, admin.token);
ok(r.status === 200 && r.data.root.name === 'Bilal T.' && r.data.sponsor?.memberCode === A.code, 'admin opens any member by code, with their sponsor');

// --- performance bonus (differential) -----------------------------------------------------
const month = new Date().toISOString().slice(0, 7);
r = await call('GET', `/members/admin/bonus?month=${month}`, null, admin.token);
const line = (u) => r.data.lines.find((l) => l.user === u._id);
// C: group 40 -> 3% on 40 = 120 x Rs10/100 = 12. B: group 60 -> 6%: own 20 x 6 + (6-3) x 40 = 240 -> 24. A: group 60 -> 6%, leg B at 6% -> 0
ok(line(C)?.amount === 12 && line(B)?.amount === 24 && !line(A), 'bonus preview: C Rs 12, B Rs 24, A nothing (differential)', r.data.lines);
const bonusOf = async () => (await sql`select "user", (data->>'amount')::numeric as amount from wallet_entries where type = 'performance_bonus' and data->>'month' = ${month} and "user" in (${A._id}, ${B._id}, ${C._id}) order by amount`).map((x) => [x.user, Number(x.amount)]);
r = await call('POST', '/members/admin/bonus/pay', { month }, admin.token);
ok(r.status === 200 && JSON.stringify(await bonusOf()) === JSON.stringify([[C._id, 12], [B._id, 24]]), 'bonus paid: C Rs 12, B Rs 24, A nothing', await bonusOf());
r = await call('POST', '/members/admin/bonus/pay', { month }, admin.token);
ok(r.data.paid === 0 && JSON.stringify(await bonusOf()) === JSON.stringify([[C._id, 12], [B._id, 24]]), 'paying the same month again pays nobody twice', r.data);
const bal = await sql`select coalesce(sum((data->>'amount')::numeric),0) as s from wallet_entries where "user" = ${B._id} and status = 'available'`;
ok(Number(bal[0].s) === 124, 'B wallet: Rs 100 commission + Rs 24 bonus', bal[0]);

// --- sponsor moves cannot create a loop; referral code at sign-up ---------------------------------
r = await call('POST', '/members/admin/reallocate', { userId: A._id, sponsorCode: C.code, note: 'loop test' }, admin.token);
ok(r.status === 400, 'cannot move a member under someone in their own team (3 levels down)', r.message);
r = await call('POST', '/auth/register', { firstName: 'Esa', lastName: 'Tester', email: 'mlm-esa@test.local', password: 'Test#12345', confirmPassword: 'Test#12345', phone: '03001112233', refCode: C.code });
const esa = (await sql`select data->>'referredBy' as s from users where data->>'email' = 'mlm-esa@test.local'`)[0];
ok(esa?.s === C._id, 'a code typed at sign-up places the new member under that partner', { status: r.status, msg: r.message, esa });

console.log(`\n${pass} passed, ${fail} failed`);
await sql.end();
process.exit(fail ? 1 : 0);
