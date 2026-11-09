import { Product } from '@/lib/api/productApi';
import { config } from '@/lib/config';
import { rebrand } from '@/lib/rebrand';

/**
 * Every product on sale, for server-rendered pages such as the blog. Cached
 * under the "products" tag, so saving a product in the admin panel refreshes it.
 * An empty list when the backend is asleep: callers fall back to static content.
 */
export async function getCatalogue(): Promise<Product[]> {
  try {
    const res = await fetch(`${config.backendUrl}/products?page=1&limit=50&sortBy=bestselling`, {
      next: { tags: ['products'], revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = rebrand(await res.json());
    return ((data.data?.products ?? []) as Product[]).filter((p) => p.isActive !== false);
  } catch {
    return [];
  }
}

const categoryName = (p: Product) => (typeof p.category === 'object' && p.category ? p.category.name : '');

/** Products whose category matches one of the words given come first. */
export function sortByTopic(products: Product[], topics: string[]): Product[] {
  const words = topics.join(' ').toLowerCase();
  const score = (p: Product) => {
    const cat = categoryName(p).toLowerCase();
    if (!cat) return 1;
    return cat.split(/\s+/).some((w) => w.length > 2 && words.includes(w)) ? 0 : 1;
  };
  return [...products].sort((a, b) => score(a) - score(b));
}
