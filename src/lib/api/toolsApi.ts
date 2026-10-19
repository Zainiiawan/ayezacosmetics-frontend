import { api } from './axios';

export interface ClaimItem { productId: string; variant?: string; name: string; image?: string; price: number; quantity: number }
export interface Claim {
  _id: string;
  claimNumber: string;
  user: string;
  customerName: string;
  order: string;
  orderNumber: string;
  type: 'damaged' | 'wrong_item' | 'missing_item' | 'quality' | 'return';
  items: ClaimItem[];
  value: number;
  description: string;
  photos: string[];
  resolution: 'refund_wallet' | 'replacement';
  status: 'open' | 'approved' | 'rejected';
  refundAmount?: number;
  adminNote?: string;
  history: { status: string; at: string; note?: string }[];
  createdAt: string;
}
export interface ClaimableOrder {
  _id: string;
  orderNumber: string;
  deliveredAt: string;
  claimUntil: string;
  items: (Omit<ClaimItem, 'quantity'> & { quantity: number; claimable: number })[];
}
export interface Ticket {
  _id: string;
  ticketNumber: string;
  user: string;
  customerName: string;
  customerEmail: string;
  category: string;
  subject: string;
  orderNumber?: string;
  status: 'open' | 'answered' | 'closed';
  messages: { from: 'member' | 'team'; by?: string; body: string; attachments?: string[]; at: string }[];
  lastMessageAt: string;
  createdAt: string;
}
export interface NewsItem {
  _id: string;
  title: string;
  category: 'news' | 'offers' | 'products' | 'events' | 'training' | 'tools';
  audience: 'all' | 'partners';
  summary?: string;
  body?: string;
  image?: string;
  link?: string;
  pinned?: boolean;
  isPublished: boolean;
  createdAt: string;
}
export interface ListProduct { _id: string; name: string; slug: string; image: string; price: number; basePrice: number; stock: number; rating?: number }
export interface FavList { _id: string; name: string; isPublic: boolean; shareToken: string; items: ListProduct[]; updatedAt: string }

export const CLAIM_TYPES: [Claim['type'], string][] = [
  ['damaged', 'Arrived damaged'],
  ['wrong_item', 'Wrong item sent'],
  ['missing_item', 'Item missing'],
  ['quality', 'Quality problem'],
  ['return', 'Return (changed my mind)'],
];
export const TICKET_CATEGORIES: [string, string][] = [
  ['order', 'My order'],
  ['delivery', 'Delivery'],
  ['payment', 'Payment'],
  ['product', 'A product'],
  ['account', 'My account'],
  ['partner', 'Brand Partner programme'],
  ['other', 'Something else'],
];
export const NEWS_CATEGORIES: [NewsItem['category'], string][] = [
  ['news', 'News'],
  ['offers', 'Offers'],
  ['products', 'Products'],
  ['events', 'Events'],
  ['training', 'Training'],
  ['tools', 'Tools'],
];

const d = <T>(p: Promise<{ data: { data: T } }>) => p.then((r) => r.data.data);

export const toolsApi = {
  claims: {
    eligible: () => d<{ orders: ClaimableOrder[]; windowDays: number }>(api.get('/claims/eligible')),
    create: (body: Record<string, unknown>) => d<Claim>(api.post('/claims', body)),
    mine: () => d<Claim[]>(api.get('/claims/mine')),
    all: (status?: string) => d<Claim[]>(api.get('/claims', { params: { status } })),
    decide: (id: string, body: { action: 'approve' | 'reject'; refundAmount?: number; note?: string }) => d<Claim>(api.post(`/claims/${id}/decide`, body)),
  },
  tickets: {
    create: (body: Record<string, unknown>) => d<Ticket>(api.post('/tickets', body)),
    mine: () => d<Ticket[]>(api.get('/tickets/mine')),
    all: (status?: string) => d<Ticket[]>(api.get('/tickets', { params: { status } })),
    reply: (id: string, message: string, attachments: string[] = []) => d<Ticket>(api.post(`/tickets/${id}/reply`, { message, attachments })),
    close: (id: string) => d<Ticket>(api.post(`/tickets/${id}/close`, {})),
  },
  news: {
    feed: (category?: string) => d<NewsItem[]>(api.get('/news/feed', { params: { category } })),
    all: () => d<NewsItem[]>(api.get('/news')),
    create: (body: Partial<NewsItem>) => d<NewsItem>(api.post('/news', body)),
    update: (id: string, body: Partial<NewsItem>) => d<NewsItem>(api.put(`/news/${id}`, body)),
    remove: (id: string) => api.delete(`/news/${id}`),
  },
  lists: {
    mine: () => d<FavList[]>(api.get('/lists')),
    create: (name: string, isPublic = true) => d<FavList>(api.post('/lists', { name, isPublic })),
    update: (id: string, name: string, isPublic: boolean) => d<FavList>(api.put(`/lists/${id}`, { name, isPublic })),
    remove: (id: string) => api.delete(`/lists/${id}`),
    add: (id: string, productId: string) => d<FavList>(api.post(`/lists/${id}/items`, { productId })),
    removeItem: (id: string, productId: string) => d<FavList>(api.delete(`/lists/${id}/items/${productId}`)),
    shared: (token: string) => d<{ name: string; ownerName: string; items: ListProduct[]; updatedAt: string }>(api.get(`/lists/shared/${token}`)),
  },
  quickOrder: (code: string) =>
    d<ListProduct & { sku?: string; variant?: string; variantLabel?: string; isComingSoon: boolean }>(api.get(`/quick-order/${encodeURIComponent(code.trim())}`)),
  trainingDone: (id: string, done: boolean) => api.post(`/trainings/${id}/complete`, { done }),
  activation: (token: string) => d<{ firstName: string; email: string }>(api.get(`/auth/activate/${encodeURIComponent(token)}`)),
  activate: (token: string, password: string) =>
    d<{ user: Record<string, unknown>; tokens: { accessToken: string; refreshToken: string } }>(api.post('/auth/activate', { token, password })),
};
