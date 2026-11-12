import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Categories | Luxury Skincare & Beauty Collections | AZEEORA',
  description: 'Explore AZEEORA luxury skincare categories in Pakistan: Whitening Creams, Face Wash, Hair Care & Serums, and Glutathione Skin Polish kits.',
  alternates: {
    canonical: '/categories',
  },
  openGraph: {
    title: 'All Categories | Luxury Skincare & Beauty Collections | AZEEORA',
    description: 'Explore AZEEORA luxury skincare categories in Pakistan: Whitening Creams, Face Wash, Hair Care & Serums, and Glutathione Skin Polish kits.',
    url: '/categories',
    type: 'website',
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
