import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  let base = getBaseUrl();
  if (!base || base.includes('localhost') || base.includes('127.0.0.1') || base.includes('vercel.app')) {
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
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
