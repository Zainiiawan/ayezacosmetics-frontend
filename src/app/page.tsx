import { Category } from '@/lib/api/categoryApi';
import { config } from '@/lib/config';
import HomeClient from './HomeClient';

// Ensure this page is cached and revalidated hourly
export const revalidate = 3600;

export default async function Home() {
  let categories: Category[] = [];
  try {
    const res = await fetch(`${config.apiUrl}/categories`, {
      next: { revalidate: 3600 },
    });
    
    if (res.ok) {
      const data = await res.json();
      categories = data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch categories on server:', error);
  }

  return <HomeClient initialCategories={categories} />;
}
