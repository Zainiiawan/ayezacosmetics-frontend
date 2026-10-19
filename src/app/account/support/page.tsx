'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AccountShell from '@/components/member/AccountShell';
import { Field, Notice, SelectField, StatusBadge } from '@/components/member/ui';
import { toolsApi, TICKET_CATEGORIES, Ticket } from '@/lib/api/toolsApi';
import { apiError } from '@/lib/api/memberApi';
import { cn, formatDate } from '@/lib/utils';

const CAT = Object.fromEntries(TICKET_CATEGORIES);
const STATUS: Record<Ticket['status'], [string, string]> = {
  open: ['pending', 'Waiting for us'],
  answered: ['approved', 'We replied'],
  closed: ['cancelled', 'Closed'],
};

export default function SupportPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['tickets-mine'], queryFn: toolsApi.tickets.mine });
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const current = data.find((t) => t._id === openId) ?? null;
  return (
    <AccountShell title="Service requests" intro="Questions about an order, a payment, your account or the partner programme. We usually reply within one working day.">
      {current ? (
        <Thread ticket={current} onBack={() => setOpenId(null)} />
      ) : creating ? (
        <NewTicket onDone={(id) => { setCreating(false); setOpenId(id); }} onCancel={() => setCreating(false)} />
      ) : (
        <div className="space-y-5">
          <button onClick={() => setCreating(true)} className="btn-ink">New request</button>
          {isLoading ? (
            <p className="text-muted">Loading…</p>
          ) : data.length === 0 ? (
            <Notice>No requests yet.</Notice>
          ) : (
            <div className="border border-line divide-y divide-line">
              {data.map((t) => (
                <button key={t._id} onClick={() => setOpenId(t._id)} className="w-full text-left p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-tile">
                  <span>
                    <span className="block text-[0.98rem]">{t.subject}</span>
                    <span className="block text-[0.8rem] text-muted">
                      {t.ticketNumber} · {CAT[t.category]} · updated {formatDate(t.lastMessageAt)}
                    </span>
                  </span>
                  <StatusBadge status={STATUS[t.status][0]} label={STATUS[t.status][1]} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </AccountShell>
  );
}

function NewTicket({ onDone, onCancel }: { onDone: (id: string) => void; onCancel: () => void }) {
  const qc = useQueryClient();
  const [category, setCategory] = useState('order');
  const [subject, setSubject] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const create = useMutation({
    mutationFn: () => toolsApi.tickets.create({ category, subject, orderNumber: orderNumber || undefined, message }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ['tickets-mine'] });
      onDone(t._id);
    },
  });
  return (
    <form
      className="max-w-xl grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate();
      }}
    >
      <SelectField label="What is it about?" options={TICKET_CATEGORIES} value={category} onChange={(e) => setCategory(e.target.value)} />
      <Field label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} required />
      {['order', 'delivery', 'payment'].includes(category) && (
        <Field label="Order number (optional)" placeholder="AZR-..." value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
      )}
      <label className="block">
        <span className="block text-[0.85rem] mb-1.5">Message</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} maxLength={3000} required className="w-full p-3 border border-line focus:outline-none focus:border-ink" />
      </label>
      {create.isError && <Notice tone="error">{apiError(create.error)}</Notice>}
      <div className="flex gap-2">
        <button type="submit" disabled={create.isPending || subject.trim().length < 4 || message.trim().length < 5} className="btn-ink">
          {create.isPending ? 'Sending…' : 'Send'}
        </button>
        <button type="button" onClick={onCancel} className="btn-line">Cancel</button>
      </div>
    </form>
  );
}

function Thread({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['tickets-mine'] });
  const reply = useMutation({ mutationFn: () => toolsApi.tickets.reply(ticket._id, message), onSuccess: () => { setMessage(''); refresh(); } });
  const close = useMutation({ mutationFn: () => toolsApi.tickets.close(ticket._id), onSuccess: refresh });
  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="text-[0.85rem] underline underline-offset-4 mb-5">Back to all requests</button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.4rem] font-light">{ticket.subject}</h2>
          <p className="text-[0.8rem] text-muted">
            {ticket.ticketNumber} · {CAT[ticket.category]}
            {ticket.orderNumber && ` · order ${ticket.orderNumber}`}
          </p>
        </div>
        <StatusBadge status={STATUS[ticket.status][0]} label={STATUS[ticket.status][1]} />
      </div>
      <div className="mt-6 space-y-3">
        {ticket.messages.map((m, i) => (
          <div key={i} className={cn('p-4 max-w-[85%]', m.from === 'team' ? 'bg-blush' : 'bg-tile ml-auto')}>
            <p className="text-[0.75rem] text-muted mb-1">
              {m.from === 'team' ? `Azeeora team${m.by ? ` (${m.by})` : ''}` : 'You'} · {formatDate(m.at)}
            </p>
            <p className="text-[0.92rem] whitespace-pre-line font-light">{m.body}</p>
          </div>
        ))}
      </div>
      {ticket.status !== 'closed' ? (
        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            reply.mutate();
          }}
        >
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={3000} placeholder="Write a reply" className="w-full p-3 border border-line focus:outline-none focus:border-ink" />
          {reply.isError && <Notice tone="error">{apiError(reply.error)}</Notice>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={!message.trim() || reply.isPending} className="btn-ink">{reply.isPending ? 'Sending…' : 'Reply'}</button>
            <button type="button" onClick={() => close.mutate()} disabled={close.isPending} className="btn-line">Close request</button>
          </div>
        </form>
      ) : (
        <p className="mt-6 text-[0.88rem] text-muted">This request is closed. Open a new one if you need more help.</p>
      )}
    </div>
  );
}
