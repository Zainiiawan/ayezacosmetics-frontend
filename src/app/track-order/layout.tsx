import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order | AZEEORA',
  description: 'Track your AZEEORA luxury cosmetics order status and courier delivery live across Pakistan.',
  alternates: {
    canonical: '/track-order',
  },
  openGraph: {
    title: 'Track Your Order | AZEEORA',
    description: 'Track your AZEEORA luxury cosmetics order status and courier delivery live across Pakistan.',
    url: '/track-order',
    type: 'website',
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
