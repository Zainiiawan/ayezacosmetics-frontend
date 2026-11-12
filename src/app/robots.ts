import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  let base = getBaseUrl();
  if (!base || base.includes('vercel.app') || base.includes('ayezacosmetics')) {
    base = 'https://azeeoracosmetics.com';
  }
  if (process.env.NEXT_PUBLIC_NOINDEX === 'true') return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/account/',
        '/api/',
        '/backend-api/',
        '/checkout',
        '/cart',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-otp',
        '/wishlist',
        '/compare',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
