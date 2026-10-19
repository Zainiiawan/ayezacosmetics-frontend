'use client';

import Link from 'next/link';
import AccountShell from '@/components/member/AccountShell';
import EarningsView from '@/components/member/EarningsView';
import { useMember } from '@/lib/member/useMember';

export default function EarningsPage() {
  const { member } = useMember();
  const partner = member?.accountType === 'partner';
  return (
    <AccountShell title="My earnings" intro="Cashback, commission, refunds and what you saved, month by month.">
      {member && <EarningsView partner={partner} />}
      {member && !partner && member.accountType === 'customer' && (
        <p className="mt-8 text-[0.9rem] text-gray-600 font-light">
          Want to earn on your friends&apos; orders too? <Link href="/join" className="underline underline-offset-4">Become a Brand Partner</Link>.
        </p>
      )}
    </AccountShell>
  );
}
