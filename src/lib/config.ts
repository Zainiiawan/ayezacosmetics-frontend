const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// On a preview domain the backend's CORS list does not include us, so the
// browser goes through this app's own /backend-api relay instead (see
// src/app/backend-api). Server-side code always calls the backend directly.
const useRelay = process.env.NEXT_PUBLIC_API_PROXY === 'true' && typeof window !== 'undefined';

export const config = {
  apiUrl: useRelay ? '/backend-api' : backendUrl,
  backendUrl,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'AZEEORA',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  getBaseUrl: () => {
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3000';
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store';
  }
};

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export const getBaseUrl = config.getBaseUrl;