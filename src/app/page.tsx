import { Category } from '@/lib/api/categoryApi';
import { Product } from '@/lib/api/productApi';
import { Slide } from '@/lib/api/slideApi';
import { config } from '@/lib/config';
import HomeClient from './HomeClient';
import { Metadata } from 'next';
import { rebrand } from '@/lib/rebrand';

export const metadata: Metadata = {
  title: { absolute: 'AZEEORA | Skincare & Beauty Made for Pakistani Skin' },
  description: 'Shop AZEEORA face washes, beauty creams and skincare made for Pakistani skin and weather. Cash on delivery and fast delivery across Pakistan.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AZEEORA | Skincare & Beauty Made for Pakistani Skin',
    description: 'Shop AZEEORA face washes, beauty creams and skincare made for Pakistani skin and weather. Cash on delivery and fast delivery across Pakistan.',
    url: 'https://azeeoracosmetics.com',
    type: 'website',
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

  return <HomeClient initialCategories={categories} initialProducts={products} initialSlides={slides} />;
}
