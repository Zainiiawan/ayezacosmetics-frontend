// Referral link and code, end to end: sign-up through each method, sequential
// AZEEORA codes, a 5-level chain, BP/BV only after confirmation, commission by
// level, reversals, eligibility rules and duplicate protection.
// Usage: DATABASE_URL=... BASE=http://localhost:3100 node scripts/dev/referral-e2e.mjs
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BASE = process.env.BASE || 'http://localhost:3100';
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 2 });
let pass = 0, fail = 0;
const ok = (cond, label, extra) => { if (cond) { pass++; console.log('PASS ', label); } else { fail++; console.log('FAIL ', label, extra === undefined ? '' : JSON.stringify(extra).slice(0, 500)); } };
async function call(method, path, body, token) {
  const res = await fetch(BASE + '/api' + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let j = {}; try { j = await res.json(); } catch {}
  return { status: res.status, ...j };
}

// --- clean slate --------------------------------------------------------------------------
const mine = sql`select _id from users where data->>'email' like 'ref-%@test.local'`;
await sql`delete from points_entries where "user" in (${mine}) or data->>'fromUser' in (${mine})`;
await sql`delete from wallet_entries where "user" in (${mine})`;
await sql`delete from orders where data->>'customerEmail' like 'ref-%@test.local'`;
await sql`delete from users where data->>'email' like 'ref-%@test.local'`;

// admin (made directly, as the store owner would be)
const pw = await bcrypt.hash('Test#12345', 10);
const adminId = Math.floor(Date.now() / 1000).toString(16) + crypto.randomBytes(8).toString('hex');
await sql`insert into users (_id, data, created_at, updated_at) values (${adminId}, ${sql.json({ firstName: 'Ref', lastName: 'Admin', email: 'ref-admin@test.local', password: pw, role: 'admin', isEmailVerified: true, isActive: true, addresses: [], refreshTokens: [] })}, now(), now())`;
const admin = (await call('POST', '/auth/login', { email: 'ref-admin@test.local', password: 'Test#12345' })).data?.tokens?.accessToken;
ok(admin, 'admin logs in');

const settings = (await call('GET', '/members/admin/settings', null, admin)).data;
const setRules = (patch) => call('PUT', '/members/admin/settings', { ...settings, levelCommissionPct: [10, 5, 3], maxTeamLevels: 10, earnerEligibility: 'all', minPersonalBVToEarn: 0, ...patch }, admin);
let r = await setRules({});
ok(r.status === 200 && r.data.earnerEligibility === 'all', 'admin sets levels 10/5/3, everyone can earn', r.message);

// --- sign-up through link and code ------------------------------------------------------------------
// The site's ?ref= link stores the code and sends it with sign-up, so a link
// sign-up and a typed code reach the server the same way: refCode.
const signup = async (name, refCode) => {
  const res = await call('POST', '/auth/register', { firstName: name, lastName: 'Tester', email: `ref-${name.toLowerCase()}@test.local`, password: 'Test#12345', confirmPassword: 'Test#12345', ...(refCode ? { refCode } : {}) });
  const token = res.data?.tokens?.accessToken;
  const me = token ? (await call('GET', '/members/me', null, token)).data : null;
  const row = (await sql`select _id, data->>'referredBy' as sponsor, data->>'referralCode' as code from users where data->>'email' = ${`ref-${name.toLowerCase()}@test.local`}`)[0];
  return { name, token, status: res.status, message: res.message, me, _id: row?._id, sponsor: row?.sponsor, code: row?.code };
};
const R = await signup('Root');
ok(R.status === 201 && /^AZEEORA\d{4,}$/.test(R.code), 'a new member gets an AZEEORA code', R.code);
ok(R.me?.referralCode === R.code && R.me?.links?.member?.endsWith(`/register?ref=${R.code}`) && R.me?.links?.store?.endsWith(`/?ref=${R.code}`), 'dashboard data has the code and a sign-up link and a shop link', R.me?.links);
const A = await signup('Asma', R.code); // link
const B = await signup('Babar', A.code.toLowerCase()); // code, typed in small letters
const C = await signup('Chanda', B.code); // link
const D = await signup('Daud', C.code); // code
const num = (u) => Number(u.code.slice(7));
ok([A, B, C, D].every((u, i) => num(u) === num(R) + i + 1), 'codes are sequential in joining order', [R, A, B, C, D].map((u) => u.code));
ok(A.sponsor === R._id && B.sponsor === A._id && C.sponsor === B._id && D.sponsor === C._id, 'each member is placed under the code or link owner (link and code alike, any letter case)');
r = await call('GET', `/members/ref/${C.code}`);
ok(r.data?.valid === true && r.data?.referralCode === C.code, 'a code can be checked before sign-up', r.data);
r = await signup('Ghost', 'AZEEORA9999');
ok(r.status === 400 && !r._id, 'an unknown code is refused, no account made', r.message);
r = await call('POST', '/auth/register', { firstName: 'Daud', lastName: 'Tester', email: 'ref-daud@test.local', password: 'Test#12345', confirmPassword: 'Test#12345', refCode: R.code });
ok(r.status === 409, 'the same email cannot sign up twice (no duplicate referral)', r.message);
ok((await sql`select data->>'referredBy' as s from users where _id = ${D._id}`)[0].s === C._id, 'and Daud stays under Chanda');

// --- shopping: nothing until the order is confirmed ---------------------------------------------
const P = (await call('GET', '/products?limit=50')).data.products.find((p) => p.sku === 'MLM-TEST-1');
ok(P && P.bp === 30 && P.bv === 20, 'test product has BP 30 / BV 20 set in admin', P && { bp: P.bp, bv: P.bv });
const ship = { firstName: 'T', lastName: 'Tester', phone: '03001234567', street: '1 Test Road', city: 'Lahore', state: 'Punjab', postalCode: '54000', country: 'Pakistan' };
const order = async (u, qty = 1, extra = {}) => (await call('POST', '/orders', { items: [{ productId: P._id, quantity: qty }], shippingAddress: ship, paymentMethod: 'cod', ...extra }, u.token)).data;
const setStatus = (o, status) => call('PATCH', `/orders/${o._id}/status`, { status, message: status }, admin);
const pts = async (u) => (await call('GET', '/members/points', null, u.token)).data;
const comm = async (o) => (await sql`select "user", type, status, (data->>'amount')::numeric as amount, (data->>'level')::int as level from wallet_entries where "order" = ${o._id} and type in ('commission','team_commission') order by level`).map((x) => ({ ...x, amount: Number(x.amount) }));

const o1 = await order(D, 2); // Rs 2000, BP 60, BV 40
ok(o1?.status === 'pending_confirmation', 'Daud orders 2 (cash on delivery), waiting for confirmation', o1?.status);
let p = await pts(D);
ok(p.personal.bv === 0 && (await pts(C)).team.bv === 0, 'no BP/BV is credited while the order only placed');
ok((await comm(o1)).length === 0, 'and no commission yet');

r = await setStatus(o1, 'processing'); // admin approves the COD order
ok(r.status === 200, 'admin confirms the order');
p = await pts(D);
ok(p.personal.bp === 60 && p.personal.bv === 40, 'Daud: personal BP 60 / BV 40 after confirmation', p.personal);
const lv = async (u) => (await pts(u)).byLevel.map((l) => [l.level, l.bp, l.bv]);
ok(JSON.stringify(await lv(C)) === '[[1,60,40]]', 'Chanda: team BP/BV from level 1', await lv(C));
ok(JSON.stringify(await lv(B)) === '[[2,60,40]]', 'Babar: team from level 2', await lv(B));
ok(JSON.stringify(await lv(A)) === '[[3,60,40]]', 'Asma: team from level 3', await lv(A));
ok(JSON.stringify(await lv(R)) === '[[4,60,40]]', 'Root: team from level 4 (team depth 10)', await lv(R));
let c = await comm(o1);
ok(c.length === 3 && c[0].user === C._id && c[0].amount === 200 && c[0].type === 'commission' && c[1].user === B._id && c[1].amount === 100 && c[1].type === 'team_commission' && c[2].user === A._id && c[2].amount === 60 && c.every((x) => x.status === 'pending'),
  'commission: Chanda Rs 200 (L1), Babar Rs 100 (L2), Asma Rs 60 (L3), pending; Root none (only 3 levels paid)', c);
await setStatus(o1, 'shipped');
await setStatus(o1, 'delivered');
ok((await pts(D)).personal.bv === 40 && (await pts(R)).team.bv === 40, 'moving through shipped and delivered does not credit twice');
c = await comm(o1);
ok(c.every((x) => x.status === 'available'), 'delivery makes every level of commission available', c);

// --- cancellations ------------------------------------------------------------------------------------
const o2 = await order(D, 1);
await setStatus(o2, 'cancelled');
ok((await pts(D)).personal.bv === 40 && (await comm(o2)).length === 0, 'an order cancelled before confirmation never earns points or commission');
const o3 = await order(D, 1);
await setStatus(o3, 'processing');
ok((await pts(D)).personal.bv === 60 && (await pts(A)).team.bv === 60, 'a second confirmed order adds BV 20 to Daud and every upline');
await setStatus(o3, 'cancelled');
ok((await pts(D)).personal.bv === 40 && (await pts(A)).team.bv === 40 && (await pts(R)).team.bv === 40, 'cancelling a confirmed order takes the points back from everyone');
ok((await comm(o3)).every((x) => x.status === 'cancelled'), 'and cancels every level of its commission');
const o4 = await order(D, 1);
await setStatus(o4, 'processing');
await setStatus(o4, 'delivered');
await setStatus(o4, 'returned');
c = await comm(o4);
const rev = await sql`select count(*)::int as n from wallet_entries where "order" = ${o4._id} and type = 'commission_reversal'`;
ok((await pts(D)).personal.bv === 40 && rev[0].n === 3, 'a returned order reverses points and books 3 commission reversals', { bv: (await pts(D)).personal.bv, rev: rev[0].n });

// --- a member in the middle shops -----------------------------------------------------------
const o5 = await order(B, 1);
await setStatus(o5, 'processing');
p = await pts(B);
ok(p.personal.bv === 20 && p.team.bv === 40 && p.group.bv === 60, 'Babar: own BV 20 + team BV 40 = group 60', p);
ok(JSON.stringify(await lv(A)) === '[[1,30,20],[3,60,40]]' && JSON.stringify(await lv(R)) === '[[2,30,20],[4,60,40]]', 'Babar\'s order counts as level 1 for Asma and level 2 for Root', [await lv(A), await lv(R)]);
ok((await pts(C)).team.bv === 40, 'nothing flows down to Chanda');

// --- views for every member, not only partners --------------------------------------------------
r = await call('GET', '/members/downline', null, R.token);
ok(r.status === 200 && r.data.totals.people === 4 && r.data.totals.direct === 1 && r.data.people.map((x) => x.level).join() === '1,2,3,4', 'Root (a regular member) sees 4 people across levels 1 to 4', r.data?.totals);
r = await call('GET', '/members/genealogy?depth=4', null, R.token);
ok(r.status === 200 && r.data.root.children[0].children[0].children[0].children[0].name === 'Daud T.', 'and the full tree, 4 levels deep');
r = await call('GET', `/members/genealogy?root=${A._id}`, null, D.token);
ok(r.status === 403, 'nobody can open their upline\'s tree');

// --- sponsor stays put ------------------------------------------------------------------------------
await order(D, 1, { refCode: R.code });
ok((await sql`select data->>'referredBy' as s from users where _id = ${D._id}`)[0].s === C._id, 'shopping through another member\'s link does not move Daud');
r = await call('POST', '/members/admin/reallocate', { userId: A._id, sponsorCode: D.code, note: 'loop test' }, admin);
ok(r.status === 400, 'admin cannot move someone under a member of their own team', r.message);

// --- eligibility rules -------------------------------------------------------------------------------
await setRules({ earnerEligibility: 'partners' });
const o6 = await order(D, 1);
await setStatus(o6, 'processing');
ok((await pts(D)).personal.bv === 60 && (await pts(C)).team.bv === 40 && (await comm(o6)).length === 0, 'partners-only rule: Daud still gets his own points; non-partner uplines earn nothing');
await setRules({ minPersonalBVToEarn: 50 });
const o7 = await order(D, 1);
await setStatus(o7, 'processing');
c = await comm(o7);
ok(c.length === 0 && (await pts(C)).team.bv === 60, 'own-BV rule: team points still count, but no one under 50 own BV this month earns commission', c);
await setRules({});

// --- duplicates --------------------------------------------------------------------------------------
const dup = await sql`select "order", "user", count(*)::int as n from points_entries where "user" in (${R._id}, ${A._id}, ${B._id}, ${C._id}, ${D._id}) group by 1, 2 having count(*) > 1`;
ok(dup.length === 0, 'no order ever credited the same person twice');
const codes = await sql`select referral_code, count(*)::int as n from users where referral_code is not null group by 1 having count(*) > 1`;
ok(codes.length === 0, 'no two members share a referral code');

console.log(`\n${pass} passed, ${fail} failed`);
await sql.end();
process.exit(fail ? 1 : 0);
