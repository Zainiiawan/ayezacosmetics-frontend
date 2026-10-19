// End-to-end check of the member tools (claims, service requests, news, lists,
// invite codes, register-a-friend, team, earnings, titles, welcome discount, cashback).
// Usage: DATABASE_URL=... BASE=http://localhost:3100 node scripts/dev/tools-e2e.mjs
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BASE = process.env.BASE || 'http://localhost:3100';
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 2 });
let pass = 0, fail = 0;
const ok = (cond, label, extra) => { if (cond) { pass++; console.log('PASS ', label); } else { fail++; console.log('FAIL ', label, JSON.stringify(extra ?? '').slice(0, 400)); } };
const id = () => Math.floor(Date.now() / 1000).toString(16).padStart(8, '0') + crypto.randomBytes(8).toString('hex');

async function call(method, path, body, token) {
  const res = await fetch(BASE + '/api' + path, {
    method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.9.' + Math.floor(Math.random() * 250) + '.' + Math.floor(Math.random() * 250), ...(token ? { authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try { json = await res.json(); } catch {}
  return { status: res.status, ...json };
}

const like = 'e2t-%@test.local';
const mine = sql`select _id from users where data->>'email' like ${like}`;
await sql`delete from wallet_entries where "user" in (${mine})`;
await sql`delete from claims where "user" in (${mine})`;
await sql`delete from tickets where "user" in (${mine})`;
await sql`delete from favourite_lists where "user" in (${mine})`;
await sql`delete from orders where data->>'customerEmail' like ${like}`;
await sql`delete from users where data->>'email' like ${like}`;
await sql`delete from news where data->>'title' like 'E2E %'`;
const pw = await bcrypt.hash('Test#12345', 10);
const mk = async (name, role = 'customer', extra = {}) => {
  const _id = id();
  const now = new Date().toISOString();
  const data = { firstName: name, lastName: 'Tester', email: `e2t-${name.toLowerCase()}@test.local`, password: pw, role, isEmailVerified: true, isActive: true, addresses: [], wishlist: [], compare: [], recentlyViewed: [], refreshTokens: [], createdAt: now, updatedAt: now, ...extra };
  await sql`insert into users (_id, data, created_at, updated_at) values (${_id}, ${sql.json(data)}, now(), now())`;
  const r = await call('POST', '/auth/login', { email: data.email, password: 'Test#12345' });
  return { _id, token: r.data?.accessToken || r.data?.tokens?.accessToken, email: data.email };
};
const admin = await mk('Admin', 'admin');
const pat = await mk('Pat', 'customer', { partner: { status: 'approved', city: 'Karachi', phone: '03110000000' }, memberCode: 'AZ-' + (100000 + Math.floor(Math.random() * 899999)) });
const cus = await mk('Cus');
const other = await mk('Other');
ok(admin.token && pat.token && cus.token && other.token, 'test users log in');

let r = await call('PUT', '/members/admin/settings', { referralCommissionPct: 10, partnerDiscountTiers: [{ minBV: 0, pct: 20 }], wholesaleDefaultDiscountPct: 30, wholesaleDefaultMinQty: 6, minWithdrawal: 1000, loyaltyRsPerPoint: 100, pointValueRs: 1, minRedeemPoints: 100, rsPerBV: 100, couponsForMembers: false, welcomeDiscountPct: 15, cashbackPct: 5, claimWindowDays: 14 }, admin.token);
ok(r.status === 200 && r.data.welcomeDiscountPct === 15 && r.data.titles.length >= 2, 'admin saves welcome discount, cashback and titles', r);

// --- invite code ---------------------------------------------------------------
const alias = 'PAT-' + crypto.randomBytes(2).toString('hex').toUpperCase();
r = await call('PUT', '/members/invite-code', { code: alias }, pat.token);
ok(r.status === 200 && r.data.inviteCode === alias && r.data.links.store.includes(alias), 'partner sets a personal invite code', r);
r = await call('PUT', '/members/invite-code', { code: alias + 'X' }, pat.token);
ok(r.status === 400, 'invite code can only change every 30 days');
r = await call('PUT', '/members/invite-code', { code: 'NOPE' }, cus.token);
ok(r.status === 403, 'customers cannot set invite codes');
r = await call('GET', `/members/ref/${alias.toLowerCase()}`);
ok(r.data.valid === true, 'personal invite code works as a referral code (any case)');
ok(r.data.valid === true && !('email' in r.data), 'ref lookup does not leak contact details');

// --- welcome discount + cashback -------------------------------------------------
const products = (await call('GET', '/products?limit=10')).data.products.filter((p) => p.stock > 5 && !p.isComingSoon && !(p.variants ?? []).length);
const P = products[0];
const ship = { firstName: 'T', lastName: 'Tester', phone: '03001234567', street: '1 Test Road', city: 'Lahore', state: 'Punjab', postalCode: '54000', country: 'Pakistan' };
r = await call('POST', '/orders/quote', { items: [{ productId: P._id, quantity: 2 }], city: 'Lahore', refCode: alias }, cus.token);
const q = r.data ?? (console.log('QUOTE', r), {});
ok(q.welcomeDiscount === Math.round(q.subtotal * 0.15) && q.welcomeDiscountPct === 15, 'first referred order gets the welcome discount', q);
ok(q.cashback === Math.round((q.subtotal - q.welcomeDiscount) * 0.05), 'cashback is quoted on the discounted amount', q);
r = await call('POST', '/orders', { items: [{ productId: P._id, quantity: 2 }], shippingAddress: ship, paymentMethod: 'cod', refCode: alias }, cus.token);
const order1 = r.data;
ok(r.status === 201 && order1.total === q.total && order1.welcomeDiscount === q.welcomeDiscount, 'order keeps welcome discount and quote total', r);
ok(order1.member.commission === Math.round((q.subtotal - q.welcomeDiscount) * 0.1), 'partner commission is on the discounted amount', order1.member);
r = await call('POST', '/orders/quote', { items: [{ productId: P._id, quantity: 1 }], city: 'Lahore' }, cus.token);
ok(r.data.welcomeDiscount === 0, 'welcome discount is only for the first order', r.data);
r = await call('POST', '/orders/quote', { items: [{ productId: P._id, quantity: 1 }], city: 'Lahore' }, other.token);
ok(r.data.welcomeDiscount === 0 && r.data.cashback > 0, 'no welcome discount without a partner, cashback still applies', r.data);
r = await call('GET', '/members/wallet', null, cus.token);
ok(r.data.summary.pending === order1.member.cashback && r.data.summary.available === 0, 'cashback waits as pending until delivery', r.data.summary);

// --- team, title, recognition -------------------------------------------------------
r = await call('GET', '/members/team', null, pat.token);
ok(r.status === 200 && r.data.people.length === 1 && r.data.people[0].monthOrders === 1 && r.data.totals.active === 1, 'team report shows the customer and this month activity', r.data);
ok(!JSON.stringify(r.data).includes('e2t-cus@'), 'team report does not expose emails');
r = await call('GET', '/members/team?filter=inactive', null, pat.token);
ok(r.data.people.length === 0, 'team filter: inactive');
r = await call('GET', '/members/me', null, pat.token);
ok(r.data.titleProgress && r.data.titleProgress.groupBV === order1.member.bv && r.data.titleProgress.title, 'title progress counts team points', r.data.titleProgress);
r = await call('GET', '/members/recognition', null, pat.token);
ok(r.status === 200 && r.data.list.some((x) => x.isMe), 'recognition board lists the partner', r.data);
r = await call('GET', '/members/recognition', null, cus.token);
ok(r.status === 403, 'recognition is for partners');

// --- delivery, earnings ------------------------------------------------------------
r = await call('PATCH', `/orders/${order1._id}/status`, { status: 'delivered', message: 'Delivered' }, admin.token);
ok(r.status === 200, 'admin marks delivered', r);
r = await call('GET', '/members/wallet', null, cus.token);
ok(r.data.summary.available === order1.member.cashback, 'cashback becomes spendable on delivery', r.data.summary);
r = await call('GET', '/members/earnings', null, pat.token);
ok(r.data.commission.available === order1.member.commission && r.data.estimated >= order1.member.commission, 'earnings page shows released commission', r.data);
r = await call('GET', '/members/earnings', null, cus.token);
ok(r.data.cashback.available === order1.member.cashback && r.data.immediateDiscounts >= q.welcomeDiscount, 'customer earnings show cashback and savings', r.data);

// --- claims ------------------------------------------------------------------------
r = await call('GET', '/claims/eligible', null, cus.token);
ok(r.data.orders.length === 1 && r.data.orders[0].items[0].claimable === 2, 'delivered order is claimable', r.data);
r = await call('POST', '/claims', { orderId: order1._id, type: 'damaged', items: [{ productId: P._id, quantity: 3 }], description: 'Box arrived crushed and leaking' }, cus.token);
ok(r.status === 400, 'cannot claim more than was ordered');
r = await call('POST', '/claims', { orderId: order1._id, type: 'damaged', items: [{ productId: P._id, quantity: 1 }], description: 'Box arrived crushed and leaking' }, other.token);
ok(r.status === 404, 'cannot claim on someone else\'s order');
r = await call('POST', '/claims', { orderId: order1._id, type: 'damaged', items: [{ productId: P._id, quantity: 1 }], description: 'Box arrived crushed and leaking', photos: ['javascript:alert(1)'] }, cus.token);
ok(r.status === 422 || r.status === 400, 'claim photos must be real image links', r.status);
r = await call('POST', '/claims', { orderId: order1._id, type: 'damaged', items: [{ productId: P._id, quantity: 1 }], description: 'Box arrived crushed and leaking' }, cus.token);
const claim = r.data;
ok(r.status === 201 && claim.status === 'open' && claim.value === order1.items[0].price, 'claim is opened with its value', r);
r = await call('POST', '/claims', { orderId: order1._id, type: 'damaged', items: [{ productId: P._id, quantity: 1 }], description: 'Second claim on the same order' }, cus.token);
ok(r.status === 400, 'only one open claim per order');
r = await call('POST', `/claims/${claim._id}/decide`, { action: 'approve' }, cus.token);
ok(r.status === 403, 'customers cannot approve claims');
const before = (await call('GET', '/members/wallet', null, cus.token)).data.summary.available;
const [a1, a2] = await Promise.all([
  call('POST', `/claims/${claim._id}/decide`, { action: 'approve', refundAmount: 999999 }, admin.token),
  call('POST', `/claims/${claim._id}/decide`, { action: 'approve', refundAmount: 999999 }, admin.token),
]);
ok([a1.status, a2.status].sort().join() === '200,400', 'a claim can be decided only once (double click safe)', [a1.status, a2.status]);
const after = (await call('GET', '/members/wallet', null, cus.token)).data.summary.available;
ok(after - before === claim.value, 'refund is capped at the claim value and paid once', { before, after, value: claim.value });
r = await call('GET', '/claims/eligible', null, cus.token);
ok(r.data.orders[0]?.items[0]?.claimable === 1, 'claimed quantity is used up', r.data);
r = await call('GET', '/claims/mine', null, cus.token);
ok(r.data.length === 1 && r.data[0].status === 'approved', 'claim history shows the decision');
await sql`update orders set data = jsonb_set(data, '{deliveredAt}', to_jsonb((now() - interval '30 days')::text)) where _id = ${order1._id}`;
r = await call('POST', '/claims', { orderId: order1._id, type: 'damaged', items: [{ productId: P._id, quantity: 1 }], description: 'Late claim on this order' }, cus.token);
ok(r.status === 400, 'claims close after the claim window');

// --- service requests --------------------------------------------------------------
r = await call('POST', '/tickets', { category: 'delivery', subject: 'Where is my parcel', message: 'It has been a week, please check.' }, cus.token);
const t = r.data;
ok(r.status === 201 && t.status === 'open' && t.messages.length === 1, 'member opens a service request', r);
r = await call('POST', `/tickets/${t._id}/reply`, { message: 'Hello' }, other.token);
ok(r.status === 404, 'others cannot reply on it');
r = await call('POST', `/tickets/${t._id}/reply`, { message: 'Your parcel ships today.' }, admin.token);
ok(r.status === 200 && r.data.status === 'answered' && r.data.messages[1].from === 'team', 'team replies');
r = await call('GET', '/tickets/mine', null, cus.token);
ok(r.data[0].messages.length === 2, 'member sees the reply');
r = await call('POST', `/tickets/${t._id}/close`, null, cus.token);
r = await call('POST', `/tickets/${t._id}/reply`, { message: 'Thanks' }, cus.token);
ok(r.status === 400, 'closed requests take no more replies');

// --- news --------------------------------------------------------------------------
r = await call('POST', '/news', { title: 'E2E Partner meeting', category: 'events', audience: 'partners', summary: 'For partners' }, admin.token);
ok(r.status === 201, 'admin publishes partner news');
await call('POST', '/news', { title: 'E2E New launch', category: 'products', audience: 'all' }, admin.token);
r = await call('POST', '/news', { title: 'E2E nope', category: 'news' }, cus.token);
ok(r.status === 403, 'members cannot publish news');
r = await call('GET', '/news/feed', null, cus.token);
ok(r.data.some((n) => n.title === 'E2E New launch') && !r.data.some((n) => n.title === 'E2E Partner meeting'), 'customers do not see partner-only news');
r = await call('GET', '/news/feed', null, pat.token);
ok(r.data.some((n) => n.title === 'E2E Partner meeting'), 'partners see partner news');

// --- favourite lists -----------------------------------------------------------------
r = await call('POST', '/lists', { name: 'Eid gifts' }, cus.token);
const L = r.data;
ok(r.status === 201 && L.shareToken, 'member creates a list');
r = await call('POST', `/lists/${L._id}/items`, { productId: P._id }, cus.token);
r = await call('POST', `/lists/${L._id}/items`, { productId: P._id }, cus.token);
ok(r.data.items.length === 1, 'adding twice keeps one');
r = await call('POST', `/lists/${L._id}/items`, { productId: P._id }, other.token);
ok(r.status === 404, 'others cannot edit the list');
r = await call('GET', `/lists/shared/${L.shareToken}`);
ok(r.status === 200 && r.data.items.length === 1 && !('user' in r.data), 'shared link shows the list without account details');
await call('PUT', `/lists/${L._id}`, { name: 'Eid gifts', isPublic: false }, cus.token);
r = await call('GET', `/lists/shared/${L.shareToken}`);
ok(r.status === 404, 'private lists are not shared');

// --- quick order -------------------------------------------------------------------
if (P.sku) {
  r = await call('GET', `/quick-order/${encodeURIComponent(P.sku.toLowerCase())}`);
  ok(r.status === 200 && r.data._id === P._id, 'quick order finds a product by code');
}
r = await call('GET', '/quick-order/NO-SUCH-CODE-1');
ok(r.status === 404, 'unknown product code');

// --- training progress ---------------------------------------------------------------
const tr = await call('POST', '/trainings', { title: 'E2E Welcome', track: 'onboarding', isActive: true }, admin.token);
r = await call('POST', `/trainings/${tr.data._id}/complete`, { done: true }, pat.token);
await call('POST', `/trainings/${tr.data._id}/complete`, { done: true }, pat.token);
r = await call('GET', '/trainings/mine', null, pat.token);
ok(r.data.find((x) => x._id === tr.data._id)?.completed === true, 'partner marks a module done');
const cnt = await sql`select jsonb_array_length(data->'completedTrainings') as n from users where _id = ${pat._id}`;
ok(Number(cnt[0].n) === 1, 'completing twice stores it once');
await call('DELETE', `/trainings/${tr.data._id}`, null, admin.token);

// --- register a friend + activation -----------------------------------------------------
const friendEmail = 'e2t-friend@test.local';
r = await call('POST', '/members/register-friend', { firstName: 'Fay', lastName: 'Friend', email: friendEmail, phone: '03009998887', city: 'Multan', consent: true }, pat.token);
ok(r.status === 201 && r.data.activationLink.includes('/activate?token='), 'partner registers a friend and gets an activation link', r);
const token1 = r.data.activationLink.split('token=')[1];
r = await call('POST', '/members/register-friend', { firstName: 'Fay', lastName: 'Friend', email: friendEmail, phone: '03009998887', city: 'Multan', consent: true }, pat.token);
ok(r.status === 400, 'the same email cannot be registered twice');
r = await call('POST', '/members/register-friend', { firstName: 'Xena', lastName: 'Young', email: 'e2t-x@test.local', phone: '03009998887', city: 'Multan', consent: true }, cus.token);
ok(r.status === 403, 'only partners can register people');
r = await call('POST', '/auth/login', { email: friendEmail, password: 'Test#12345' });
ok(r.status === 401 || r.status === 400 || r.status === 403, 'a registered friend cannot sign in before activating', r.status);
r = await call('GET', '/members/registered', null, pat.token);
ok(r.data.length === 1 && r.data[0].activated === false, 'partner sees the pending activation');
const regId = r.data[0]._id;
r = await call('POST', `/members/registered/${regId}/link`, null, pat.token);
const token2 = r.data.activationLink.split('token=')[1];
r = await call('GET', `/auth/activate/${token1}`);
ok(r.status === 401, 'a new link replaces the old one');
r = await call('GET', `/auth/activate/${token2}`);
ok(r.status === 200 && r.data.firstName === 'Fay', 'activation link opens');
r = await call('POST', '/auth/activate', { token: token2, password: 'weak' });
ok(r.status === 422 || r.status === 400, 'weak passwords are refused');
r = await call('POST', '/auth/activate', { token: token2, password: 'Strong#123' });
ok(r.status === 200 && r.data.tokens.accessToken && !('activationToken' in r.data.user), 'friend sets a password and is signed in', r);
r = await call('POST', '/auth/activate', { token: token2, password: 'Strong#123' });
ok(r.status === 401, 'activation link works once');
r = await call('GET', '/members/me', null, (await call('POST', '/auth/login', { email: friendEmail, password: 'Strong#123' })).data?.tokens?.accessToken);
ok(r.data?.sponsor?.memberCode, 'friend is in the partner\'s team');

// --- sponsor contact sharing + reallocation ----------------------------------------------
r = await call('GET', '/members/me', null, cus.token);
ok(r.data.sponsor && !r.data.sponsor.phone, 'sponsor contact hidden by default');
await call('PUT', '/members/preferences', { shareContact: true, myWhy: 'Financial freedom' }, pat.token);
r = await call('GET', '/members/me', null, cus.token);
ok(r.data.sponsor.phone === '03110000000', 'sponsor contact shown once the partner opts in', r.data.sponsor);
r = await call('POST', '/members/admin/reallocate', { userId: cus._id, sponsorCode: '', note: 'Customer asked to leave' }, admin.token);
ok(r.status === 200 && !r.data.referredBy, 'admin removes a sponsor');
r = await call('POST', '/members/admin/reallocate', { userId: pat._id, sponsorCode: alias, note: 'self' }, admin.token);
ok(r.status === 400, 'a partner cannot sponsor themselves');
r = await call('POST', '/members/admin/reallocate', { userId: cus._id, sponsorCode: alias, note: 'Back to Pat' }, admin.token);
ok(r.status === 200 && r.data.referredBy === pat._id, 'admin moves a member to a sponsor');
r = await call('GET', '/members/out-of-stock', null, pat.token);
ok(r.status === 200 && Array.isArray(r.data), 'out of stock report');

// --- cancellation reverses cashback ----------------------------------------------------
r = await call('POST', '/orders', { items: [{ productId: P._id, quantity: 1 }], shippingAddress: ship, paymentMethod: 'cod' }, other.token);
const o2 = r.data;
r = await call('PATCH', `/orders/${o2._id}/status`, { status: 'cancelled', message: 'x' }, admin.token);
const cb = await sql`select status from wallet_entries where "order" = ${o2._id} and type = 'cashback'`;
ok(cb[0]?.status === 'cancelled', 'cancelling an order cancels its pending cashback', cb);

await call('PUT', '/members/admin/settings', { referralCommissionPct: 10, partnerDiscountTiers: [{ minBV: 0, pct: 20 }, { minBV: 100, pct: 25 }, { minBV: 250, pct: 30 }], wholesaleDefaultDiscountPct: 30, wholesaleDefaultMinQty: 6, minWithdrawal: 1000, loyaltyRsPerPoint: 100, pointValueRs: 1, minRedeemPoints: 100, rsPerBV: 100, couponsForMembers: false, welcomeDiscountPct: 0, cashbackPct: 0 }, admin.token);
console.log(`\n${pass} passed, ${fail} failed`);
await sql.end();
process.exit(fail ? 1 : 0);
