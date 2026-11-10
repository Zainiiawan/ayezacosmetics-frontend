import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  if (process.env.NEXT_PUBLIC_NOINDEX === 'true') return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/', '/api/', '/checkout', '/cart', '/login', '/register'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
