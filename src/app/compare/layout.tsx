import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Products | AZEEORA',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
