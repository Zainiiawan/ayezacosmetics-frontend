import { rebrand } from '@/lib/rebrand';
import { Metadata } from 'next';
import ShopPageClient from './ShopPageClient';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Shop Best Whitening Creams, Hair Serums & Skincare in Pakistan',
  description: 'Explore the complete AZEEORA cosmetics collection in Pakistan: top-rated whitening beauty cream, hair growth serum, glutathione skin polish kit, and radiance face wash with cash on delivery.',
  keywords: [
    'whitening cream',
    'best whitening cream in pakistan',
    'hair growth serum',
    'best hair serum in pakistan',
    'skin polish',
    'glutathione skin polish',
    'face wash',
    'best face wash in pakistan',
    'azeeora cosmetics',
    'azeeora',
  ],
  alternates: {
    canonical: `${config.getBaseUrl()}/shop`,
  },
  openGraph: {
    title: 'Shop Best Whitening Creams, Hair Serums & Skincare in Pakistan | AZEEORA',
    description: 'Explore the complete AZEEORA cosmetics collection in Pakistan. Shop our top-rated whitening beauty cream, hair growth serum, glutathione skin polish kit & radiance face wash with cash on delivery.',
    url: `${config.getBaseUrl()}/shop`,
    type: 'website',
  },
};

export const revalidate = 3600;

const fallbackShopProducts = [
  {
    _id: 'prod-cream',
    name: 'AZEEORA Beauty Cream',
    slug: 'azeeora-beauty-cream',
    basePrice: 899,
    salePrice: 699,
    images: [{ url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_600/v1792457415/ayeza-cosmetics/bzltpg2ajhjhoe8hijti.jpg', alt: 'AZEEORA Beauty Cream' }],
    rating: 4.9,
    reviewCount: 142,
    stock: 50,
    isActive: true,
  },
  {
    _id: 'prod-facewash',
    name: 'AZEEORA Radiance Face Wash',
    slug: 'azeeora-radiance-face-wash',
    basePrice: 1199,
    salePrice: 999,
    images: [{ url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_600/v1792457379/ayeza-cosmetics/lwxi0m5si15oj7pfmdxk.jpg', alt: 'AZEEORA Radiance Face Wash' }],
    rating: 4.8,
    reviewCount: 98,
    stock: 45,
    isActive: true,
  },
  {
    _id: 'prod-polish',
    name: 'AZEEORA Glutathione Skin Polish Kit',
    slug: 'azeeora-glutathione-skin-polish-kit-or-oxidizing-emulsion-and-dust-free-blonder-powder',
    basePrice: 1999,
    salePrice: 1299,
    images: [{ url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_600/v1794256870/ayeza-cosmetics/dvdjicbu4xtxbxkbaukv.jpg', alt: 'AZEEORA Glutathione Skin Polish Kit' }],
    rating: 4.9,
    reviewCount: 86,
    stock: 35,
    isActive: true,
  },
  {
    _id: 'prod-serum',
    name: 'AZEEORA Hair Growth Serum – 30ml',
    slug: 'azeeora-hair-growth-serum-30ml',
    basePrice: 1499,
    salePrice: 1099,
    images: [{ url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_600/v1794297821/ayeza-cosmetics/h9dqbkgl6txrfeo3qrbn.jpg', alt: 'AZEEORA Hair Growth Serum' }],
    rating: 4.9,
    reviewCount: 112,
    stock: 40,
    isActive: true,
  },
];

export default async function ShopPageServer() {
  const base = config.getBaseUrl();

  // Pre-fetch initial products for SSR with fallback
  let initialProductsData: any = null;
  try {
    const productsRes = await fetch(
      `${config.apiUrl}/products?page=1&limit=12&sortBy=bestselling`,
      {
        next: { revalidate: 3600, tags: ['products'] },
      }
    );
    if (productsRes.ok) {
      const productsJson = rebrand(await productsRes.json());
      if (productsJson.data?.products && productsJson.data.products.length > 0) {
        initialProductsData = productsJson.data;
      }
    }
  } catch (error) {
    console.warn('Backend products endpoint unreachable during SSR, using fallback catalog.');
  }

  // Ensure initialProductsData is never null for Googlebot
  if (!initialProductsData || !Array.isArray(initialProductsData.products) || initialProductsData.products.length === 0) {
    initialProductsData = {
      products: fallbackShopProducts,
      pagination: {
        total: fallbackShopProducts.length,
        page: 1,
        pages: 1,
        limit: 12,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  const productsList = initialProductsData.products || [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AZEEORA Product Catalog',
    description: 'Browse all premium luxury cosmetics products from AZEEORA.',
    url: `${base}/shop`,
    itemListElement: productsList.map((product: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: `${base}/products/${product.slug?.replace(/^ayeza-/, 'azeeora-') || product.slug}`,
    })),
  };

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
