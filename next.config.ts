import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://*.google-analytics.com https://google-analytics.com https://analytics.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'self' https://www.googletagmanager.com;",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/products/ayeza-beauty-cream',
        destination: 'https://azeeoracosmetics.com/products/azeeora-beauty-cream',
        permanent: true,
      },
      {
        source: '/products/ayeza-radiance-face-wash',
        destination: 'https://azeeoracosmetics.com/products/azeeora-radiance-face-wash',
        permanent: true,
      },
      {
        source: '/products/ayezabeautycream',
        destination: 'https://azeeoracosmetics.com/products/azeeora-beauty-cream',
        permanent: true,
      },
      {
        source: '/products/ayezaradiancefacewash',
        destination: 'https://azeeoracosmetics.com/products/azeeora-radiance-face-wash',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.azeeoracosmetics.com',
          },
        ],
        destination: 'https://azeeoracosmetics.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ayezacosmetics.vercel.app',
          },
        ],
        destination: 'https://azeeoracosmetics.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ayezacosmetics-frontend-gamma.vercel.app',
          },
        ],
        destination: 'https://azeeoracosmetics.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
