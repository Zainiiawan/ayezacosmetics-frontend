'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

export function ConditionalSiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    // Remove any leftover snap classes if they existed previously to ensure clean state
    document.documentElement.classList.remove('md:snap-y', 'md:snap-mandatory');
  }, [pathname]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 pt-[98px] lg:pt-[110px]">{children}</main>
      <Footer />
      {/* keep checkout forms clear of the floating button on small screens */}
      {!pathname?.startsWith('/checkout') && <WhatsAppButton />}
    </div>
  );
}
