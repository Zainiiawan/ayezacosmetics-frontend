import type { MetadataRoute } from 'next';
import { config, getBaseUrl } from '@/lib/config';
import { blogPosts } from '@/lib/data/blog';
import { rebrand } from '@/lib/rebrand';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let base = getBaseUrl();
  if (!base || base.includes('vercel.app') || base.includes('ayezacosmetics')) {
    base = 'https://azeeoracosmetics.com';
  }
  const now = new Date();

  const staticPages = [
    '',
    '/shop',
    '/categories',
    '/offers',
    '/blog',
    '/about',
    '/contact',
    '/help',
    '/track-order',
    '/terms',
    '/privacy',
    '/shipping',
    '/refunds',
    '/compare',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  blogPosts.forEach((post) => {
    sitemapEntries.push({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: 'weekly',
      priority: 0.8,
      ...(post.featuredImage?.url ? { images: [`${post.featuredImage.url.startsWith('http') ? post.featuredImage.url : `${base}${post.featuredImage.url}`}`] } : {}),
    });
  });

  try {
    // Fetch products (Paginated to respect 100 limit)
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const productsRes = await fetch(`${config.apiUrl}/products?limit=100&page=${page}`, { next: { revalidate: 3600 } });
      if (productsRes.ok) {
        const resJson = rebrand(await productsRes.json());
        const { data: { products, pagination } } = resJson;
        if (Array.isArray(products)) {
          products.forEach((product: any) => {
            const productSlug = product.slug?.replace(/^ayeza-/, 'azeeora-') || product.slug;
            const productImages = (product.images || [])
              .map((img: any) => (typeof img === 'string' ? img : img?.url))
              .filter(Boolean);

            sitemapEntries.push({
              url: `${base}/products/${productSlug}`,
              lastModified: new Date(product.updatedAt || now),
              changeFrequency: 'weekly',
              priority: 0.95,
              ...(productImages.length > 0 ? { images: productImages } : {}),
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
      const catJson = rebrand(await categoriesRes.json());
      const { data } = catJson;
      if (Array.isArray(data)) {
        data.forEach((category: any) => {
          const categorySlug = category.slug?.replace(/^ayeza-/, 'azeeora-') || category.slug;
          sitemapEntries.push({
            url: `${base}/categories/${categorySlug}`,
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
