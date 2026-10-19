'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { memberApi } from '@/lib/api/memberApi';
import { Notice, Stat, money } from './ui';

const monthLabel = (p: string) => new Date(`${p}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

/** Earnings and savings for one month. Shared by the partner dashboard and My earnings. */
export default function EarningsView({ partner }: { partner: boolean }) {
  const [period, setPeriod] = useState<string | undefined>(undefined);
  const { data, isLoading } = useQuery({ queryKey: ['member-earnings', period], queryFn: () => memberApi.earnings(period) });
  if (isLoading || !data) return <p className="text-muted">Loading…</p>;
  const current = data.period === new Date().toISOString().slice(0, 7);
  const rows: [string, number, string?][] = [
    ...(partner
      ? ([
          ['Referral commission, released', data.commission.available],
          ['Referral commission, on its way', data.commission.pending, 'Released when the orders are delivered'],
        ] as [string, number, string?][])
      : []),
    ['Cashback, released', data.cashback.available],
    ['Cashback, on its way', data.cashback.pending],
    ['Claim refunds', data.claimRefunds],
    ['Adjustments', data.adjustments],
    ['Reversals (cancelled or returned orders)', data.reversals],
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-[0.85rem] text-muted" htmlFor="period">Period</label>
        <select id="period" value={data.period} onChange={(e) => setPeriod(e.target.value)} className="h-10 px-3 border border-line bg-white text-[0.9rem]">
          {data.periods.map((p) => (
            <option key={p} value={p}>
              {monthLabel(p)}
              {p === new Date().toISOString().slice(0, 7) ? ' (current)' : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat accent label={current ? 'Estimated this month' : 'Earned'} value={money(data.estimated)} sub={current ? 'Some of it is released as orders are delivered' : monthLabel(data.period)} />
        {partner && <Stat label="Commission" value={money(data.commission.available + data.commission.pending)} />}
        <Stat label="Cashback" value={money(data.cashback.available + data.cashback.pending)} />
        <Stat label="Immediate discounts" value={money(data.immediateDiscounts)} sub="Saved on your own orders" />
        {!partner && <Stat label="Withdrawn" value={money(data.withdrawn)} />}
      </div>
      {rows.every(([, v]) => !v) ? (
        <Notice>Nothing earned in {monthLabel(data.period)} yet.</Notice>
      ) : (
        <div className="border border-line divide-y divide-line">
          {rows
            .filter(([, v]) => v)
            .map(([label, v, hint]) => (
              <div key={label} className="flex justify-between gap-4 px-5 py-3.5 text-[0.92rem]">
                <span className="font-light">
                  {label}
                  {hint && <span className="block text-[0.78rem] text-muted">{hint}</span>}
                </span>
                <span className={v < 0 ? 'text-sale' : ''}>{money(v)}</span>
              </div>
            ))}
        </div>
      )}
      {partner && data.withdrawn > 0 && <p className="text-[0.85rem] text-muted">Paid out to you this month: {money(data.withdrawn)}</p>}
    </div>
  );
}
