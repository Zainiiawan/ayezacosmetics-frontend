import { Category } from '@/lib/api/categoryApi';
import { config } from '@/lib/config';
import HomeClient from './HomeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ayeza Cosmetics | Premium Skincare & Beauty Products in Pakistan',
  description: 'Discover Ayeza Cosmetics. Shop premium skincare, beauty creams, and face washes designed for radiant, healthy skin. Fast delivery across Pakistan.',
};

// Ensure this page is cached and revalidated hourly
export const revalidate = 3600;

export default async function Home() {
  let categories: Category[] = [];
  try {
    const res = await fetch(`${config.apiUrl}/categories`, {
      next: { tags: ['categories'], revalidate: 3600 },
    });
    
    if (res.ok) {
      const data = await res.json();
      categories = data.data || [];
    }
  } catch (error) {
    console.warn('⚠️ Backend API is unreachable. Rendering with empty categories instead of crashing.');
  }

  return <HomeClient initialCategories={categories} />;
}
