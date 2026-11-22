'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { memberApi, apiError, AdminMember, MemberSettings } from '@/lib/api/memberApi';
import { GenealogyTree, MonthSelect } from '@/components/member/Network';
import ReallocateButton from '@/components/member/ReallocateButton';
import { formatDate, formatPrice } from '@/lib/utils';

const TABS = [
  ['partners', 'Brand Partners'],
  ['business', 'Wholesale'],
  ['kyc', 'Payout details'],
  ['withdrawals', 'Withdrawals'],
  ['commissions', 'Commissions'],
  ['network', 'Network tree'],
  ['bonus', 'Performance bonus'],
  ['settings', 'Programme settings'],
] as const;
type Tab = (typeof TABS)[number][0];

const money = (n: number) => formatPrice(Math.round(n ?? 0));

const badge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  requested: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-700',
  available: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};
const Badge = ({ s }: { s?: string }) => (s ? <span className={`text-xs px-2 py-1 rounded-full capitalize ${badge[s] ?? 'bg-gray-100'}`}>{s}</span> : null);

function MembersAdmin() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = (TABS.find(([k]) => k === params?.get('tab'))?.[0] ?? 'partners') as Tab;
  const { data: overview } = useQuery({ queryKey: ['members-overview'], queryFn: memberApi.admin.overview, refetchInterval: 30000 });

  const counts: Partial<Record<Tab, number>> = {
    partners: overview?.partnerPending,
    business: overview?.businessPending,
    kyc: overview?.kycPending,
    withdrawals: overview?.withdrawalsRequested,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-black">Members</h1>
            <p className="text-sm text-gray-500">Brand Partners, wholesale accounts, wallets and payouts</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {overview && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              ['Active partners', overview.partners],
              ['Wholesale accounts', overview.businesses],
              ['Commission pending', money(overview.commissionPending)],
              ['Wallet balances owed', money(overview.walletLiability)],
              ['Withdrawals to pay', `${overview.withdrawalsRequested} · ${money(overview.withdrawalsRequestedAmount)}`],
            ].map(([l, v]) => (
              <div key={l as string} className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">{l}</p>
                <p className="mt-1 text-xl font-semibold">{v}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {TABS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => router.replace(`/admin/members?tab=${k}`)}
              className={`px-4 py-2 rounded-full text-sm border ${tab === k ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-400'}`}
            >
              {label}
              {counts[k] ? <span className="ml-2 inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-rose text-white text-xs">{counts[k]}</span> : null}
            </button>
          ))}
        </div>

        {tab === 'partners' && <Applications kind="partner" />}
        {tab === 'business' && <Applications kind="business" />}
        {tab === 'kyc' && <Applications kind="kyc" />}
        {tab === 'withdrawals' && <Withdrawals />}
        {tab === 'commissions' && <Commissions />}
        {tab === 'network' && <div className="bg-white rounded-xl p-6 shadow-sm"><GenealogyTree adminSearch /></div>}
        {tab === 'bonus' && <Bonus />}
        {tab === 'settings' && <Settings />}
      </div>
    </div>
  );
}

