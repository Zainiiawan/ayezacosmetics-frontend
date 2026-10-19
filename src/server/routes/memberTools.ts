import crypto from 'crypto';
import { z } from 'zod';
import { db, getSql, Doc } from '../db';
import { Router, json, validate, authenticate, adminOnly, rateLimit, BadRequestError, NotFoundError } from '../http';
import { createNotification, notifyAdmins, applyProductDiscount } from '../commerce';
import { getMemberSettings, isPartner, postCredits } from '../members';

const imageUrl = z.string().max(500).refine((v) => /^https:\/\//.test(v) || v.startsWith('/'), 'Invalid image');

// ===========================================================================
// Claims and returns: a member reports a problem with items from a delivered order
// ===========================================================================
export const claims = new Router();

const claimSchema = z.object({
  orderId: z.string(),
  type: z.enum(['damaged', 'wrong_item', 'missing_item', 'quality', 'return']),
  items: z.array(z.object({ productId: z.string(), variant: z.string().optional(), quantity: z.number().int().min(1).max(500) })).min(1).max(50),
  description: z.string().trim().min(10).max(2000),
  photos: z.array(imageUrl).max(6).default([]),
  resolution: z.enum(['refund_wallet', 'replacement']).default('refund_wallet'),
});

const sameLine = (a: any, productId: string, variant?: string) => String(a.product?._id ?? a.product) === productId && (a.variant ?? '') === (variant ?? '');

/** How many of each order line are still claimable (ordered minus already claimed, excluding rejected claims). */
type ClaimLine = { line: any; left: number };

async function claimable(order: Doc): Promise<ClaimLine[]> {
  const previous = await db.claims.find({ order: order._id });
  return (order.items ?? []).map((line: any) => {
    const used = previous
      .filter((c) => c.status !== 'rejected')
      .flatMap((c) => c.items)
      .filter((i: any) => sameLine(line, i.productId, i.variant))
      .reduce((s: number, i: any) => s + i.quantity, 0);
    return { line, left: Math.max(0, line.quantity - used) };
  });
}

function deliveredAt(order: Doc): string | null {
  if (order.deliveredAt) return order.deliveredAt;
  const h = [...(order.trackingHistory ?? [])].reverse().find((t: any) => t.status === 'delivered');
  return h?.timestamp ?? null;
}

/** Orders the member can still claim on, with what is left per line. */
claims.get('/eligible', authenticate, async ({ user }) => {
  const ms = await getMemberSettings();
  const orders = await db.orders.find({ user: user!._id, status: 'delivered' }, { sort: { createdAt: -1 }, limit: 50 });
  const out = [];
  for (const o of orders) {
    const at = deliveredAt(o);
    if (!at || Date.now() - new Date(at).getTime() > ms.claimWindowDays * 86400000) continue;
    const lines = (await claimable(o)).filter((l) => l.left > 0);
    if (!lines.length) continue;
    out.push({
      _id: o._id,
      orderNumber: o.orderNumber,
      deliveredAt: at,
      claimUntil: new Date(new Date(at).getTime() + ms.claimWindowDays * 86400000).toISOString(),
      items: lines.map(({ line, left }) => ({ productId: String(line.product?._id ?? line.product), variant: line.variant, name: line.name, image: line.image, price: line.price, quantity: line.quantity, claimable: left })),
    });
  }
  return json({ success: true, message: 'Claimable orders', data: { orders: out, windowDays: ms.claimWindowDays } });
});

claims.post('/', authenticate, rateLimit('claims', 60 * 60 * 1000, 10, 'Too many claims. Please try later.'), validate(claimSchema), async ({ body, user }) => {
  const ms = await getMemberSettings();
  const order = await db.orders.findById(body.orderId);
  if (!order || String(order.user) !== user!._id) throw new NotFoundError('Order');
  if (order.status !== 'delivered') throw new BadRequestError('You can raise a claim once the order is delivered');
  const at = deliveredAt(order);
  if (!at || Date.now() - new Date(at).getTime() > ms.claimWindowDays * 86400000) {
    throw new BadRequestError(`Claims must be made within ${ms.claimWindowDays} days of delivery`);
  }
  const lines = await claimable(order);
  let value = 0;
  const items = body.items.map((i: { productId: string; variant?: string; quantity: number }) => {
    const l = lines.find((x) => sameLine(x.line, i.productId, i.variant));
    if (!l) throw new BadRequestError('That item is not in this order');
    if (i.quantity > l.left) throw new BadRequestError(`You can claim up to ${l.left} of ${l.line.name}`);
    value += Number(l.line.price) * i.quantity;
    return { productId: i.productId, variant: i.variant, name: l.line.name, image: l.line.image, price: Number(l.line.price), quantity: i.quantity };
  });
  const open = await db.claims.findOne({ order: order._id, status: 'open' });
  if (open) throw new BadRequestError('There is already an open claim for this order');
  let claim: Doc;
  try {
    claim = await db.claims.create({
      claimNumber: `CLM-${Date.now().toString(36).toUpperCase()}`,
      user: user!._id,
      customerName: `${user!.firstName} ${user!.lastName}`,
      order: order._id,
      orderNumber: order.orderNumber,
      type: body.type,
      items,
      value,
      description: body.description,
      photos: body.photos,
      resolution: body.resolution,
      status: 'open',
      history: [{ status: 'open', at: new Date().toISOString(), note: 'Claim submitted' }],
    });
  } catch {
    throw new BadRequestError('There is already an open claim for this order');
  }
  await notifyAdmins({ type: 'general', title: 'New claim', message: `${claim.claimNumber} on order ${order.orderNumber} (Rs. ${value.toLocaleString()})`, link: '/admin/support?tab=claims' });
  return json({ success: true, message: 'Claim submitted. We will get back to you shortly.', data: claim }, 201);
});

claims.get('/mine', authenticate, async ({ user }) => {
  const list = await db.claims.find({ user: user!._id }, { sort: { createdAt: -1 }, limit: 100 });
  return json({ success: true, message: 'Claims', data: list });
});

claims.get('/', adminOnly, async ({ query }) => {
  const filter = query.status ? { status: String(query.status) } : {};
  return json({ success: true, message: 'Claims', data: await db.claims.find(filter, { sort: { createdAt: -1 }, limit: 300 }) });
});

const decideSchema = z.object({
  action: z.enum(['approve', 'reject']),
  refundAmount: z.number().min(0).optional(),
  note: z.string().trim().max(500).optional(),
});

claims.post('/:id/decide', adminOnly, validate(decideSchema), async ({ params, body, user: admin }) => {
  const sql = getSql();
  // Claim the decision atomically so a double click cannot refund twice
  const now = new Date().toISOString();
  const next = body.action === 'approve' ? 'approved' : 'rejected';
  const rows = await sql`update claims set data = data || ${JSON.stringify({ status: next, decidedAt: now, decidedBy: admin!._id })}::text::jsonb, updated_at = ${now}
                         where _id = ${params.id} and status = 'open' returning _id`;
  if (!rows.length) throw new BadRequestError('This claim is already closed');
  const claim = (await db.claims.findById(params.id))!;
  let refund = 0;
  if (next === 'approved' && claim.resolution === 'refund_wallet') {
    refund = Math.min(Number(body.refundAmount ?? claim.value), Number(claim.value));
    if (refund > 0) {
      await postCredits([{ user: claim.user, type: 'claim_refund', amount: refund, status: 'available', order: claim.order, orderNumber: claim.orderNumber, note: `Claim ${claim.claimNumber} approved` }]);
    }
  }
  claim.refundAmount = refund;
  claim.adminNote = body.note;
  claim.history = [...(claim.history ?? []), { status: next, at: now, note: body.note ?? (refund ? `Rs. ${refund} added to wallet` : undefined) }];
  await db.claims.save(claim);
  const msg =
    next === 'approved'
      ? claim.resolution === 'replacement'
        ? `Claim ${claim.claimNumber} is approved. We will send you a replacement.`
        : `Claim ${claim.claimNumber} is approved. Rs. ${refund.toLocaleString()} was added to your wallet.`
      : `Claim ${claim.claimNumber} was not approved.${body.note ? ` ${body.note}` : ''}`;
  await createNotification({ userId: claim.user, type: 'general', title: 'Claim update', message: msg, link: '/account/claims' });
  return json({ success: true, message: 'Claim updated', data: claim });
});

// ===========================================================================
// Service requests: a simple ticket thread between a member and the team
// ===========================================================================
export const tickets = new Router();

const ticketSchema = z.object({
  category: z.enum(['order', 'delivery', 'payment', 'product', 'account', 'partner', 'other']),
  subject: z.string().trim().min(4).max(120),
  orderNumber: z.string().trim().max(40).optional(),
  message: z.string().trim().min(5).max(3000),
  attachments: z.array(imageUrl).max(4).default([]),
});
const replySchema = z.object({ message: z.string().trim().min(1).max(3000), attachments: z.array(imageUrl).max(4).default([]) });

const ticketLimiter = rateLimit('tickets', 60 * 60 * 1000, 30, 'Too many messages. Please try later.');

tickets.post('/', authenticate, ticketLimiter, validate(ticketSchema), async ({ body, user }) => {
  const open = await db.tickets.count({ user: user!._id, status: { $in: ['open', 'answered'] } });
  if (open >= 5) throw new BadRequestError('You have 5 open requests. Please close one before opening another.');
  const now = new Date().toISOString();
  const t = await db.tickets.create({
    ticketNumber: `SR-${Date.now().toString(36).toUpperCase()}`,
    user: user!._id,
    customerName: `${user!.firstName} ${user!.lastName}`,
    customerEmail: user!.email,
    category: body.category,
    subject: body.subject,
    orderNumber: body.orderNumber,
    status: 'open',
    messages: [{ from: 'member', body: body.message, attachments: body.attachments, at: now }],
    lastMessageAt: now,
  });
  await notifyAdmins({ type: 'general', title: 'New service request', message: `${t.ticketNumber}: ${body.subject}`, link: '/admin/support?tab=tickets' });
  return json({ success: true, message: 'Request sent. We usually reply within one working day.', data: t }, 201);
});

tickets.get('/mine', authenticate, async ({ user }) => {
  const list = await db.tickets.find({ user: user!._id }, { sort: { updatedAt: -1 }, limit: 100 });
  return json({ success: true, message: 'Requests', data: list });
});

tickets.get('/', adminOnly, async ({ query }) => {
  const filter = query.status ? { status: String(query.status) } : {};
  return json({ success: true, message: 'Requests', data: await db.tickets.find(filter, { sort: { updatedAt: -1 }, limit: 300 }) });
});

tickets.post('/:id/reply', authenticate, ticketLimiter, validate(replySchema), async ({ params, body, user }) => {
  const t = await db.tickets.findById(params.id);
  const isAdmin = user!.role === 'admin';
  if (!t || (!isAdmin && t.user !== user!._id)) throw new NotFoundError('Request');
  if (t.status === 'closed') throw new BadRequestError('This request is closed. Please open a new one.');
  const now = new Date().toISOString();
  t.messages = [...(t.messages ?? []), { from: isAdmin ? 'team' : 'member', by: isAdmin ? user!.firstName : undefined, body: body.message, attachments: body.attachments, at: now }].slice(-200);
  t.status = isAdmin ? 'answered' : 'open';
  t.lastMessageAt = now;
  await db.tickets.save(t);
  if (isAdmin) await createNotification({ userId: t.user, type: 'general', title: `Reply on ${t.ticketNumber}`, message: body.message.slice(0, 140), link: '/account/support' });
  else await notifyAdmins({ type: 'general', title: `Reply on ${t.ticketNumber}`, message: body.message.slice(0, 140), link: '/admin/support?tab=tickets' });
  return json({ success: true, message: 'Reply sent', data: t });
});

tickets.post('/:id/close', authenticate, async ({ params, user }) => {
  const t = await db.tickets.findById(params.id);
  if (!t || (user!.role !== 'admin' && t.user !== user!._id)) throw new NotFoundError('Request');
  t.status = 'closed';
  t.closedAt = new Date().toISOString();
  await db.tickets.save(t);
  return json({ success: true, message: 'Request closed', data: t });
});

// ===========================================================================
// What's new: announcements for members and partners
// ===========================================================================
export const news = new Router();

const newsSchema = z.object({
  title: z.string().trim().min(3).max(140),
  category: z.enum(['news', 'offers', 'products', 'events', 'training', 'tools']),
  audience: z.enum(['all', 'partners']).default('all'),
  summary: z.string().trim().max(400).optional(),
  body: z.string().max(20000).optional(),
  image: imageUrl.optional().or(z.literal('')),
  link: z.string().max(300).refine((v) => v === '' || /^https:\/\//.test(v) || /^\/[^/]/.test(v), 'Use a https:// link or a page path like /shop').optional(),
  pinned: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

news.get('/feed', authenticate, async ({ user, query }) => {
  const me = await db.users.findById(user!._id);
  const partner = isPartner(me) || me?.role === 'admin';
  let list = (await db.news.find({ isPublished: true }, { sort: { createdAt: -1 }, limit: 100 })).filter((n) => partner || n.audience !== 'partners');
  if (query.category) list = list.filter((n) => n.category === String(query.category));
  list.sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  return json({ success: true, message: 'News', data: list });
});
news.get('/', adminOnly, async () => json({ success: true, message: 'News', data: await db.news.find({}, { sort: { createdAt: -1 } }) }));
news.post('/', adminOnly, validate(newsSchema), async ({ body }) => {
  const n = await db.news.create(body);
  return json({ success: true, message: 'Published', data: n }, 201);
});
news.put('/:id', adminOnly, validate(newsSchema), async ({ params, body }) => {
  const n = await db.news.updateById(params.id, body);
  if (!n) throw new NotFoundError('Article');
  return json({ success: true, message: 'Saved', data: n });
});
news.delete('/:id', adminOnly, async ({ params }) => {
  await db.news.deleteById(params.id);
  return json({ success: true, message: 'Deleted' });
});

// ===========================================================================
// Favourite lists: named product lists a member can share with a link
// ===========================================================================
export const lists = new Router();

const listSchema = z.object({ name: z.string().trim().min(1).max(60), isPublic: z.boolean().default(true) });
const MAX_LISTS = 20;
const MAX_ITEMS = 200;

function productCard(p: Doc) {
  const price = applyProductDiscount(p, p.basePrice);
  return { _id: p._id, name: p.name, slug: p.slug, image: p.images?.[0]?.url ?? '', price, basePrice: p.basePrice, stock: p.stock, rating: p.rating };
}

async function withProducts(list: Doc): Promise<Doc & { items: any[] }> {
  const products = await db.products.findByIds(list.products ?? []);
  const byId = new Map(products.filter((p) => p.isActive !== false).map((p) => [p._id, p]));
  return { ...list, items: (list.products ?? []).map((id: string) => byId.get(id)).filter(Boolean).map((p: Doc) => productCard(p)) };
}

async function ownList(id: string, userId: string) {
  const l = await db.favouriteLists.findById(id);
  if (!l || l.user !== userId) throw new NotFoundError('List');
  return l;
}

lists.get('/', authenticate, async ({ user }) => {
  const mine = await db.favouriteLists.find({ user: user!._id }, { sort: { updatedAt: -1 } });
  return json({ success: true, message: 'Lists', data: await Promise.all(mine.map(withProducts)) });
});

lists.post('/', authenticate, validate(listSchema), async ({ body, user }) => {
  if ((await db.favouriteLists.count({ user: user!._id })) >= MAX_LISTS) throw new BadRequestError(`You can keep up to ${MAX_LISTS} lists`);
  const l = await db.favouriteLists.create({ user: user!._id, ownerName: user!.firstName, name: body.name, isPublic: body.isPublic, products: [], shareToken: crypto.randomBytes(9).toString('base64url') });
  return json({ success: true, message: 'List created', data: await withProducts(l) }, 201);
});

lists.put('/:id', authenticate, validate(listSchema), async ({ params, body, user }) => {
  const l = await ownList(params.id, user!._id);
  Object.assign(l, body);
  await db.favouriteLists.save(l);
  return json({ success: true, message: 'List saved', data: await withProducts(l) });
});

lists.delete('/:id', authenticate, async ({ params, user }) => {
  await ownList(params.id, user!._id);
  await db.favouriteLists.deleteById(params.id);
  return json({ success: true, message: 'List deleted' });
});

lists.post('/:id/items', authenticate, validate(z.object({ productId: z.string() })), async ({ params, body, user }) => {
  const l = await ownList(params.id, user!._id);
  const p = await db.products.findById(body.productId);
  if (!p || p.isActive === false) throw new NotFoundError('Product');
  const items: string[] = l.products ?? [];
  if (!items.includes(p._id)) {
    if (items.length >= MAX_ITEMS) throw new BadRequestError(`A list can hold up to ${MAX_ITEMS} products`);
    l.products = [p._id, ...items];
    await db.favouriteLists.save(l);
  }
  return json({ success: true, message: `Added to ${l.name}`, data: await withProducts(l) });
});

lists.delete('/:id/items/:productId', authenticate, async ({ params, user }) => {
  const l = await ownList(params.id, user!._id);
  l.products = (l.products ?? []).filter((x: string) => x !== params.productId);
  await db.favouriteLists.save(l);
  return json({ success: true, message: 'Removed', data: await withProducts(l) });
});

/** Anyone with the link can see a public list. */
lists.get('/shared/:token', async ({ params }) => {
  const l = await db.favouriteLists.findOne({ shareToken: params.token });
  if (!l || !l.isPublic) throw new NotFoundError('List');
  const full = await withProducts(l);
  return json({ success: true, message: 'Shared list', data: { name: full.name, ownerName: full.ownerName, items: full.items, updatedAt: full.updatedAt } });
});

// ===========================================================================
// Quick order: find a product by its code (SKU) to add it straight to the bag
// ===========================================================================
export const quickOrder = new Router();

quickOrder.get('/:code', rateLimit('quick', 60 * 1000, 60, 'Too many lookups. Please slow down.'), async ({ params }) => {
  const code = String(params.code).trim().toUpperCase().slice(0, 40);
  if (!code) throw new BadRequestError('Enter a product code');
  const sql = getSql();
  const rows = await sql`
    select _id, data from products
     where coalesce((data->>'isActive')::boolean, true)
       and (upper(data->>'sku') = ${code}
            or exists (select 1 from jsonb_array_elements(coalesce(data->'variants','[]'::jsonb)) v where upper(v->>'sku') = ${code}))
     limit 1`;
  const r = rows[0] as any;
  if (!r) throw new NotFoundError('No product with that code');
  const p: Doc = { _id: r._id, ...r.data };
  const variant = (p.variants ?? []).find((v: any) => String(v.sku ?? '').toUpperCase() === code);
  return json({
    success: true,
    message: 'Product',
    data: { ...productCard(p), sku: p.sku, variant: variant ? (variant.sku ?? variant.value) : undefined, variantLabel: variant ? variant.value ?? variant.name : undefined, isComingSoon: Boolean(p.isComingSoon) },
  });
});

