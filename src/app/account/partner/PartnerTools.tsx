'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memberApi, apiError, MemberProfile, TeamMember } from '@/lib/api/memberApi';
import { extrasApi, TRAINING_TRACKS } from '@/lib/api/extrasApi';
import { toolsApi } from '@/lib/api/toolsApi';
import { CopyField, Field, Notice, Stat, money } from '@/components/member/ui';
import { cn, formatDate } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Title (rank) progress
// ---------------------------------------------------------------------------
export function TitleCard({ member }: { member: MemberProfile }) {
  const t = member.titleProgress;
  if (!t) return null;
  const next = t.next;
  const bar = (have: number, need: number) => (need <= 0 ? 100 : Math.min(100, (have / need) * 100));
  return (
    <div className="border border-line p-6">
      <p className="text-[0.72rem] uppercase tracking-[0.08em] text-muted">Your title this month</p>
      <h2 className="mt-1 title text-[1.9rem] text-ink">{t.title}</h2>
      {next ? (
        <div className="mt-4 space-y-3 text-[0.85rem]">
          <p className="text-gray-600 font-light">Next title: <b className="font-medium text-ink">{next.name}</b></p>
          {[
            ['Personal points', t.personalBV, next.minPersonalBV, 'BV'],
            ['Group points (you and your team)', t.groupBV, next.minGroupBV, 'BV'],
            ['Partners you introduced', t.recruits, next.minRecruits, ''],
          ].map(([label, have, need, unit]) => (
            <div key={label as string}>
              <div className="flex justify-between">
                <span className="font-light">{label}</span>
                <span>
                  {have} / {need} {unit}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 bg-tile rounded-full overflow-hidden">
                <div className={cn('h-full', bar(have as number, need as number) >= 100 ? 'bg-[#2f7d4f]' : 'bg-rose')} style={{ width: `${bar(have as number, need as number)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[0.9rem] text-gray-600 font-light">You hold the top title. Outstanding work.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onboarding progress, latest news and sponsor
// ---------------------------------------------------------------------------
export function OnboardingCard({ onOpen }: { onOpen: () => void }) {
  const { data = [] } = useQuery({ queryKey: ['my-training'], queryFn: extrasApi.trainings.mine });
  const steps = data.filter((t) => t.track === 'onboarding');
  if (steps.length === 0) return null;
  const done = steps.filter((t) => t.completed).length;
  return (
    <div className="bg-blush p-6 flex flex-col">
      <p className="text-[0.72rem] uppercase tracking-[0.08em] text-ink/70">Getting started</p>
      <p className="mt-2 text-[2rem] font-light leading-none">
        {done}/{steps.length}
      </p>
      <p className="mt-2 text-[0.9rem] font-light">{done === steps.length ? 'You have finished onboarding.' : 'Build your skills step by step.'}</p>
      <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div className="h-full bg-ink" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <button onClick={onOpen} className="mt-auto pt-4 self-start text-[0.85rem] underline underline-offset-4">
        {done === steps.length ? 'Review' : done ? 'Continue' : 'Start'}
      </button>
    </div>
  );
}

export function SponsorCard({ member }: { member: MemberProfile }) {
  const s = member.sponsor;
  if (!s) return null;
  const digits = String(s.phone ?? '').replace(/\D/g, '');
  const wa = digits ? `https://wa.me/${digits.startsWith('0') ? `92${digits.slice(1)}` : digits}` : null;
  return (
    <div className="bg-tile p-6">
      <p className="text-[0.72rem] uppercase tracking-[0.08em] text-muted">Your sponsor</p>
      <p className="mt-2 text-[1.15rem] font-light">{s.name}</p>
      <p className="text-[0.8rem] text-muted">{s.memberCode}</p>
      {wa ? (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-line mt-4">Message on WhatsApp</a>
      ) : (
        <p className="mt-3 text-[0.82rem] text-muted font-light">Need help? Open a service request and our team will connect you.</p>
      )}
    </div>
  );
}

export function NewsTeaser() {
  const { data = [] } = useQuery({ queryKey: ['news-feed', ''], queryFn: () => toolsApi.news.feed() });
  if (data.length === 0) return null;
  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-[1.3rem] font-light">What&apos;s new</h2>
        <Link href="/account/news" className="text-[0.85rem] underline underline-offset-4">View all</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {data.slice(0, 3).map((n) => (
          <Link key={n._id} href={`/account/news#${n._id}`} className="border border-line hover:border-ink transition-colors">
            {n.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={n.image} alt="" className="w-full h-36 object-cover" />
            )}
            <div className="p-5">
              <p className="text-[0.7rem] uppercase tracking-[0.1em] text-rose">{n.category}</p>
              <p className="mt-1.5 text-[1.02rem] leading-snug">{n.title}</p>
              {n.summary && <p className="mt-1.5 text-[0.85rem] text-gray-600 font-light line-clamp-2">{n.summary}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team report
// ---------------------------------------------------------------------------
const FILTERS = [
  ['all', 'Everyone'],
  ['new', 'New (last 31 days)'],
  ['active', 'Ordered this month'],
  ['inactive', 'No order this month'],
  ['partners', 'Partners'],
  ['not_activated', 'Not activated'],
] as const;

function toCsv(rows: TeamMember[]) {
  const head = ['Name', 'City', 'Type', 'Joined', 'Orders this month', 'Sales this month', 'BV this month', 'All orders', 'Last order'];
  const esc = (v: unknown) => {
    const s = String(v ?? '');
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [head, ...rows.map((p) => [p.name, p.city, p.type, p.joinedAt?.slice(0, 10), p.monthOrders, p.monthSales, p.monthBV, p.allOrders, p.lastOrderAt?.slice(0, 10) ?? ''])]
    .map((r) => r.map(esc).join(','))
    .join('\n');
}

export function TeamTab() {
  const [filter, setFilter] = useState<string>('all');
  const { data, isLoading } = useQuery({ queryKey: ['member-team', filter], queryFn: () => memberApi.team(filter) });
  const download = () => {
    if (!data) return;
    const blob = new Blob([toCsv(data.people)], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `azeeora-team-${data.month}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="space-y-6">
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="People in your team" value={data.totals.people} sub={`${data.totals.newThisMonth} joined this month`} />
          <Stat label="Ordered this month" value={data.totals.active} sub={data.totals.people ? `${Math.round((data.totals.active / data.totals.people) * 100)}% active` : undefined} />
          <Stat accent label="Team sales this month" value={money(data.totals.monthSales)} />
          <Stat label="Team points this month" value={`${data.totals.monthBV} BV`} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={cn('px-3 py-1.5 rounded-full border text-[0.8rem]', filter === k ? 'bg-ink text-white border-ink' : 'border-line hover:border-ink')}>
            {label}
          </button>
        ))}
        <button onClick={download} disabled={!data?.people.length} className="ml-auto text-[0.85rem] underline underline-offset-4 disabled:opacity-40">
          Download CSV
        </button>
      </div>
      {isLoading || !data ? (
        <p className="text-muted">Loading…</p>
      ) : data.people.length === 0 ? (
        <Notice>{filter === 'all' ? 'Nobody is in your team yet. Share your link or register a friend from the Tools tab.' : 'Nobody matches this filter.'}</Notice>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-[0.88rem]">
            <thead className="bg-tile text-left text-[0.72rem] uppercase tracking-[0.06em] text-muted">
              <tr>
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Joined</th>
                <th className="px-4 py-3 font-normal">Type</th>
                <th className="px-4 py-3 font-normal text-right">Orders (month)</th>
                <th className="px-4 py-3 font-normal text-right">Sales (month)</th>
                <th className="px-4 py-3 font-normal text-right">BV</th>
                <th className="px-4 py-3 font-normal">Last order</th>
              </tr>
            </thead>
            <tbody>
              {data.people.map((p) => (
                <tr key={p._id} className="border-t border-line">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.name}
                    {p.isNew && <span className="ml-2 text-[0.68rem] uppercase tracking-[0.06em] text-rose">New</span>}
                    {!p.activated && <span className="ml-2 text-[0.68rem] uppercase tracking-[0.06em] text-amber-700">Not activated</span>}
                    {p.city && <span className="block text-[0.78rem] text-muted font-light">{p.city}</span>}
                  </td>
                  <td className="px-4 py-3 font-light whitespace-nowrap">{formatDate(p.joinedAt)}</td>
                  <td className="px-4 py-3 font-light capitalize">{p.type}</td>
                  <td className="px-4 py-3 text-right">{p.monthOrders}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{money(p.monthSales)}</td>
                  <td className="px-4 py-3 text-right">{p.monthBV}</td>
                  <td className="px-4 py-3 font-light whitespace-nowrap">{p.lastOrderAt ? formatDate(p.lastOrderAt) : 'None yet'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tools: register a friend, pending activations, out of stock
// ---------------------------------------------------------------------------
type FriendForm = { firstName: string; lastName: string; email: string; phone: string; city: string; address?: string; consent: boolean };

export function ToolsTab() {
  const qc = useQueryClient();
  const form = useForm<FriendForm>();
  const [link, setLink] = useState<{ name: string; url: string; days: number } | null>(null);
  const registered = useQuery({ queryKey: ['member-registered'], queryFn: memberApi.registered });
  const oos = useQuery({ queryKey: ['member-oos'], queryFn: memberApi.outOfStock });
  const register = useMutation({
    mutationFn: (d: FriendForm) => memberApi.registerFriend(d),
    onSuccess: (r) => {
      setLink({ name: r.name, url: r.activationLink, days: r.expiresInDays });
      form.reset();
      qc.invalidateQueries({ queryKey: ['member-registered'] });
      qc.invalidateQueries({ queryKey: ['member-team'] });
    },
  });
  const relink = useMutation({
    mutationFn: (p: { id: string; name: string }) => memberApi.newActivationLink(p.id).then((r) => ({ ...r, name: p.name })),
    onSuccess: (r) => {
      setLink({ name: r.name, url: r.activationLink, days: r.expiresInDays });
      qc.invalidateQueries({ queryKey: ['member-registered'] });
    },
  });
  const pending = (registered.data ?? []).filter((p) => !p.activated);
  return (
    <div className="space-y-10">
      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
        <div>
          <h2 className="text-[1.3rem] font-light">Register a friend</h2>
          <p className="mt-1 text-[0.9rem] text-gray-600 font-light">
            Fill in their details with their permission. You get a private link to send them; they set their own password and join your team. The first 72 hours matter, so follow up soon.
          </p>
          <form onSubmit={form.handleSubmit((d) => register.mutate(d))} className="mt-5 grid sm:grid-cols-2 gap-4">
            <Field label="First name" {...form.register('firstName', { required: true })} />
            <Field label="Last name" {...form.register('lastName', { required: true })} />
            <Field label="Email" type="email" {...form.register('email', { required: true })} />
            <Field label="Mobile" placeholder="03XX XXXXXXX" {...form.register('phone', { required: true })} />
            <Field label="City" {...form.register('city', { required: true })} />
            <Field label="Address (optional)" {...form.register('address')} />
            <label className="sm:col-span-2 flex items-start gap-2 text-[0.88rem] font-light">
              <input type="checkbox" className="mt-1" {...form.register('consent', { required: true })} />
              My friend has agreed to be registered and to receive messages from Azeeora.
            </label>
            {register.isError && <div className="sm:col-span-2"><Notice tone="error">{apiError(register.error)}</Notice></div>}
            <button type="submit" disabled={register.isPending} className="btn-ink sm:col-span-2 justify-self-start">
              {register.isPending ? 'Registering…' : 'Register'}
            </button>
          </form>
        </div>
        <div className="space-y-4">
          {link && (
            <div className="border border-ink p-5 space-y-3">
              <p className="text-[0.95rem]">
                Send this link to <b className="font-medium">{link.name}</b>. It works once and expires in {link.days} days.
              </p>
              <CopyField label="Activation link" value={link.url} />
            </div>
          )}
          <div className="border border-line p-5">
            <h3 className="text-[1.05rem] font-light">Waiting to activate</h3>
            {pending.length === 0 ? (
              <p className="mt-2 text-[0.88rem] text-muted font-light">Everyone you registered has activated their account.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {pending.map((p) => (
                  <li key={p._id} className="py-3 flex items-center justify-between gap-3 text-[0.88rem]">
                    <span>
                      {p.name}
                      <span className="block text-[0.78rem] text-muted">
                        Registered {formatDate(p.createdAt)}
                        {p.expired && ' · link expired'}
                      </span>
                    </span>
                    <button onClick={() => relink.mutate({ id: p._id, name: p.name })} className="text-[0.8rem] underline underline-offset-4 whitespace-nowrap">
                      New link
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[1.3rem] font-light">Out of stock</h2>
        <p className="mt-1 text-[0.9rem] text-gray-600 font-light">Let your customers know before they order.</p>
        {oos.isLoading ? (
          <p className="mt-4 text-muted">Loading…</p>
        ) : (oos.data ?? []).length === 0 ? (
          <div className="mt-4"><Notice>Everything is in stock right now.</Notice></div>
        ) : (
          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {oos.data!.map((p) => (
              <li key={p._id} className="flex items-center gap-3 border border-line p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image && <img src={p.image} alt="" className="w-14 h-14 object-cover bg-tile" />}
                <span className="text-[0.88rem]">
                  <Link href={`/products/${p.slug}`} className="hover:underline">{p.name}</Link>
                  <span className="block text-[0.78rem] text-muted">{p.stock <= 0 ? 'Out of stock' : `Shades out: ${p.variantsOut.join(', ')}`}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recognition board
// ---------------------------------------------------------------------------
export function RecognitionTab() {
  const { data, isLoading } = useQuery({ queryKey: ['member-recognition'], queryFn: memberApi.recognition });
  if (isLoading || !data) return <p className="text-muted">Loading…</p>;
  const month = new Date(`${data.month}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[1.3rem] font-light">Top partners, {month}</h2>
        <p className="mt-1 text-[0.9rem] text-gray-600 font-light">Ranked by group points: your own plus your team&apos;s, this month.</p>
      </div>
      {data.list.length === 0 ? (
        <Notice>The board fills up as orders come in this month.</Notice>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-[0.9rem]">
            <thead className="bg-tile text-left text-[0.72rem] uppercase tracking-[0.06em] text-muted">
              <tr>
                <th className="px-4 py-3 font-normal">Rank</th>
                <th className="px-4 py-3 font-normal">Partner</th>
                <th className="px-4 py-3 font-normal">Title</th>
                <th className="px-4 py-3 font-normal text-right">Group BV</th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((r) => (
                <tr key={r.rank} className={cn('border-t border-line', r.isMe && 'bg-blush')}>
                  <td className="px-4 py-3 title text-[1.2rem]">{r.rank}</td>
                  <td className="px-4 py-3">
                    {r.name}
                    {r.isMe && <span className="ml-2 text-[0.7rem] uppercase tracking-[0.06em]">You</span>}
                    {r.city && <span className="block text-[0.78rem] text-muted font-light">{r.city}</span>}
                  </td>
                  <td className="px-4 py-3 font-light">{r.title}</td>
                  <td className="px-4 py-3 text-right">{r.groupBV}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Training with progress, grouped by track
// ---------------------------------------------------------------------------
export function TrainingProgressTab() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ['my-training'], queryFn: extrasApi.trainings.mine });
  const [open, setOpen] = useState<string | null>(null);
  const mark = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => toolsApi.trainingDone(id, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-training'] }),
  });
  if (isLoading) return <p className="text-muted">Loading…</p>;
  if (data.length === 0) return <Notice>Training guides will appear here.</Notice>;
  const embed = (url: string) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };
  return (
    <div className="space-y-10">
      {TRAINING_TRACKS.map(([track, label]) => {
        const items = data.filter((t) => (t.track ?? 'academy') === track);
        if (!items.length) return null;
        const done = items.filter((t) => t.completed).length;
        return (
          <section key={track}>
            <div className="flex items-end justify-between gap-3 mb-2">
              <h2 className="text-[1.3rem] font-light">{label}</h2>
              <span className="text-[0.85rem] text-muted">
                {done}/{items.length} done
              </span>
            </div>
            <div className="h-1 bg-tile rounded-full overflow-hidden mb-2">
              <div className="h-full bg-rose" style={{ width: `${(done / items.length) * 100}%` }} />
            </div>
            <div className="border-t border-line">
              {items.map((t) => (
                <div key={t._id} className="border-b border-line">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      aria-label={`Mark ${t.title} as done`}
                      checked={Boolean(t.completed)}
                      onChange={(e) => mark.mutate({ id: t._id, done: e.target.checked })}
                      className="w-4 h-4 accent-[#1a1a1a]"
                    />
                    <button onClick={() => setOpen(open === t._id ? null : t._id)} className="flex-1 flex items-center justify-between gap-4 py-5 text-left">
                      <span>
                        {t.category && <span className="block text-[0.75rem] uppercase tracking-[0.08em] text-muted">{t.category}</span>}
                        <span className={cn('text-[1.1rem] font-light', t.completed && 'text-muted line-through decoration-1')}>{t.title}</span>
                        {t.summary && <span className="block text-[0.9rem] text-gray-600 font-light">{t.summary}</span>}
                      </span>
                      <span className="text-[1.4rem] font-light">{open === t._id ? '−' : '+'}</span>
                    </button>
                  </div>
                  {open === t._id && (
                    <div className="pb-6 pl-8 space-y-4">
                      {t.videoUrl && embed(t.videoUrl) && (
                        <div className="aspect-video max-w-2xl">
                          <iframe src={embed(t.videoUrl)!} title={t.title} className="w-full h-full" allowFullScreen />
                        </div>
                      )}
                      {t.videoUrl && !embed(t.videoUrl) && (
                        <a href={t.videoUrl} target="_blank" rel="noopener noreferrer" className="underline">Watch the video</a>
                      )}
                      {t.body && <div className="text-gray-700 font-light leading-relaxed whitespace-pre-line max-w-2xl">{t.body}</div>}
                      {!t.completed && (
                        <button onClick={() => mark.mutate({ id: t._id, done: true })} className="btn-line">Mark as done</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
