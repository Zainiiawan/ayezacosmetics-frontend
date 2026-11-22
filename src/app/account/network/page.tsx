'use client';

import { useState } from 'react';
import AccountShell from '@/components/member/AccountShell';
import ReferralCard from '@/components/member/ReferralCard';
import { DownlineTab, GenealogyTree, PointsTab } from '@/components/member/Network';
import { cn } from '@/lib/utils';

const TABS = [
  ['points', 'My points (BP/BV)'],
  ['team', 'My team'],
  ['tree', 'Team tree'],
] as const;

/** Every member's network: referral code and link, points, the people below them and the tree. */
export default function NetworkPage() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('points');
  return (
    <AccountShell title="My network" intro="Your referral code and link, your personal and team points, and everyone who joined through you.">
      <ReferralCard compact />
      <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line mb-6" role="tablist">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cn('px-4 py-3 text-[0.8rem] uppercase tracking-[0.05em] whitespace-nowrap border-b-2 -mb-px', tab === k ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink')}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'points' && <PointsTab />}
      {tab === 'team' && <DownlineTab />}
      {tab === 'tree' && <GenealogyTree />}
    </AccountShell>
  );
}
