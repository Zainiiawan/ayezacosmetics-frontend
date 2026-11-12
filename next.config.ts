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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:;",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
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
      {
        source: '/products/ayeza-beauty-cream',
        destination: '/products/azeeora-beauty-cream',
        permanent: true,
      },
      {
        source: '/products/ayeza-radiance-face-wash',
        destination: '/products/azeeora-radiance-face-wash',
        permanent: true,
      },
      {
        source: '/products/ayezabeautycream',
        destination: '/products/azeeora-beauty-cream',
        permanent: true,
      },
      {
        source: '/products/ayezaradiancefacewash',
        destination: '/products/azeeora-radiance-face-wash',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
