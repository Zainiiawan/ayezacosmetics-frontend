import type { MetadataRoute } from 'next';
import { config, getBaseUrl } from '@/lib/config';
import { blogPosts } from '@/lib/data/blog';
import { rebrand } from '@/lib/rebrand';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let base = getBaseUrl();
  if (!base || base.includes('localhost') || base.includes('127.0.0.1') || base.includes('vercel.app')) {
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
    '/cookies',
    '/press',
    '/careers',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: path === '' ? `${base}/` : `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
    ...(path === ''
      ? {
          images: [
            `${base}/brand/og.png`,
            'https://res.cloudinary.com/ekrmlhyf/image/upload/v1792457415/ayeza-cosmetics/bzltpg2ajhjhoe8hijti.jpg',
            'https://res.cloudinary.com/ekrmlhyf/image/upload/v1792457379/ayeza-cosmetics/lwxi0m5si15oj7pfmdxk.jpg',
            'https://res.cloudinary.com/ekrmlhyf/image/upload/v1794256870/ayeza-cosmetics/dvdjicbu4xtxbxkbaukv.jpg',
            'https://res.cloudinary.com/ekrmlhyf/image/upload/v1794297821/ayeza-cosmetics/h9dqbkgl6txrfeo3qrbn.jpg',
          ],
        }
      : {}),
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
          let categorySlug = category.slug?.replace(/^ayeza-/, 'azeeora-') || category.slug;
          if (categorySlug === 'whitening-cream') categorySlug = 'skin-care';
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

  const hasProducts = sitemapEntries.some((e) => e.url.includes('/products/'));
  if (!hasProducts) {
    const fallbackProducts = [
      {
        slug: 'azeeora-beauty-cream',
        images: ['https://res.cloudinary.com/ekrmlhyf/image/upload/v1792457415/ayeza-cosmetics/bzltpg2ajhjhoe8hijti.jpg'],
      },
      {
        slug: 'azeeora-radiance-face-wash',
        images: [
          'https://res.cloudinary.com/ekrmlhyf/image/upload/v1792457379/ayeza-cosmetics/lwxi0m5si15oj7pfmdxk.jpg',
          'https://res.cloudinary.com/ekrmlhyf/image/upload/v1792457380/ayeza-cosmetics/cjqbdan8uq4wtprpzrll.jpg',
        ],
      },
      {
        slug: 'azeeora-glutathione-skin-polish-kit-or-oxidizing-emulsion-and-dust-free-blonder-powder',
        images: ['https://res.cloudinary.com/ekrmlhyf/image/upload/v1794256870/ayeza-cosmetics/dvdjicbu4xtxbxkbaukv.jpg'],
      },
      {
        slug: 'azeeora-hair-growth-serum-30ml',
        images: [
          'https://res.cloudinary.com/ekrmlhyf/image/upload/v1794297821/ayeza-cosmetics/h9dqbkgl6txrfeo3qrbn.jpg',
          'https://res.cloudinary.com/ekrmlhyf/image/upload/v1794297822/ayeza-cosmetics/o5rdk6w26ozcxzdjpb4b.jpg',
          'https://res.cloudinary.com/ekrmlhyf/image/upload/v1794297823/ayeza-cosmetics/pl6qfbnu5fgfmpepauxe.jpg',
        ],
      },
    ];
    fallbackProducts.forEach((item) => {
      sitemapEntries.push({
        url: `${base}/products/${item.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.95,
        images: item.images,
      });
    });
  }

  const hasCategories = sitemapEntries.some((e) => e.url.includes('/categories/'));
  if (!hasCategories) {
    ['skin-care', 'hair-care'].forEach((cat) => {
      sitemapEntries.push({
        url: `${base}/categories/${cat}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  }

  return sitemapEntries;
}
