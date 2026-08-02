'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export function ConditionalSiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (pathname === '/') {
      document.documentElement.classList.add('md:snap-y', 'md:snap-mandatory');
    } else {
      document.documentElement.classList.remove('md:snap-y', 'md:snap-mandatory');
    }
    
    return () => {
      document.documentElement.classList.remove('md:snap-y', 'md:snap-mandatory');
    };
  }, [pathname]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer className={pathname === '/' ? 'md:snap-start' : ''} />
    </div>
  );
}
