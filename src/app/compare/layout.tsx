import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Products | AZEEORA',
  description: 'Compare luxury skincare and beauty products side by side at AZEEORA.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
