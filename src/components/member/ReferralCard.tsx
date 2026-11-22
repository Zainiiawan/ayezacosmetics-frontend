'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Check, Copy, Share2 } from 'lucide-react';
import { memberApi } from '@/lib/api/memberApi';
import { useMember } from '@/lib/member/useMember';

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          window.setTimeout(() => setDone(false), 1800);
        } catch {
          // clipboard blocked: the value is on screen to copy by hand
        }
      }}
      className="inline-flex items-center gap-1.5 h-10 px-4 border border-ink text-[0.8rem] uppercase tracking-[0.06em] hover:bg-ink hover:text-white transition-colors shrink-0"
      aria-label={label}
    >
      {done ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {done ? 'Copied' : 'Copy'}
    </button>
  );
}

/**
 * Every member's referral code and link. Both do the same thing: whoever signs
 * up with them joins this member's team for good, and their shopping adds to
 * this member's team points.
 */
export default function ReferralCard({ compact }: { compact?: boolean }) {
  const { member, isLoading } = useMember();
  const team = useQuery({ queryKey: ['member-downline', undefined, undefined], queryFn: () => memberApi.downline(), enabled: Boolean(member) });
  if (isLoading || !member) return null;
  const code = member.inviteCode ?? member.referralCode;
  const link = member.links?.member;

  if (!code || !link)
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 text-sm text-gray-600">
        Your referral code is created as soon as your email is verified. Refresh this page in a moment.
      </div>
    );

  const message = `Join me on AZEEORA. Sign up with my link ${link} or use my referral code ${code}.`;
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Join me on AZEEORA', text: message, url: link });
      else window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    } catch {
      // share sheet closed
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-5 sm:p-6 mb-6" aria-labelledby="referral-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="referral-title" className="text-xl font-serif font-bold">My referral</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Anyone who signs up with your link or your code joins your team. When they, or anyone they bring, shop on AZEEORA, the points are added to your team BP and BV.
          </p>
        </div>
        {team.data && (
          <p className="text-sm text-gray-700">
            <b className="text-lg">{team.data.totals.people}</b> in your team · {team.data.totals.direct} direct
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1.5">Referral code</p>
          <div className="flex gap-2">
            <p className="flex-1 min-w-0 h-10 px-3 flex items-center overflow-hidden border border-gray-300 font-mono text-lg tracking-wider" data-testid="referral-code">
              <span className="truncate">{code}</span>
            </p>
            <CopyButton value={code} label="Copy referral code" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1.5">Referral link</p>
          <div className="flex gap-2">
            <p className="flex-1 min-w-0 h-10 px-3 flex items-center overflow-hidden border border-gray-300 text-sm" data-testid="referral-link">
              <span className="truncate">{link}</span>
            </p>
            <CopyButton value={link} label="Copy referral link" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button type="button" onClick={share} className="inline-flex items-center gap-2 h-10 px-5 bg-ink text-white text-[0.8rem] uppercase tracking-[0.06em]">
          <Share2 className="w-4 h-4" /> Share
        </button>
        {!compact && (
          <Link href="/account/network" className="text-sm underline underline-offset-4">
            My team, points and tree
          </Link>
        )}
        {member.sponsor && (
          <span className="text-sm text-gray-600">
            You joined through {member.sponsor.name}
            {member.sponsor.referralCode ? ` (${member.sponsor.referralCode})` : ''}
          </span>
        )}
      </div>
    </section>
  );
}