function Applications({ kind }: { kind: 'partner' | 'business' | 'kyc' }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [open, setOpen] = useState<string | null>(null);
  const { data = [], isLoading } = useQuery({ queryKey: ['members-list', kind, status], queryFn: () => memberApi.admin.list(kind, status || undefined) });
  const decide = useMutation({
    mutationFn: (v: { id: string; action: string; note?: string }) => memberApi.admin.decide(v.id, kind, v.action, v.note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members-list'] });
      qc.invalidateQueries({ queryKey: ['members-overview'] });
    },
  });
  const act = (id: string, action: string) => {
    const needsNote = action === 'reject' || action === 'suspend';
    const note = needsNote ? window.prompt(`Reason (shown to the member)`) ?? undefined : undefined;
    if (needsNote && note === undefined) return;
    decide.mutate({ id, action, note });
  };
  const rec = (m: AdminMember) => (kind === 'business' ? m.business : kind === 'kyc' ? m.kyc : m.partner);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-4 border-b">
        {['pending', 'approved', 'rejected', ...(kind === 'kyc' ? [] : ['suspended']), ''].map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-sm ${status === s ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
            {s ? s[0].toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>
      {decide.isError && <p className="px-4 py-2 text-sm text-red-600">{apiError(decide.error)}</p>}
      {isLoading ? (
        <p className="p-8 text-center text-gray-500">Loading…</p>
      ) : data.length === 0 ? (
        <p className="p-8 text-center text-gray-500">Nothing here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">{kind === 'business' ? 'Business' : kind === 'kyc' ? 'Payout account' : 'Details'}</th>
                <th className="px-4 py-3 font-medium">{kind === 'partner' ? 'Sponsor' : 'Submitted'}</th>
                {kind === 'partner' && <th className="px-4 py-3 font-medium text-right">Wallet</th>}
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((m) => {
                const r = rec(m)!;
                return (
                  <tr key={m._id} className="border-b align-top hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{m.firstName} {m.lastName}</p>
                      <p className="text-gray-500">{m.email}</p>
                      {m.memberCode && <p className="text-gray-500 font-mono text-xs">{m.memberCode}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {kind === 'partner' && (
                        <>
                          <p>{m.partner?.city} · {m.partner?.phone}</p>
                          <p className="text-gray-500 font-mono text-xs">CNIC {m.partner?.cnic}</p>
                          {open === m._id && (
                            <div className="mt-2 text-gray-600 space-y-1">
                              {m.partner?.whatsapp && <p>WhatsApp {m.partner.whatsapp}</p>}
                              {m.partner?.address && <p>{m.partner.address}</p>}
                              {m.partner?.dateOfBirth && <p>Born {m.partner.dateOfBirth}</p>}
                              {m.partner?.experience && <p className="italic">“{m.partner.experience}”</p>}
                              <p>BV this month {m.monthlyBV} · team BV {m.referredBV}</p>
                            </div>
                          )}
                          <button onClick={() => setOpen(open === m._id ? null : m._id)} className="text-xs text-gray-500 underline mt-1">
                            {open === m._id ? 'Less' : 'More'}
                          </button>
                        </>
                      )}
                      {kind === 'business' && (
                        <>
                          <p className="font-medium">{m.business?.companyName}</p>
                          <p className="text-gray-500 capitalize">{m.business?.businessType?.replace('_', ' ')} · {m.business?.city}</p>
                          <p className="text-gray-500">{m.business?.contactPhone} · {m.business?.address}</p>
                          {m.business?.ntn && <p className="text-gray-500">NTN {m.business.ntn}</p>}
                          {m.business?.monthlyVolume && <p className="text-gray-500">Expects {m.business.monthlyVolume}</p>}
                          {m.business?.notes && <p className="italic text-gray-600">“{m.business.notes}”</p>}
                        </>
                      )}
                      {kind === 'kyc' && (
                        <>
                          <p>{m.kyc?.accountTitle}</p>
                          <p className="text-gray-500 capitalize">{m.kyc?.method === 'bank' ? m.kyc?.bankName : m.kyc?.method} · <span className="font-mono">{m.kyc?.accountNumber}</span></p>
                          <p className="text-gray-500 font-mono text-xs">CNIC {m.kyc?.cnic}</p>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {kind === 'partner' ? (m.sponsor ? `${m.sponsor.name} (${m.sponsor.memberCode})` : '—') : formatDate(('appliedAt' in r && r.appliedAt) || ('submittedAt' in r && r.submittedAt) || m.createdAt)}
                    </td>
                    {kind === 'partner' && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {m.wallet ? (
                          <>
                            <p>{money(m.wallet.available)}</p>
                            {m.wallet.pending > 0 && <p className="text-xs text-gray-500">+{money(m.wallet.pending)} pending</p>}
                          </>
                        ) : null}
                      </td>
                    )}
                    <td className="px-4 py-3"><Badge s={r.status} />{r.note && <p className="text-xs text-gray-500 mt-1 max-w-[180px]">{r.note}</p>}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                      {(r.status === 'pending' || r.status === 'rejected') && (
                        <button onClick={() => act(m._id, 'approve')} className="px-3 py-1.5 rounded-lg bg-black text-white text-xs">Approve</button>
                      )}
                      {r.status === 'pending' && (
                        <button onClick={() => act(m._id, 'reject')} className="px-3 py-1.5 rounded-lg border text-xs text-red-600">Reject</button>
                      )}
                      {kind !== 'kyc' && r.status === 'approved' && (
                        <button onClick={() => act(m._id, 'suspend')} className="px-3 py-1.5 rounded-lg border text-xs text-red-600">Suspend</button>
                      )}
                      {kind !== 'kyc' && r.status === 'suspended' && (
                        <button onClick={() => act(m._id, 'reinstate')} className="px-3 py-1.5 rounded-lg border text-xs">Reinstate</button>
                      )}
                      {kind === 'partner' && r.status === 'approved' && <AdjustButton member={m} />}
                      {kind !== 'kyc' && <ReallocateButton userId={m._id} name={`${m.firstName} ${m.lastName}`} invalidate={['members-list']} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdjustButton({ member }: { member: AdminMember }) {
  const qc = useQueryClient();
  const adjust = useMutation({
    mutationFn: (v: { amount: number; note: string }) => memberApi.admin.adjust(member._id, v.amount, v.note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members-list'] }),
    onError: (e) => window.alert(apiError(e)),
  });
  return (
    <button
      onClick={() => {
        const a = window.prompt(`Adjust ${member.firstName}'s wallet. Positive adds, negative deducts (Rs):`);
        if (!a) return;
        const amount = Number(a);
        if (!Number.isFinite(amount) || amount === 0) return window.alert('Enter a number');
        const note = window.prompt('Reason (shown to the partner)');
        if (!note) return;
        adjust.mutate({ amount, note });
      }}
      className="px-3 py-1.5 rounded-lg border text-xs"
    >
      Adjust wallet
    </button>
  );
}

function Withdrawals() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('requested');
  const { data = [], isLoading } = useQuery({ queryKey: ['admin-withdrawals', status], queryFn: () => memberApi.admin.withdrawals(status || undefined) });
  const payout = useMutation({
    mutationFn: (v: { id: string; action: 'paid' | 'reject'; reference?: string; note?: string }) => memberApi.admin.payout(v.id, v.action, v.reference, v.note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      qc.invalidateQueries({ queryKey: ['members-overview'] });
    },
  });
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-wrap gap-2 p-4 border-b">
        {[['requested', 'To pay'], ['paid', 'Paid'], ['rejected', 'Returned'], ['', 'All']].map(([s, l]) => (
          <button key={l} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-sm ${status === s ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>{l}</button>
        ))}
      </div>
      {payout.isError && <p className="px-4 py-2 text-sm text-red-600">{apiError(payout.error)}</p>}
      {isLoading ? (
        <p className="p-8 text-center text-gray-500">Loading…</p>
      ) : data.length === 0 ? (
        <p className="p-8 text-center text-gray-500">No withdrawals.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium">Partner</th>
                <th className="px-4 py-3 font-medium">Send to</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((w) => (
                <tr key={w._id} className="border-b align-top">
                  <td className="px-4 py-3 text-gray-600">{formatDate(w.createdAt)}</td>
                  <td className="px-4 py-3">{w.name}<p className="text-xs text-gray-500 font-mono">{w.memberCode}</p></td>
                  <td className="px-4 py-3">
                    <p>{w.accountTitle}</p>
                    <p className="text-gray-500 capitalize">{w.method === 'bank' ? w.bankName : w.method} · <span className="font-mono">{w.accountNumber}</span></p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{money(w.amount)}</td>
                  <td className="px-4 py-3"><Badge s={w.status} />{w.reference && <p className="text-xs text-gray-500 mt-1">Ref {w.reference}</p>}{w.note && <p className="text-xs text-gray-500 mt-1">{w.note}</p>}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                    {w.status === 'requested' && (
                      <>
                        <button
                          onClick={() => {
                            const reference = window.prompt('Transfer reference / transaction ID');
                            if (reference) payout.mutate({ id: w._id, action: 'paid', reference });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-black text-white text-xs"
                        >
                          Mark paid
                        </button>
                        <button
                          onClick={() => {
                            const note = window.prompt('Why is it being returned? (shown to the partner)');
                            if (note !== null) payout.mutate({ id: w._id, action: 'reject', note });
                          }}
                          className="px-3 py-1.5 rounded-lg border text-xs text-red-600"
                        >
                          Return to wallet
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Commissions() {
  const [status, setStatus] = useState('');
  const { data = [], isLoading } = useQuery({ queryKey: ['admin-commissions', status], queryFn: () => memberApi.admin.commissions(status || undefined) });
  const total = data.reduce((s, e) => s + (e.status !== 'cancelled' ? e.amount : 0), 0);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-4 border-b">
        {[['', 'All'], ['pending', 'Pending'], ['available', 'Released'], ['cancelled', 'Cancelled']].map(([s, l]) => (
          <button key={l} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-sm ${status === s ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>{l}</button>
        ))}
        <span className="ml-auto text-sm text-gray-600">Total shown: <b>{money(total)}</b></span>
      </div>
      {isLoading ? (
        <p className="p-8 text-center text-gray-500">Loading…</p>
      ) : data.length === 0 ? (
        <p className="p-8 text-center text-gray-500">No commissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Partner</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e._id} className="border-b">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                  <td className="px-4 py-3">{e.partner?.name}<p className="text-xs text-gray-500 font-mono">{e.partner?.memberCode}</p></td>
                  <td className="px-4 py-3 font-mono text-xs">{e.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{e.note}</td>
                  <td className={`px-4 py-3 text-right ${e.amount < 0 ? 'text-red-600' : ''}`}>{money(e.amount)}</td>
                  <td className="px-4 py-3"><Badge s={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Defined at module level so inputs keep focus while typing
function L({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}

function Settings() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['member-settings'], queryFn: memberApi.admin.settings });
  const [edited, setForm] = useState<MemberSettings | null>(null);
  const form = edited ?? data ?? null;
  const save = useMutation({
    mutationFn: (s: MemberSettings) => memberApi.admin.saveSettings(s),
    onSuccess: (s) => {
      setForm(s);
      qc.setQueryData(['member-settings'], s);
      qc.invalidateQueries({ queryKey: ['programme'] });
    },
  });
  const close = useMutation({ mutationFn: memberApi.admin.closeMonth });
  if (!form) return <p className="text-gray-500">Loading…</p>;
  const num = (k: keyof MemberSettings) => ({
    value: String(form[k] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: Number(e.target.value) }),
    type: 'number',
    className: 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm',
  });
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form
        className="bg-white rounded-xl p-6 shadow-sm space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(form);
        }}
      >
        <h3 className="font-semibold">Brand Partners</h3>
        <div>
          <span className="block text-sm font-medium mb-1">Commission by level (%)</span>
          <p className="text-xs text-gray-500 mb-2">
            Paid on every order in a partner&apos;s network once it is delivered. Level 1 is the person who introduced the buyer, level 2 is their sponsor, and so on.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            {form.levelCommissionPct.map((pct, i) => (
              <label key={i} className="text-xs text-gray-600">
                Level {i + 1}
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={pct}
                  onChange={(e) => setForm({ ...form, levelCommissionPct: form.levelCommissionPct.map((x, j) => (j === i ? Number(e.target.value) : x)) })}
                  className="block w-20 mt-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                />
              </label>
            ))}
            {form.levelCommissionPct.length < 10 && (
              <button type="button" onClick={() => setForm({ ...form, levelCommissionPct: [...form.levelCommissionPct, 1] })} className="text-sm underline pb-2">
                Add level
              </button>
            )}
            {form.levelCommissionPct.length > 1 && (
              <button type="button" onClick={() => setForm({ ...form, levelCommissionPct: form.levelCommissionPct.slice(0, -1) })} className="text-sm text-red-500 pb-2">
                Remove last
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Total across levels: {form.levelCommissionPct.reduce((a, b) => a + b, 0)}% (at most 60%).</p>
        </div>
        <L label="Team points depth (levels)" hint="How many levels up a purchase adds team BP/BV.">
          <input {...num('maxTeamLevels')} min={1} max={20} />
        </L>
        <L label="Who can earn" hint="Team BP/BV, commission and the performance bonus. Every member always gets their own personal points.">
          <select
            value={form.earnerEligibility}
            onChange={(e) => setForm({ ...form, earnerEligibility: e.target.value as MemberSettings['earnerEligibility'] })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">Every registered member</option>
            <option value="partners">Approved Brand Partners only</option>
          </select>
        </L>
        <L label="Own BV needed each month to earn commission" hint="0 = no minimum. Team points still count for everyone.">
          <input {...num('minPersonalBVToEarn')} min={0} />
        </L>
        <div>
          <span className="block text-sm font-medium mb-1">Partner discount by monthly points</span>
          <div className="space-y-2">
            {form.partnerDiscountTiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span>From</span>
                <input
                  type="number"
                  value={t.minBV}
                  onChange={(e) => setForm({ ...form, partnerDiscountTiers: form.partnerDiscountTiers.map((x, j) => (j === i ? { ...x, minBV: Number(e.target.value) } : x)) })}
                  className="w-24 border border-gray-300 rounded-lg px-2 py-1.5"
                />
                <span>BV:</span>
                <input
                  type="number"
                  value={t.pct}
                  onChange={(e) => setForm({ ...form, partnerDiscountTiers: form.partnerDiscountTiers.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x)) })}
                  className="w-20 border border-gray-300 rounded-lg px-2 py-1.5"
                />
                <span>% off</span>
                {form.partnerDiscountTiers.length > 1 && (
                  <button type="button" onClick={() => setForm({ ...form, partnerDiscountTiers: form.partnerDiscountTiers.filter((_, j) => j !== i) })} className="text-red-500 text-xs ml-2">
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const last = form.partnerDiscountTiers[form.partnerDiscountTiers.length - 1];
                setForm({ ...form, partnerDiscountTiers: [...form.partnerDiscountTiers, { minBV: (last?.minBV ?? 0) + 100, pct: (last?.pct ?? 20) + 5 }] });
              }}
              className="text-sm underline"
            >
              Add a tier
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <L label="Rupees per 1 BP" hint="When a product has no BP of its own (price ÷ this).">
            <input {...num('rsPerBP')} />
          </L>
          <L label="Rupees per 1 BV" hint="When a product has no BV of its own (price ÷ this).">
            <input {...num('rsPerBV')} />
          </L>
        </div>
        <L label="Minimum withdrawal (Rs)">
          <input {...num('minWithdrawal')} />
        </L>

        <h3 className="font-semibold pt-4 border-t">Customer perks</h3>
        <div className="grid grid-cols-2 gap-3">
          <L label="Welcome discount (%)" hint="First order of a customer who came through a partner. 0 turns it off.">
            <input {...num('welcomeDiscountPct')} step="0.5" />
          </L>
          <L label="Cashback (%)" hint="Added to a signed-in customer's wallet when the order is delivered. 0 turns it off.">
            <input {...num('cashbackPct')} step="0.5" />
          </L>
        </div>
        <L label="Claim window (days after delivery)">
          <input {...num('claimWindowDays')} />
        </L>

        <h3 className="font-semibold pt-4 border-t">Titles</h3>
        <p className="text-xs text-gray-500 -mt-3">Worked out each month. Group BV is the partner&apos;s own BV plus the BV of their whole network below them.</p>
        <div className="space-y-2">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-2 text-xs text-gray-500">
            <span>Title</span>
            <span>Own BV</span>
            <span>Group BV</span>
            <span>Partners introduced</span>
            <span />
          </div>
          {form.titles.map((t, i) => {
            const set = (patch: Partial<typeof t>) => setForm({ ...form, titles: form.titles.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
            return (
              <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-2 items-center text-sm">
                <input value={t.name} onChange={(e) => set({ name: e.target.value })} className="border border-gray-300 rounded-lg px-2 py-1.5" />
                <input type="number" value={t.minPersonalBV} onChange={(e) => set({ minPersonalBV: Number(e.target.value) })} className="border border-gray-300 rounded-lg px-2 py-1.5" />
                <input type="number" value={t.minGroupBV} onChange={(e) => set({ minGroupBV: Number(e.target.value) })} className="border border-gray-300 rounded-lg px-2 py-1.5" />
                <input type="number" value={t.minRecruits} onChange={(e) => set({ minRecruits: Number(e.target.value) })} className="border border-gray-300 rounded-lg px-2 py-1.5" />
                {form.titles.length > 1 ? (
                  <button type="button" onClick={() => setForm({ ...form, titles: form.titles.filter((_, j) => j !== i) })} className="text-red-500 text-xs">
                    Remove
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => {
              const last = form.titles[form.titles.length - 1];
              setForm({ ...form, titles: [...form.titles, { name: 'New title', minPersonalBV: last?.minPersonalBV ?? 0, minGroupBV: (last?.minGroupBV ?? 0) + 1000, minRecruits: (last?.minRecruits ?? 0) + 2 }] });
            }}
            className="text-sm underline"
          >
            Add a title
          </button>
        </div>

        <h3 className="font-semibold pt-4 border-t">Performance bonus</h3>
        <p className="text-xs text-gray-500 -mt-3">
          Paid when you close the month (or from the Performance bonus tab). Each partner earns their tier % on their group BV, less what partners directly below them earn on
          their own groups. Bonus in Rs = tier % × BV × Rs per BV.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.performanceBonus.enabled} onChange={(e) => setForm({ ...form, performanceBonus: { ...form.performanceBonus, enabled: e.target.checked } })} />
          Pay a monthly performance bonus
        </label>
        <div className="grid grid-cols-2 gap-3">
          <L label="Rs per 1 BV of bonus">
            <input type="number" min={0} value={form.performanceBonus.rsPerBV} onChange={(e) => setForm({ ...form, performanceBonus: { ...form.performanceBonus, rsPerBV: Number(e.target.value) } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </L>
          <L label="Own BV needed to qualify">
            <input type="number" min={0} value={form.performanceBonus.minPersonalBV} onChange={(e) => setForm({ ...form, performanceBonus: { ...form.performanceBonus, minPersonalBV: Number(e.target.value) } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </L>
        </div>
        <div className="space-y-2">
          {form.performanceBonus.tiers.map((t, i) => {
            const setTier = (patch: Partial<typeof t>) =>
              setForm({ ...form, performanceBonus: { ...form.performanceBonus, tiers: form.performanceBonus.tiers.map((x, j) => (j === i ? { ...x, ...patch } : x)) } });
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span>From</span>
                <input type="number" value={t.minGroupBV} onChange={(e) => setTier({ minGroupBV: Number(e.target.value) })} className="w-24 border border-gray-300 rounded-lg px-2 py-1.5" />
                <span>group BV:</span>
                <input type="number" value={t.pct} onChange={(e) => setTier({ pct: Number(e.target.value) })} className="w-20 border border-gray-300 rounded-lg px-2 py-1.5" />
                <span>%</span>
                <button type="button" onClick={() => setForm({ ...form, performanceBonus: { ...form.performanceBonus, tiers: form.performanceBonus.tiers.filter((_, j) => j !== i) } })} className="text-red-500 text-xs ml-2">
                  Remove
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => {
              const last = form.performanceBonus.tiers[form.performanceBonus.tiers.length - 1];
              setForm({ ...form, performanceBonus: { ...form.performanceBonus, tiers: [...form.performanceBonus.tiers, { minGroupBV: (last?.minGroupBV ?? 0) + 1000, pct: (last?.pct ?? 0) + 3 }] } });
            }}
            className="text-sm underline"
          >
            Add a tier
          </button>
        </div>

        <h3 className="font-semibold pt-4 border-t">Wholesale</h3>
        <L label="Default wholesale discount (%)" hint="For products without their own wholesale price.">
          <input {...num('wholesaleDefaultDiscountPct')} />
        </L>
        <L label="Default minimum quantity per product">
          <input {...num('wholesaleDefaultMinQty')} />
        </L>

        <h3 className="font-semibold pt-4 border-t">Loyalty points</h3>
        <div className="grid grid-cols-3 gap-3">
          <L label="Rs spent per point"><input {...num('loyaltyRsPerPoint')} /></L>
          <L label="Point value (Rs)"><input {...num('pointValueRs')} step="0.1" /></L>
          <L label="Min to redeem"><input {...num('minRedeemPoints')} /></L>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.couponsForMembers} onChange={(e) => setForm({ ...form, couponsForMembers: e.target.checked })} />
          Allow coupons on top of partner and wholesale prices
        </label>
        {save.isError && <p className="text-sm text-red-600">{apiError(save.error)}</p>}
        {save.isSuccess && <p className="text-sm text-green-700">Saved.</p>}
        <button type="submit" disabled={save.isPending} className="px-5 py-2.5 rounded-lg bg-black text-white text-sm">{save.isPending ? 'Saving…' : 'Save settings'}</button>
      </form>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 self-start">
        <h3 className="font-semibold">Month end</h3>
        <p className="text-sm text-gray-600">
          Closing the month saves each member&apos;s points (BV) for the month and starts the new month at zero, which resets partner discounts to the first tier.
          Do this once, on the first day of the new month.
        </p>
        {close.isError && <p className="text-sm text-red-600">{apiError(close.error)}</p>}
        {close.isSuccess && <p className="text-sm text-green-700">Closed {close.data.period} for {close.data.members} members.</p>}
        <button
          onClick={() => {
            if (window.confirm('Close this month now? Monthly points go back to zero for everyone.')) close.mutate();
          }}
          disabled={close.isPending}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm"
        >
          Close the month
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MembersAdmin />
    </Suspense>
  );
}


function Bonus() {
  const qc = useQueryClient();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { data, isLoading } = useQuery({ queryKey: ['admin-bonus', month], queryFn: () => memberApi.admin.bonus(month) });
  const pay = useMutation({
    mutationFn: () => memberApi.admin.payBonus(month),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-bonus', month] }),
  });
  const unpaid = data?.lines.filter((l) => !l.paid) ?? [];
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Performance bonus</h3>
          <p className="text-xs text-gray-500">A preview from this month&apos;s points; nothing is paid until you press Pay. Each partner can be paid once per month.</p>
        </div>
        <MonthSelect value={month} onChange={setMonth} />
      </div>
      {isLoading || !data ? (
        <p className="text-gray-500">Loading…</p>
      ) : !data.settings.enabled ? (
        <p className="text-sm text-amber-700">The performance bonus is switched off in Programme settings.</p>
      ) : data.lines.length === 0 ? (
        <p className="text-sm text-gray-500">No partner reaches a bonus tier for this month yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Partner</th>
                  <th className="px-3 py-2 font-medium text-right">Own BV</th>
                  <th className="px-3 py-2 font-medium text-right">Group BV</th>
                  <th className="px-3 py-2 font-medium text-right">Tier</th>
                  <th className="px-3 py-2 font-medium text-right">Partners below</th>
                  <th className="px-3 py-2 font-medium text-right">Bonus</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.lines.map((l) => (
                  <tr key={l.user} className="border-t">
                    <td className="px-3 py-2">
                      {l.name}
                      {l.memberCode && <span className="block text-xs text-gray-500">{l.memberCode}</span>}
                    </td>
                    <td className="px-3 py-2 text-right">{l.personalBV.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{l.groupBV.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{l.pct}%</td>
                    <td className="px-3 py-2 text-right">{l.legs.length}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatPrice(l.amount)}</td>
                    <td className="px-3 py-2">{l.paid ? <span className="text-green-700">Paid</span> : <span className="text-gray-500">Not paid</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm">
              Total {formatPrice(data.total)}, {unpaid.length} still to pay ({formatPrice(unpaid.reduce((s, l) => s + l.amount, 0))}).
            </p>
            <button
              type="button"
              disabled={!unpaid.length || pay.isPending}
              onClick={() => window.confirm(`Pay ${unpaid.length} partners for ${month} into their wallets?`) && pay.mutate()}
              className="px-5 py-2.5 rounded-lg bg-black text-white text-sm disabled:opacity-40"
            >
              {pay.isPending ? 'Paying…' : 'Pay into wallets'}
            </button>
          </div>
          {pay.isError && <p className="text-sm text-red-600">{apiError(pay.error)}</p>}
          {pay.isSuccess && <p className="text-sm text-green-700">Paid {pay.data.paid} partners {formatPrice(pay.data.total)}.</p>}
        </>
      )}
    </div>
  );
}
