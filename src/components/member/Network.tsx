'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { memberApi, NetworkMember, TreeNode } from '@/lib/api/memberApi';
import { Notice, Stat } from '@/components/member/ui';
import { cn, formatDate } from '@/lib/utils';

const thisMonth = () => new Date().toISOString().slice(0, 7);
const n = (v: number) => Math.round(v).toLocaleString();

/** Month picker: this month and the 11 before it. */
export function MonthSelect({ value, onChange }: { value: string; onChange: (m: string) => void }) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - i);
    return d.toISOString().slice(0, 7);
  });
  return (
    <select
      aria-label="Month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 px-3 border border-line bg-white text-[0.88rem] focus:outline-none focus:border-ink"
    >
      {months.map((m) => (
        <option key={m} value={m}>
          {new Date(`${m}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
        </option>
      ))}
    </select>
  );
}

/** Personal, team and group BP/BV, team points by level, and every credit. */
export function PointsTab() {
  const [month, setMonth] = useState(thisMonth());
  const { data, isLoading } = useQuery({ queryKey: ['member-points', month], queryFn: () => memberApi.points(month) });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.9rem] text-gray-600 font-light max-w-2xl">
          <b className="font-medium text-ink">Personal</b> points come from your own orders, <b className="font-medium text-ink">team</b> points from orders anywhere in your network below you.
          Group = personal + team. Points from a cancelled or refunded order are taken back.
        </p>
        <MonthSelect value={month} onChange={setMonth} />
      </div>
      {isLoading || !data ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Stat label="Personal BP" value={n(data.personal.bp)} sub={`Personal BV ${n(data.personal.bv)}`} />
            <Stat label="Team BP" value={n(data.team.bp)} sub={`Team BV ${n(data.team.bv)}`} />
            <Stat accent label="Group BV" value={n(data.group.bv)} sub={`Group BP ${n(data.group.bp)}`} />
          </div>
          <p className="text-[0.82rem] text-muted">
            All time: personal {n(data.lifetime.personal.bp)} BP / {n(data.lifetime.personal.bv)} BV, team {n(data.lifetime.team.bp)} BP / {n(data.lifetime.team.bv)} BV.
          </p>

          {data.byLevel.length > 0 && (
            <div>
              <h3 className="text-[1.05rem] font-light mb-3">Team points by level</h3>
              <div className="overflow-x-auto border border-line">
                <table className="w-full text-[0.88rem]">
                  <thead className="bg-tile text-left text-[0.72rem] uppercase tracking-[0.06em] text-muted">
                    <tr>
                      <th className="px-4 py-3 font-normal">Level</th>
                      <th className="px-4 py-3 font-normal text-right">Orders</th>
                      <th className="px-4 py-3 font-normal text-right">BP</th>
                      <th className="px-4 py-3 font-normal text-right">BV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byLevel.map((l) => (
                      <tr key={l.level} className="border-t border-line">
                        <td className="px-4 py-3">{l.level === 1 ? 'Level 1 (direct)' : `Level ${l.level}`}</td>
                        <td className="px-4 py-3 text-right font-light">{l.orders}</td>
                        <td className="px-4 py-3 text-right">{n(l.bp)}</td>
                        <td className="px-4 py-3 text-right">{n(l.bv)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-[1.05rem] font-light mb-3">Points history</h3>
            {data.history.length === 0 ? (
              <Notice>No points this month yet.</Notice>
            ) : (
              <div className="overflow-x-auto border border-line">
                <table className="w-full text-[0.88rem]">
                  <thead className="bg-tile text-left text-[0.72rem] uppercase tracking-[0.06em] text-muted">
                    <tr>
                      <th className="px-4 py-3 font-normal">Date</th>
                      <th className="px-4 py-3 font-normal">From</th>
                      <th className="px-4 py-3 font-normal">Type</th>
                      <th className="px-4 py-3 font-normal text-right">BP</th>
                      <th className="px-4 py-3 font-normal text-right">BV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.map((h) => (
                      <tr key={h._id} className={cn('border-t border-line', h.status === 'reversed' && 'text-muted line-through')}>
                        <td className="px-4 py-3 font-light whitespace-nowrap">{formatDate(h.createdAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {h.from}
                          {h.orderNumber && <span className="block text-[0.75rem] text-muted no-underline">{h.orderNumber}</span>}
                        </td>
                        <td className="px-4 py-3 font-light whitespace-nowrap">
                          {h.kind === 'personal' ? 'Personal' : `Team, level ${h.level}`}
                          {h.status === 'reversed' && <span className="ml-1 no-underline">(taken back)</span>}
                        </td>
                        <td className="px-4 py-3 text-right">{n(h.bp)}</td>
                        <td className="px-4 py-3 text-right">{n(h.bv)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Everyone in the network, direct and indirect, filterable by level. */
export function DownlineTab() {
  const [level, setLevel] = useState<number | undefined>(undefined);
  const [month, setMonth] = useState(thisMonth());
  const { data, isLoading } = useQuery({ queryKey: ['member-downline', level, month], queryFn: () => memberApi.downline(level, month) });
  const all = useQuery({ queryKey: ['member-downline', undefined, month], queryFn: () => memberApi.downline(undefined, month) });
  const levels = all.data?.levels ?? [];
  return (
    <div className="space-y-6">
      {all.data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Whole network" value={all.data.totals.people} />
          <Stat label="Direct (level 1)" value={all.data.totals.direct} />
          <Stat label="Indirect (level 2+)" value={all.data.totals.indirect} />
          <Stat accent label="Levels deep" value={levels.length} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setLevel(undefined)} className={cn('px-3 py-1.5 rounded-full border text-[0.8rem]', level === undefined ? 'bg-ink text-white border-ink' : 'border-line hover:border-ink')}>
          All levels
        </button>
        {levels.map((l) => (
          <button key={l.level} onClick={() => setLevel(l.level)} className={cn('px-3 py-1.5 rounded-full border text-[0.8rem]', level === l.level ? 'bg-ink text-white border-ink' : 'border-line hover:border-ink')}>
            Level {l.level} ({l.people})
          </button>
        ))}
        <span className="ml-auto">
          <MonthSelect value={month} onChange={setMonth} />
        </span>
      </div>
      {isLoading || !data ? (
        <p className="text-muted">Loading…</p>
      ) : data.people.length === 0 ? (
        <Notice>Nobody in your network yet. Share your referral link or code to build your team.</Notice>
      ) : (
        <MemberTable people={data.people} />
      )}
    </div>
  );
}

function MemberTable({ people }: { people: NetworkMember[] }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full text-[0.88rem]">
        <thead className="bg-tile text-left text-[0.72rem] uppercase tracking-[0.06em] text-muted">
          <tr>
            <th className="px-4 py-3 font-normal">Name</th>
            <th className="px-4 py-3 font-normal">Level</th>
            <th className="px-4 py-3 font-normal">Type</th>
            <th className="px-4 py-3 font-normal">Joined</th>
            <th className="px-4 py-3 font-normal text-right">Personal BP / BV</th>
            <th className="px-4 py-3 font-normal text-right">Group BV</th>
            <th className="px-4 py-3 font-normal text-right">Their team</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p._id} className="border-t border-line">
              <td className="px-4 py-3 whitespace-nowrap">
                {p.name}
                {p.memberCode && <span className="block text-[0.75rem] text-muted">{p.memberCode}</span>}
              </td>
              <td className="px-4 py-3 font-light whitespace-nowrap">{p.level === 1 ? '1 (direct)' : p.level}</td>
              <td className="px-4 py-3 font-light capitalize">{p.type}</td>
              <td className="px-4 py-3 font-light whitespace-nowrap">{formatDate(p.joinedAt)}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                {n(p.personal.bp)} / {n(p.personal.bv)}
              </td>
              <td className="px-4 py-3 text-right">{n(p.group.bv)}</td>
              <td className="px-4 py-3 text-right font-light">{p.directCount} direct</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Genealogy tree. Partners see their own network; an admin passes `adminSearch`
 * to start from any member (id, member code, invite code or email).
 */
export function GenealogyTree({ adminSearch }: { adminSearch?: boolean }) {
  const [month, setMonth] = useState(thisMonth());
  const [query, setQuery] = useState('');
  const [root, setRoot] = useState<string | undefined>(undefined);
  const enabled = !adminSearch || Boolean(root);
  const { data, isLoading, error } = useQuery({ queryKey: ['genealogy', root, month], queryFn: () => memberApi.genealogy(root, 3, month), enabled, retry: false });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        {adminSearch && (
          <form
            className="flex flex-wrap gap-2 items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setRoot(query.trim() || undefined);
            }}
          >
            <label className="block">
              <span className="block text-[0.82rem] mb-1">Member code, invite code or email</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="AZ-123456" className="h-10 w-64 px-3 border border-line focus:outline-none focus:border-ink" />
            </label>
            <button type="submit" className="btn-ink h-10">
              Show tree
            </button>
          </form>
        )}
        {root && !adminSearch && (
          <button onClick={() => setRoot(undefined)} className="text-[0.85rem] underline underline-offset-4">
            Back to my tree
          </button>
        )}
        <span className="ml-auto">
          <MonthSelect value={month} onChange={setMonth} />
        </span>
      </div>
      <p className="text-[0.82rem] text-muted">Each person shows their own BV and their group BV for the month. Tap a name to open their branch.</p>
      {!enabled ? (
        <Notice>Search for a member to see their tree.</Notice>
      ) : isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : error || !data ? (
        <Notice tone="error">No member found, or that member is not in your network.</Notice>
      ) : (
        <>
          {adminSearch && data.sponsor && (
            <p className="text-[0.85rem]">
              Sponsor:{' '}
              <button onClick={() => { setRoot(data.sponsor!._id); setQuery(data.sponsor!.memberCode ?? ''); }} className="underline underline-offset-4">
                {data.sponsor.name} {data.sponsor.memberCode && `(${data.sponsor.memberCode})`}
              </button>
            </p>
          )}
          <div className="border border-line p-3 sm:p-4 overflow-x-auto">
            <Branch node={data.root} depth={0} onOpen={(id) => setRoot(id)} />
          </div>
        </>
      )}
    </div>
  );
}

function Branch({ node, depth, onOpen }: { node: TreeNode; depth: number; onOpen: (id: string) => void }) {
  const [open, setOpen] = useState(depth < 2);
  const hasKids = node.children.length > 0;
  return (
    <div className={cn(depth > 0 && 'ml-4 sm:ml-6 pl-3 sm:pl-4 border-l border-line')}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 py-1.5">
        {hasKids ? (
          <button onClick={() => setOpen(!open)} className="w-6 h-6 flex items-center justify-center text-muted hover:text-ink" aria-label={open ? 'Collapse' : 'Expand'}>
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-6 h-6" />
        )}
        <button onClick={() => depth > 0 && onOpen(node._id)} className={cn('text-left', depth > 0 && 'hover:text-rose')} disabled={depth === 0}>
          <span className="font-medium">{node.name}</span>
          {node.memberCode && <span className="ml-1.5 text-[0.75rem] text-muted">{node.memberCode}</span>}
        </button>
        <span className={cn('text-[0.68rem] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded', node.type === 'partner' ? 'bg-ink text-white' : 'bg-tile text-muted')}>{node.type}</span>
        {depth > 0 && <span className="text-[0.72rem] text-muted">L{node.level}</span>}
        <span className="text-[0.8rem] text-gray-600 font-light whitespace-nowrap">
          BV {n(node.personal.bv)} · group {n(node.group.bv)}
        </span>
        {node.hasMore && (
          <button onClick={() => onOpen(node._id)} className="text-[0.78rem] underline underline-offset-4 text-muted hover:text-ink whitespace-nowrap">
            {node.directCount} more below
          </button>
        )}
      </div>
      {open && hasKids && node.children.map((c) => <Branch key={c._id} node={c} depth={depth + 1} onOpen={onOpen} />)}
    </div>
  );
}
