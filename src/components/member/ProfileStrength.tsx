'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RootState } from '@/store';
import { useMember } from '@/lib/member/useMember';
import { memberApi, apiError } from '@/lib/api/memberApi';
import { Notice } from './ui';

const QUICK = [
  ['/account/news', "What's new"],
  ['/account/earnings', 'My earnings'],
  ['/account/lists', 'Favourite lists'],
  ['/account/claims', 'Claims and returns'],
  ['/account/support', 'Service requests'],
  ['/track-order', 'Track an order'],
] as const;

/** How complete the member's profile is, what to add next, plus shortcuts to the member area. */
export default function ProfileStrength() {
  const qc = useQueryClient();
  const user = useSelector((s: RootState) => s.auth.user) as { phone?: string; addresses?: unknown[] } | null;
  const { member } = useMember();
  const [why, setWhy] = useState<string | null>(null);
  const save = useMutation({ mutationFn: (body: { myWhy?: string; shareContact?: boolean }) => memberApi.setPreferences(body), onSuccess: (d) => qc.setQueryData(['member-me'], d) });
  if (!member) return null;
  const partner = member.accountType === 'partner';
  const steps: [boolean, string, string][] = [
    [Boolean(user?.phone), 'Add your mobile number', 'Profile tab below'],
    [Boolean(user?.addresses?.length), 'Save a delivery address', 'Used at checkout'],
    ...(partner
      ? ([
          [member.kyc?.status === 'approved', 'Verify your payout details', 'Partner dashboard, Payout details'],
          [Boolean(member.preferences.myWhy), 'Write your why', 'What drives you, just for you'],
          [member.preferences.shareContact, 'Let your team contact you', 'Shows your WhatsApp to people you introduced'],
        ] as [boolean, string, string][])
      : []),
  ];
  const pct = Math.round((steps.filter(([d]) => d).length / steps.length) * 100);
  const label = pct >= 100 ? 'Complete' : pct >= 60 ? 'Good' : 'Low';
  return (
    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-3 mb-8">
      <div className="border border-line bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-[0.75rem] uppercase tracking-[0.08em] text-muted">Profile strength: {label}</p>
          <p className="text-[0.9rem]">{pct}%</p>
        </div>
        <div className="mt-2 h-1.5 bg-tile rounded-full overflow-hidden">
          <div className="h-full bg-rose" style={{ width: `${pct}%` }} />
        </div>
        <ul className="mt-4 space-y-2 text-[0.88rem]">
          {steps.map(([done, title, hint]) => (
            <li key={title} className="flex items-start gap-2">
              <span className={done ? 'text-[#2f7d4f]' : 'text-muted'}>{done ? '✓' : '○'}</span>
              <span className={done ? 'text-muted line-through decoration-1' : ''}>
                {title}
                {!done && <span className="block text-[0.78rem] text-muted">{hint}</span>}
              </span>
            </li>
          ))}
        </ul>
        {partner && (
          <div className="mt-4 space-y-3 border-t border-line pt-4">
            <label className="block">
              <span className="block text-[0.82rem] mb-1">My why</span>
              <textarea
                rows={2}
                maxLength={500}
                value={why ?? member.preferences.myWhy}
                onChange={(e) => setWhy(e.target.value)}
                className="w-full p-2.5 border border-line text-[0.88rem] focus:outline-none focus:border-ink"
              />
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <button disabled={why === null || save.isPending} onClick={() => save.mutate({ myWhy: why ?? '' })} className="btn-line h-9 text-[0.75rem]">
                Save
              </button>
              <label className="flex items-center gap-2 text-[0.85rem]">
                <input type="checkbox" checked={member.preferences.shareContact} onChange={(e) => save.mutate({ shareContact: e.target.checked })} />
                Share my contact with my team
              </label>
            </div>
            {save.isError && <Notice tone="error">{apiError(save.error)}</Notice>}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {QUICK.map(([href, label]) => (
          <Link key={href} href={href} className="bg-tile hover:bg-blush transition-colors p-5 flex items-end min-h-[5.5rem] text-[0.95rem] font-light">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
