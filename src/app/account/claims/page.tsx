'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AccountShell from '@/components/member/AccountShell';
import { Notice, StatusBadge, money } from '@/components/member/ui';
import { toolsApi, CLAIM_TYPES, ClaimableOrder } from '@/lib/api/toolsApi';
import { mediaApi } from '@/lib/api/mediaApi';
import { apiError } from '@/lib/api/memberApi';
import { cn, formatDate } from '@/lib/utils';

const TYPE_LABEL = Object.fromEntries(CLAIM_TYPES);

export default function ClaimsPage() {
  const [tab, setTab] = useState<'new' | 'history'>('new');
  return (
    <AccountShell title="Claims and returns" intro="Something wrong with a delivered order? Tell us which items and what happened, and we will put it right.">
      <div className="flex gap-2 mb-8">
        {(['new', 'history'] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={cn('px-4 py-2 rounded-full border text-[0.85rem]', tab === k ? 'bg-ink text-white border-ink' : 'border-line hover:border-ink')}>
            {k === 'new' ? 'New claim' : 'Claim history'}
          </button>
        ))}
      </div>
      {tab === 'new' ? <NewClaim onDone={() => setTab('history')} /> : <History />}
    </AccountShell>
  );
}

function NewClaim({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['claims-eligible'], queryFn: toolsApi.claims.eligible });
  const [orderId, setOrderId] = useState('');
  const [qty, setQty] = useState<Record<string, number>>({});
  const [type, setType] = useState<string>('damaged');
  const [resolution, setResolution] = useState<'refund_wallet' | 'replacement'>('refund_wallet');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const order: ClaimableOrder | undefined = data?.orders.find((o) => o._id === orderId);
  const key = (i: { productId: string; variant?: string }) => `${i.productId}|${i.variant ?? ''}`;
  const chosen = order ? order.items.filter((i) => (qty[key(i)] ?? 0) > 0) : [];
  const value = order ? chosen.reduce((s, i) => s + i.price * (qty[key(i)] ?? 0), 0) : 0;

  const submit = useMutation({
    mutationFn: () =>
      toolsApi.claims.create({
        orderId,
        type,
        resolution,
        description,
        photos,
        items: chosen.map((i) => ({ productId: i.productId, variant: i.variant, quantity: qty[key(i)] })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims-mine'] });
      qc.invalidateQueries({ queryKey: ['claims-eligible'] });
      setOrderId('');
      setQty({});
      setDescription('');
      setPhotos([]);
      onDone();
    },
  });

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setUploadError('');
    try {
      const up = await mediaApi.uploadPublic(Array.from(files).slice(0, 6 - photos.length));
      setPhotos((p) => [...p, ...up.map((u) => u.url)].slice(0, 6));
    } catch (err) {
      setUploadError(apiError(err, 'Could not upload the photos'));
    } finally {
      setUploading(false);
    }
  };

  if (isLoading || !data) return <p className="text-muted">Loading…</p>;
  if (data.orders.length === 0) {
    return <Notice>You have no delivered orders from the last {data.windowDays} days to claim on. For anything else, open a service request.</Notice>;
  }

  return (
    <div className="grid lg:grid-cols-[1fr_20rem] gap-8">
      <div className="space-y-8">
        <section>
          <h2 className="text-[1.15rem] font-light mb-3">1. Choose the order</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.orders.map((o) => (
              <button
                key={o._id}
                onClick={() => {
                  setOrderId(o._id);
                  setQty({});
                }}
                className={cn('text-left border p-4 transition-colors', orderId === o._id ? 'border-ink bg-tile' : 'border-line hover:border-ink')}
              >
                <p className="text-[0.95rem]">{o.orderNumber}</p>
                <p className="text-[0.8rem] text-muted">
                  Delivered {formatDate(o.deliveredAt)} · claim by {formatDate(o.claimUntil)}
                </p>
              </button>
            ))}
          </div>
        </section>

        {order && (
          <section>
            <h2 className="text-[1.15rem] font-light mb-3">2. Which items?</h2>
            <div className="border border-line divide-y divide-line">
              {order.items.map((i) => (
                <div key={key(i)} className="flex items-center gap-3 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {i.image && <img src={i.image} alt="" className="w-14 h-14 object-cover bg-tile" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.92rem] truncate">{i.name}</p>
                    <p className="text-[0.78rem] text-muted">
                      {money(i.price)} each · up to {i.claimable}
                    </p>
                  </div>
                  <select
                    aria-label={`Quantity of ${i.name}`}
                    value={qty[key(i)] ?? 0}
                    onChange={(e) => setQty((q) => ({ ...q, [key(i)]: Number(e.target.value) }))}
                    className="h-10 px-2 border border-line bg-white"
                  >
                    {Array.from({ length: i.claimable + 1 }, (_, n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        {order && chosen.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-[1.15rem] font-light">3. What happened?</h2>
            <div className="flex flex-wrap gap-2">
              {CLAIM_TYPES.map(([k, label]) => (
                <button key={k} onClick={() => setType(k)} className={cn('px-3 py-1.5 rounded-full border text-[0.82rem]', type === k ? 'bg-ink text-white border-ink' : 'border-line hover:border-ink')}>
                  {label}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="block text-[0.85rem] mb-1.5">Tell us more</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="For example: the bottle cap was broken and the cream had leaked."
                className="w-full p-3 border border-line focus:outline-none focus:border-ink"
              />
            </label>
            <div>
              <span className="block text-[0.85rem] mb-1.5">Photos (helps us decide faster)</span>
              <div className="flex flex-wrap gap-2 items-center">
                {photos.map((u) => (
                  <span key={u} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="w-20 h-20 object-cover border border-line" />
                    <button onClick={() => setPhotos((p) => p.filter((x) => x !== u))} aria-label="Remove photo" className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white text-[0.8rem]">
                      ×
                    </button>
                  </span>
                ))}
                {photos.length < 6 && (
                  <label className="w-20 h-20 border border-dashed border-line flex items-center justify-center text-[0.75rem] text-muted cursor-pointer hover:border-ink">
                    {uploading ? '…' : 'Add'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
                  </label>
                )}
              </div>
              {uploadError && <p className="mt-2 text-[0.82rem] text-sale">{uploadError}</p>}
            </div>
            <div>
              <span className="block text-[0.85rem] mb-1.5">How should we fix it?</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['refund_wallet', 'Refund to my wallet'],
                    ['replacement', 'Send a replacement'],
                  ] as const
                ).map(([k, label]) => (
                  <button key={k} onClick={() => setResolution(k)} className={cn('px-3 py-1.5 rounded-full border text-[0.82rem]', resolution === k ? 'bg-ink text-white border-ink' : 'border-line hover:border-ink')}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-28 self-start bg-tile p-6 space-y-3">
        <p className="text-[0.72rem] uppercase tracking-[0.08em] text-muted">Your claim</p>
        <p className="text-[0.95rem]">{order ? order.orderNumber : 'Choose an order'}</p>
        <p className="text-[0.9rem] font-light">
          {chosen.length} item{chosen.length === 1 ? '' : 's'} · {money(value)}
        </p>
        {submit.isError && <Notice tone="error">{apiError(submit.error)}</Notice>}
        <button
          onClick={() => submit.mutate()}
          disabled={!order || !chosen.length || description.trim().length < 10 || submit.isPending || uploading}
          className="btn-ink w-full"
        >
          {submit.isPending ? 'Sending…' : 'Submit claim'}
        </button>
        <p className="text-[0.78rem] text-muted font-light">Please describe the problem in at least a sentence. We reply within two working days.</p>
      </aside>
    </div>
  );
}

function History() {
  const { data = [], isLoading } = useQuery({ queryKey: ['claims-mine'], queryFn: toolsApi.claims.mine });
  if (isLoading) return <p className="text-muted">Loading…</p>;
  if (data.length === 0) return <Notice>You have not made any claims.</Notice>;
  return (
    <div className="space-y-4">
      {data.map((c) => (
        <div key={c._id} className="border border-line p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[1rem]">
                {c.claimNumber} <span className="text-muted font-light">· order {c.orderNumber}</span>
              </p>
              <p className="text-[0.8rem] text-muted">
                {formatDate(c.createdAt)} · {TYPE_LABEL[c.type]} · {c.resolution === 'replacement' ? 'Replacement' : 'Wallet refund'}
              </p>
            </div>
            <StatusBadge status={c.status === 'open' ? 'pending' : c.status} label={c.status === 'open' ? 'Being reviewed' : c.status === 'approved' ? 'Approved' : 'Not approved'} />
          </div>
          <ul className="mt-3 text-[0.88rem] font-light">
            {c.items.map((i) => (
              <li key={`${i.productId}${i.variant ?? ''}`}>
                {i.quantity} × {i.name}
              </li>
            ))}
          </ul>
          {c.status === 'approved' && c.refundAmount ? <p className="mt-2 text-[0.9rem] text-[#2f7d4f]">{money(c.refundAmount)} added to your wallet</p> : null}
          {c.adminNote && <p className="mt-2 text-[0.88rem] text-gray-600">Note from us: {c.adminNote}</p>}
        </div>
      ))}
    </div>
  );
}
