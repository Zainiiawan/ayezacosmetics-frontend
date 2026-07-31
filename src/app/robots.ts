import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  let base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://ayezacosmetics.store';
  if (base.includes('vercel.app')) {
    base = 'https://ayezacosmetics.store';
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/', '/api/', '/login', '/register'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
