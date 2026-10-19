'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toolsApi, CLAIM_TYPES, TICKET_CATEGORIES, Claim, Ticket } from '@/lib/api/toolsApi';
import { apiError } from '@/lib/api/memberApi';
import { formatDate, formatPrice } from '@/lib/utils';

const TYPE = Object.fromEntries(CLAIM_TYPES);
const CAT = Object.fromEntries(TICKET_CATEGORIES);
const btn = 'px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50';
const btnLine = 'px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50';
const pill = (on: boolean) => `px-3 py-1.5 rounded-full text-xs border ${on ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`;

function SupportAdmin() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params?.get('tab') === 'tickets' ? 'tickets' : 'claims';
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-gray-500 hover:text-black"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-black">Claims & service requests</h1>
          <p className="text-sm text-gray-500">Problems with delivered orders, and questions from members</p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex gap-2">
          {(['claims', 'tickets'] as const).map((k) => (
            <button key={k} onClick={() => router.replace(`/admin/support?tab=${k}`)} className={`px-4 py-2 rounded-full text-sm border ${tab === k ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`}>
              {k === 'claims' ? 'Claims and returns' : 'Service requests'}
            </button>
          ))}
        </div>
        {tab === 'claims' ? <Claims /> : <Tickets />}
      </div>
    </div>
  );
}

