import { rebrand } from '@/lib/rebrand';
import { Metadata } from 'next';
import ShopPageClient from './ShopPageClient';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Shop All Products | AZEEORA',
  description: 'Discover our complete collection of luxury cosmetics. Shop skincare, makeup, fragrances, and more at AZEEORA.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Shop All Products | AZEEORA',
    description: 'Discover our complete collection of luxury cosmetics. Shop skincare, makeup, fragrances, and more.',
    url: '/shop',
    type: 'website',
  },
};

export default async function ShopPageServer() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AZEEORA Product Catalog',
    description: 'Browse all premium luxury cosmetics products from AZEEORA.',
    url: `${config.getBaseUrl()}/shop`,
    itemListElement: [], // Could be populated on client or just kept as a top-level descriptor
  };

  // Pre-fetch initial products for SSR
  let initialProductsData = null;
  try {
    // Default: page 1, limit 12, sortBy bestselling
    const productsRes = await fetch(
      `${config.apiUrl}/products?page=1&limit=12&sortBy=bestselling`,
      {
        next: { revalidate: 3600, tags: ['products'] },
      }
    );
    if (productsRes.ok) {
      const productsJson = rebrand(await productsRes.json());
      initialProductsData = productsJson.data;
    }
  } catch (error) {
    console.error('Error fetching initial shop products:', error);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShopPageClient initialProductsData={initialProductsData} />
    </>
  );
}
