import type { Metadata } from 'next';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Track Your Order | Live Courier Tracking',
  description: 'Track your AZEEORA cosmetics order status in real time across Pakistan using your Order ID and email address.',
  alternates: {
    canonical: `${config.getBaseUrl()}/track-order`,
  },
  openGraph: {
    title: 'Track Your Order | Live Courier Tracking | AZEEORA',
    description: 'Track your AZEEORA cosmetics order status in real time across Pakistan.',
    url: `${config.getBaseUrl()}/track-order`,
    type: 'website',
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
