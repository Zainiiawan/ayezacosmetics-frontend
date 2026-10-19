'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMember } from '@/lib/member/useMember';
import { cn } from '@/lib/utils';

const LINKS: { href: string; label: string; partner?: boolean }[] = [
  { href: '/account', label: 'Dashboard' },
  { href: '/account/news', label: "What's new" },
  { href: '/account/earnings', label: 'My earnings' },
  { href: '/account/lists', label: 'Favourite lists' },
  { href: '/account/claims', label: 'Claims and returns' },
  { href: '/account/support', label: 'Service requests' },
  { href: '/account/partner', label: 'Partner dashboard', partner: true },
];

/** Shared frame for the member area pages: sign-in gate, title and the section menu. */
export default function AccountShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const isHydrated = useSelector((s: RootState) => s.auth.isHydrated);
  const { member } = useMember();
  const links = LINKS.filter((l) => !l.partner || member?.accountType === 'partner');

  return (
    <div className="px-4 sm:px-6 lg:px-11 py-8 lg:py-12 max-w-6xl mx-auto">
      <nav className="text-[0.8rem] text-muted mb-4">
        <Link href="/account" className="hover:text-ink">My account</Link> / <span className="text-ink">{title}</span>
      </nav>
      <h1 className="title text-[2.2rem] sm:text-[2.8rem] text-ink">{title}</h1>
      {intro && <p className="mt-2 text-gray-600 font-light max-w-2xl">{intro}</p>}
      <div className="mt-6 flex gap-1 overflow-x-auto no-scrollbar border-b border-line">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'px-4 py-3 text-[0.8rem] uppercase tracking-[0.05em] whitespace-nowrap border-b-2 -mb-px',
              pathname === l.href ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
            )}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        {isHydrated && !isAuthenticated ? (
          <div>
            <p className="text-gray-600 font-light">Please sign in to continue.</p>
            <Link href={`/login?redirect=${encodeURIComponent(pathname ?? '/account')}`} className="btn-ink mt-6">Sign in</Link>
          </div>
        ) : !isHydrated ? (
          <p className="text-muted">Loading…</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
