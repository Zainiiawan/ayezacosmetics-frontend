'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addItem } from '@/store/slices/cartSlice';
import { cartApi } from '@/lib/api/cartApi';
import { toolsApi } from '@/lib/api/toolsApi';
import { apiError } from '@/lib/api/memberApi';

// The bag page swaps layouts when it goes from empty to filled, which remounts this form;
// the last message is kept here so it is still shown after the switch.
let lastMessage: { ok: boolean; text: string } | null = null;

/** Add to the bag by product code, the fast way partners reorder from the catalogue. */
export default function QuickOrder() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [code, setCode] = useState('');
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsgState] = useState<{ ok: boolean; text: string } | null>(() => {
    const m = lastMessage;
    lastMessage = null;
    return m;
  });
  const setMsg = (m: { ok: boolean; text: string } | null) => {
    lastMessage = m;
    setMsgState(m);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const p = await toolsApi.quickOrder(code);
      if (p.isComingSoon || p.stock <= 0) throw new Error(`${p.name} is not available right now`);
      if (isAuthenticated) await cartApi.addItem({ productId: p._id, quantity: qty, variant: p.variant });
      dispatch(addItem({ product: { _id: p._id, name: p.name, slug: p.slug, images: p.image ? [{ url: p.image }] : [], basePrice: p.basePrice }, variant: p.variant, quantity: qty, price: p.price, total: p.price * qty }));
      setMsg({ ok: true, text: `Added ${qty} × ${p.name}${p.variantLabel ? ` (${p.variantLabel})` : ''}` });
      setCode('');
      setQty(1);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error && !('response' in err) ? err.message : apiError(err, 'No product with that code') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-line p-4 sm:p-5">
      <p className="text-[0.75rem] uppercase tracking-[0.08em] text-muted">Quick order by product code</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Product code"
          aria-label="Product code"
          maxLength={40}
          className="flex-1 min-w-[10rem] h-11 px-3 border border-line focus:outline-none focus:border-ink"
        />
        <input
          type="number"
          min={1}
          max={500}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
          aria-label="Quantity"
          className="w-20 h-11 px-3 border border-line focus:outline-none focus:border-ink"
        />
        <button type="submit" disabled={busy || !code.trim()} className="btn-ink h-11">
          {busy ? 'Adding…' : 'Add'}
        </button>
      </div>
      {msg && <p className={`mt-2 text-[0.85rem] ${msg.ok ? 'text-[#2f7d4f]' : 'text-sale'}`} role="status">{msg.text}</p>}
    </form>
  );
}
