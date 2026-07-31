import { categoryApi } from '@/lib/api/categoryApi';
import HomeClient from './HomeClient';

// Ensure this page is dynamically rendered or revalidated as needed
export const revalidate = 3600; // revalidate every hour, or adjust as needed

export default async function Home() {
  let categories = [];
  try {
    categories = await categoryApi.getAll();
  } catch (error) {
    console.error('Failed to fetch categories on server:', error);
  }

  return <HomeClient initialCategories={categories} />;
}
