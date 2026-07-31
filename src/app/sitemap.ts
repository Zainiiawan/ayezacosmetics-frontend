import type { MetadataRoute } from 'next';
import { config } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://ayezacosmetics.store';
  if (base.includes('vercel.app')) {
    base = 'https://ayezacosmetics.store';
  }
  const now = new Date();

  const staticPages = [
    '',
    '/shop',
    '/categories',
    '/offers',
    '/about',
    '/contact',
    '/help',
    '/track-order',
    '/terms',
    '/privacy',
    '/compare',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  try {
    // Fetch products (Paginated to respect 100 limit)
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const productsRes = await fetch(`${config.apiUrl}/products?limit=100&page=${page}`, { next: { revalidate: 3600 } });
      if (productsRes.ok) {
        const { data: { products, pagination } } = await productsRes.json();
        if (Array.isArray(products)) {
          products.forEach((product: any) => {
            sitemapEntries.push({
              url: `${base}/products/${product.slug}`,
              lastModified: new Date(product.updatedAt || now),
              changeFrequency: 'weekly',
              priority: 0.9,
            });
          });
        }
        hasNext = pagination?.hasNext || false;
        page++;
      } else {
        hasNext = false;
      }
    }

    // Fetch categories
    const categoriesRes = await fetch(`${config.apiUrl}/categories`, { next: { revalidate: 3600 } });
    if (categoriesRes.ok) {
      const { data } = await categoriesRes.json();
      if (Array.isArray(data)) {
        data.forEach((category: any) => {
          sitemapEntries.push({
            url: `${base}/categories/${category.slug}`,
            lastModified: new Date(category.updatedAt || now),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
      }
    }
  } catch (error) {
    console.error('Error fetching dynamic sitemap entries:', error);
  }

  return sitemapEntries;
}