function Claims() {
  const [status, setStatus] = useState('open');
  const { data = [], isLoading } = useQuery({ queryKey: ['admin-claims', status], queryFn: () => toolsApi.claims.all(status || undefined) });
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[['open', 'Open'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['', 'All']].map(([k, l]) => (
          <button key={k || 'all'} onClick={() => setStatus(k)} className={pill(status === k)}>{l}</button>
        ))}
      </div>
      {isLoading ? <p className="text-gray-500">Loading…</p> : data.length === 0 ? <p className="bg-white rounded-xl p-6 text-sm text-gray-500">No claims here.</p> : data.map((c) => <ClaimCard key={c._id} claim={c} />)}
    </div>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState(String(claim.value));
  const [note, setNote] = useState('');
  const decide = useMutation({
    mutationFn: (action: 'approve' | 'reject') => toolsApi.claims.decide(claim._id, { action, refundAmount: Number(amount), note: note || undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-claims'] }),
  });
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="font-medium">{claim.claimNumber} · {TYPE[claim.type]}</p>
          <p className="text-sm text-gray-500">
            {claim.customerName} · order <Link className="underline" href={`/admin/orders?search=${claim.orderNumber}`}>{claim.orderNumber}</Link> · {formatDate(claim.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">{formatPrice(claim.value)}</p>
          <p className="text-xs text-gray-500">{claim.resolution === 'replacement' ? 'Wants a replacement' : 'Wants a wallet refund'}</p>
        </div>
      </div>
      <ul className="text-sm">
        {claim.items.map((i) => <li key={`${i.productId}${i.variant ?? ''}`}>{i.quantity} × {i.name} ({formatPrice(i.price)})</li>)}
      </ul>
      <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg p-3">{claim.description}</p>
      {claim.photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {claim.photos.map((u) => (
            <a key={u} href={u} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="Claim photo" className="w-24 h-24 object-cover rounded-lg border" />
            </a>
          ))}
        </div>
      )}
      {claim.status === 'open' ? (
        <div className="flex flex-wrap items-end gap-2 pt-2 border-t">
          {claim.resolution === 'refund_wallet' && (
            <label className="text-sm">
              <span className="block text-xs text-gray-500 mb-1">Refund to wallet (max {formatPrice(claim.value)})</span>
              <input type="number" min={0} max={claim.value} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-36 border border-gray-300 rounded-lg px-3 py-2" />
            </label>
          )}
          <label className="text-sm flex-1 min-w-[12rem]">
            <span className="block text-xs text-gray-500 mb-1">Note to the customer (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </label>
          <button disabled={decide.isPending} onClick={() => decide.mutate('approve')} className={btn}>Approve</button>
          <button disabled={decide.isPending} onClick={() => window.confirm('Reject this claim?') && decide.mutate('reject')} className={`${btnLine} text-red-600`}>Reject</button>
          {decide.isError && <p className="w-full text-sm text-red-600">{apiError(decide.error)}</p>}
        </div>
      ) : (
        <p className="text-sm text-gray-600 border-t pt-2">
          {claim.status === 'approved' ? `Approved${claim.refundAmount ? `, ${formatPrice(claim.refundAmount)} refunded to wallet` : ''}` : 'Rejected'}
          {claim.adminNote ? ` · ${claim.adminNote}` : ''}
        </p>
      )}
    </div>
  );
}

function Tickets() {
  const [status, setStatus] = useState('open');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const { data = [], isLoading } = useQuery({ queryKey: ['admin-tickets', status], queryFn: () => toolsApi.tickets.all(status || undefined) });
  // keep the open thread on screen even when a reply moves it to another status filter
  const current = data.find((t) => t._id === selected?._id) ?? selected;
  return (
    <div className="grid lg:grid-cols-[22rem_1fr] gap-4 items-start">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {[['open', 'Waiting for us'], ['answered', 'Replied'], ['closed', 'Closed'], ['', 'All']].map(([k, l]) => (
            <button key={k || 'all'} onClick={() => setStatus(k)} className={pill(status === k)}>{l}</button>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm divide-y">
          {isLoading ? <p className="p-4 text-sm text-gray-500">Loading…</p> : data.length === 0 ? <p className="p-4 text-sm text-gray-500">No requests.</p> : data.map((t) => (
            <button key={t._id} onClick={() => setSelected(t)} className={`w-full text-left p-4 hover:bg-gray-50 ${selected?._id === t._id ? 'bg-gray-50' : ''}`}>
              <p className="font-medium text-sm">{t.subject}</p>
              <p className="text-xs text-gray-500">{t.ticketNumber} · {CAT[t.category]} · {t.customerName} · {formatDate(t.lastMessageAt)}</p>
            </button>
          ))}
        </div>
      </div>
      {current ? <TicketThread ticket={current} onChange={setSelected} /> : <p className="bg-white rounded-xl p-6 text-sm text-gray-500">Choose a request to read and reply.</p>}
    </div>
  );
}

function TicketThread({ ticket, onChange }: { ticket: Ticket; onChange: (t: Ticket) => void }) {
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const refresh = (t: Ticket) => {
    onChange(t);
    qc.invalidateQueries({ queryKey: ['admin-tickets'] });
  };
  const reply = useMutation({ mutationFn: () => toolsApi.tickets.reply(ticket._id, message), onSuccess: (t) => { setMessage(''); refresh(t); } });
  const close = useMutation({ mutationFn: () => toolsApi.tickets.close(ticket._id), onSuccess: refresh });
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
      <div>
        <p className="font-medium">{ticket.subject}</p>
        <p className="text-sm text-gray-500">
          {ticket.ticketNumber} · {CAT[ticket.category]} · {ticket.customerName} ({ticket.customerEmail}){ticket.orderNumber ? ` · order ${ticket.orderNumber}` : ''}
        </p>
      </div>
      <div className="space-y-2">
        {ticket.messages.map((m, i) => (
          <div key={i} className={`rounded-lg p-3 text-sm max-w-[85%] ${m.from === 'team' ? 'bg-gray-900 text-white ml-auto' : 'bg-gray-100'}`}>
            <p className={`text-xs mb-1 ${m.from === 'team' ? 'text-gray-300' : 'text-gray-500'}`}>{m.from === 'team' ? `Team${m.by ? ` (${m.by})` : ''}` : ticket.customerName} · {formatDate(m.at)}</p>
            <p className="whitespace-pre-line">{m.body}</p>
          </div>
        ))}
      </div>
      {ticket.status !== 'closed' ? (
        <form onSubmit={(e) => { e.preventDefault(); reply.mutate(); }} className="space-y-2">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Reply to the member" />
          {reply.isError && <p className="text-sm text-red-600">{apiError(reply.error)}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={!message.trim() || reply.isPending} className={btn}>Send reply</button>
            <button type="button" onClick={() => close.mutate()} disabled={close.isPending} className={btnLine}>Close request</button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500">This request is closed.</p>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SupportAdmin />
    </Suspense>
  );
}
