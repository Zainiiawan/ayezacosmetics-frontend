import { Metadata } from 'next';
import ShopPageClient from './ShopPageClient';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Shop All Products | AYEZA COSMETICS',
  description: 'Discover our complete collection of luxury cosmetics. Shop skincare, makeup, fragrances, and more at AYEZA COSMETICS.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Shop All Products | AYEZA COSMETICS',
    description: 'Discover our complete collection of luxury cosmetics. Shop skincare, makeup, fragrances, and more.',
    url: '/shop',
    type: 'website',
  },
};

export default async function ShopPageServer() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ayeza Cosmetics Product Catalog',
    description: 'Browse all premium luxury cosmetics products from AYEZA COSMETICS.',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store'}/shop`,
    itemListElement: [], // Could be populated on client or just kept as a top-level descriptor
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShopPageClient />
    </>
  );
}
