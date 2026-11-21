const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// In the browser, always use this app's own same-origin /backend-api relay.
// This completely prevents Googlebot from hitting Render's backend robots.txt,
// eliminates CORS issues, and provides fast edge caching.
const useRelay = typeof window !== 'undefined';

export const config = {
  apiUrl: useRelay ? '/backend-api' : backendUrl,
  backendUrl,
  appUrl: 'https://azeeoracosmetics.com',
  appName: 'AZEEORA',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  getBaseUrl: () => {
    // Canonical production base URL MUST ALWAYS be https://azeeoracosmetics.com
    // Never allow localhost or temporary preview domains to leak into canonical tags or sitemaps.
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && !envUrl.includes('vercel.app')) {
      return envUrl.replace(/\/+$/, '');
    }
    return 'https://azeeoracosmetics.com';
  }
};

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export const getBaseUrl = config.getBaseUrl;