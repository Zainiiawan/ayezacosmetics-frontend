import { Category } from '@/lib/api/categoryApi';
import { Product } from '@/lib/api/productApi';
import { Slide } from '@/lib/api/slideApi';
import { config } from '@/lib/config';
import HomeClient from './HomeClient';
import { Metadata } from 'next';
import { rebrand } from '@/lib/rebrand';

export const metadata: Metadata = {
  title: { absolute: 'AZEEORA™ Official Store | Best Whitening Cream, Hair Serum, Skin Polish & Face Wash in Pakistan' },
  description: 'Official AZEEORA Store in Pakistan: Shop authentic whitening beauty cream, hair growth serum, glutathione skin polish kit & radiance face wash with 100% money-back guarantee & fast Cash on Delivery nationwide.',
  keywords: [
    'azeeora',
    'azeeora cosmetics',
    'azeeora official store',
    'azeeora pakistan',
    'azeeora whitening cream',
    'azeeora beauty',
    'azeeora face wash',
    'azeeora hair serum',
    'azeeora skin polish',
    'whitening cream',
    'best whitening cream in pakistan',
    'hair growth serum',
    'best hair serum in pakistan',
    'skin polish',
    'glutathione skin polish',
    'face wash',
    'best face wash in pakistan',
  ],
  alternates: {
    canonical: 'https://azeeoracosmetics.com/',
  },
  openGraph: {
    title: 'AZEEORA™ Official Store | Luxury Cosmetics & Skincare Pakistan',
    description: 'Official AZEEORA Store in Pakistan: Shop authentic whitening beauty cream, hair growth serum, glutathione skin polish kit & radiance face wash with fast Cash on Delivery nationwide.',
    url: 'https://azeeoracosmetics.com',
    type: 'website',
    images: [{ url: '/brand/og.png', width: 1200, height: 630, alt: 'AZEEORA Cosmetics Pakistan' }],
  },
};

// Ensure this page is cached and revalidated hourly
export const revalidate = 3600;

export default async function Home() {
  let categories: Category[] = [];
  let products: Product[] = [];
  try {
    const res = await fetch(`${config.apiUrl}/products?page=1&limit=50&sortBy=bestselling`, {
      next: { tags: ['products'], revalidate: 3600 },
    });
    if (res.ok) {
      const data = rebrand(await res.json());
      products = data.data?.products || [];
    }
  } catch {
    // backend asleep: the homepage still renders, products load in the browser
  }
  try {
    const res = await fetch(`${config.apiUrl}/categories`, {
      next: { tags: ['categories'], revalidate: 3600 },
    });
    
    if (res.ok) {
      const data = rebrand(await res.json());
      categories = data.data || [];
    }
  } catch (error) {
    console.warn('⚠️ Backend API is unreachable. Rendering with empty categories instead of crashing.');
  }

  let slides: Slide[] = [];
  try {
    const res = await fetch(`${config.apiUrl}/slides`, { next: { tags: ['slides'], revalidate: 3600 } });
    if (res.ok) slides = (await res.json()).data || [];
  } catch {
    // no slides yet, or the backend is asleep: the hero falls back to the products
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AZEEORA Cosmetics Featured Collection',
    description: 'Original AZEEORA luxury skincare and beauty products in Pakistan',
    url: 'https://azeeoracosmetics.com/',
    numberOfItems: 4,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Product',
          name: 'AZEEORA Beauty Cream',
          url: 'https://azeeoracosmetics.com/products/azeeora-beauty-cream',
          image: 'https://res.cloudinary.com/ekrmlhyf/image/upload/v1792457415/ayeza-cosmetics/bzltpg2ajhjhoe8hijti.jpg',
          brand: { '@type': 'Brand', name: 'AZEEORA' },
          offers: {
            '@type': 'Offer',
            price: '699',
            priceCurrency: 'PKR',
            availability: 'https://schema.org/InStock',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Product',
          name: 'AZEEORA Radiance Face Wash',
          url: 'https://azeeoracosmetics.com/products/azeeora-radiance-face-wash',
          image: 'https://res.cloudinary.com/ekrmlhyf/image/upload/v1792457379/ayeza-cosmetics/lwxi0m5si15oj7pfmdxk.jpg',
          brand: { '@type': 'Brand', name: 'AZEEORA' },
          offers: {
            '@type': 'Offer',
            price: '999',
            priceCurrency: 'PKR',
            availability: 'https://schema.org/InStock',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Product',
          name: 'AZEEORA Glutathione Skin Polish Kit',
          url: 'https://azeeoracosmetics.com/products/azeeora-glutathione-skin-polish-kit-or-oxidizing-emulsion-and-dust-free-blonder-powder',
          image: 'https://res.cloudinary.com/ekrmlhyf/image/upload/v1794256870/ayeza-cosmetics/dvdjicbu4xtxbxkbaukv.jpg',
          brand: { '@type': 'Brand', name: 'AZEEORA' },
          offers: {
            '@type': 'Offer',
            price: '1299',
            priceCurrency: 'PKR',
            availability: 'https://schema.org/InStock',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Product',
          name: 'AZEEORA Hair Growth Serum – 30ml',
          url: 'https://azeeoracosmetics.com/products/azeeora-hair-growth-serum-30ml',
          image: 'https://res.cloudinary.com/ekrmlhyf/image/upload/v1794297821/ayeza-cosmetics/h9dqbkgl6txrfeo3qrbn.jpg',
          brand: { '@type': 'Brand', name: 'AZEEORA' },
          offers: {
            '@type': 'Offer',
            price: '1099',
            priceCurrency: 'PKR',
            availability: 'https://schema.org/InStock',
          },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <HomeClient initialCategories={categories} initialProducts={products} initialSlides={slides} />
    </>
  );
}
