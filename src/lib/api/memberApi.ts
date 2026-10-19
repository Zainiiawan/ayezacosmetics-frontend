import { api } from './axios';

export type Tier = { minBV: number; pct: number };
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type WalletSummary = { available: number; pending: number; earned: number; withdrawn: number };

export interface PartnerInfo {
  status: ReviewStatus;
  phone?: string;
  whatsapp?: string;
  cnic?: string;
  city?: string;
  address?: string;
  dateOfBirth?: string;
  experience?: string;
  appliedAt?: string;
  approvedAt?: string;
  note?: string;
}
export interface BusinessInfo {
  status: ReviewStatus;
  companyName: string;
  businessType?: string;
  contactPhone?: string;
  city?: string;
  address?: string;
  ntn?: string;
  monthlyVolume?: string;
  notes?: string;
  appliedAt?: string;
  note?: string;
}
export interface KycInfo {
  status: 'pending' | 'approved' | 'rejected';
  method: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  cnic?: string;
  submittedAt?: string;
  note?: string;
}

export interface MemberProfile {
  accountType: 'customer' | 'partner' | 'business';
  memberCode: string | null;
  partner: PartnerInfo | null;
  business: BusinessInfo | null;
  kyc: KycInfo | null;
  loyaltyPoints: number;
  monthlyBV: number;
  lastMonthBV: number;
  totalBV: number;
  referredBV: number;
  wallet: WalletSummary;
  discountPct?: number;
  nextTier?: Tier | null;
  links?: { store: string; join: string; member: string };
  inviteCode?: string;
  inviteAlias?: string | null;
  sponsor?: { name: string; memberCode: string; phone?: string | null; email?: string };
  titleProgress?: TitleProgress;
  preferences: { shareContact: boolean; myWhy: string };
  welcomeDiscountPct: number;
  cashbackPct: number;
  settings: {
    referralCommissionPct: number;
    partnerDiscountTiers: Tier[];
    minWithdrawal: number;
    minRedeemPoints: number;
    pointValueRs: number;
    loyaltyRsPerPoint: number;
    wholesaleDefaultDiscountPct: number;
    wholesaleDefaultMinQty: number;
  };
}

export type Title = { name: string; minPersonalBV: number; minGroupBV: number; minRecruits: number };
export interface TitleProgress {
  title: string;
  personalBV: number;
  groupBV: number;
  recruits: number;
  next: Title | null;
  titles: Title[];
}

export interface TeamMember {
  _id: string;
  name: string;
  city: string;
  type: string;
  joinedAt: string;
  activated: boolean;
  monthOrders: number;
  monthSales: number;
  monthBV: number;
  allOrders: number;
  lastOrderAt: string | null;
  isNew: boolean;
  starter: boolean;
}

export interface Earnings {
  period: string;
  periods: string[];
  commission: { pending: number; available: number; cancelled: number };
  cashback: { pending: number; available: number };
  claimRefunds: number;
  reversals: number;
  adjustments: number;
  withdrawn: number;
  immediateDiscounts: number;
  estimated: number;
}

export interface Programme {
  referralCommissionPct: number;
  partnerDiscountTiers: Tier[];
  wholesaleDefaultDiscountPct: number;
  wholesaleDefaultMinQty: number;
  minWithdrawal: number;
  loyaltyRsPerPoint: number;
  pointValueRs: number;
  minRedeemPoints: number;
}

export interface WalletEntry {
  _id: string;
  type: string;
  amount: number;
  status: 'pending' | 'available' | 'cancelled';
  note?: string;
  orderNumber?: string;
  createdAt: string;
}

export interface Withdrawal {
  _id: string;
  user: string;
  name?: string;
  memberCode?: string;
  amount: number;
  status: 'requested' | 'paid' | 'rejected';
  method: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  reference?: string;
  note?: string;
  createdAt: string;
  processedAt?: string;
}

export interface WholesalePrice {
  productId: string;
  slug: string;
  name: string;
  image: string;
  retailPrice: number;
  price: number;
  minQty: number;
  stock: number;
}

export interface AdminMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  memberCode?: string;
  partner?: PartnerInfo;
  business?: BusinessInfo;
  kyc?: KycInfo;
  monthlyBV: number;
  totalBV: number;
  referredBV: number;
  loyaltyPoints: number;
  createdAt: string;
  sponsor?: { name: string; memberCode: string } | null;
  wallet?: WalletSummary;
}

export type MemberSettings = Programme & { rsPerBV: number; couponsForMembers: boolean; welcomeDiscountPct: number; cashbackPct: number; claimWindowDays: number; titles: Title[] };

export interface Quote {
  buyerType: 'customer' | 'partner' | 'business';
  discountPct: number;
  items: { product: string; name: string; image?: string; quantity: number; retailPrice: number; price: number; total: number; bv: number }[];
  notices: string[];
  retailSubtotal: number;
  memberDiscount: number;
  subtotal: number;
  shippingCost: number | null;
  couponCode?: string;
  couponError?: string;
  discount: number;
  welcomeDiscount: number;
  welcomeDiscountPct: number;
  cashback: number;
  cashbackPct: number;
  pointsBalance: number;
  pointsRedeemed: number;
  pointsValue: number;
  pointsEarned: number;
  minRedeemPoints: number;
  walletAvailable: number;
  walletUsed: number;
  total: number;
  amountDue: number;
  bv: number;
  referredBy: string | null;
}

const d = <T>(p: Promise<{ data: { data: T } }>) => p.then((r) => r.data.data);

export const memberApi = {
  me: () => d<MemberProfile>(api.get('/members/me')),
  programme: () => d<Programme>(api.get('/members/programme')),
  checkRef: (code: string) => d<{ valid: boolean; name?: string; memberCode?: string }>(api.get(`/members/ref/${encodeURIComponent(code)}`)),
  applyPartner: (body: Record<string, unknown>) => d<MemberProfile>(api.post('/members/partner/apply', body)),
  applyBusiness: (body: Record<string, unknown>) => d<MemberProfile>(api.post('/members/business/apply', body)),
  submitKyc: (body: Record<string, unknown>) => d<MemberProfile>(api.post('/members/kyc', body)),
  referrals: () =>
    d<{ people: { _id: string; name: string; joinedAt: string; type: string; orders: number; commission: number }[]; guestOrders: { orders: number; commission: number } }>(
      api.get('/members/referrals')
    ),
  wallet: () => d<{ summary: WalletSummary; entries: WalletEntry[]; withdrawals: Withdrawal[] }>(api.get('/members/wallet')),
  withdraw: (amount: number) => d<Withdrawal>(api.post('/members/withdrawals', { amount })),
  wholesalePrices: () => d<WholesalePrice[]>(api.get('/members/wholesale-prices')),
  quote: (body: Record<string, unknown>) => d<Quote>(api.post('/orders/quote', body)),
  setInviteCode: (code: string) => d<MemberProfile>(api.put('/members/invite-code', { code })),
  setPreferences: (body: { shareContact?: boolean; myWhy?: string }) => d<MemberProfile>(api.put('/members/preferences', body)),
  team: (filter = 'all') => d<{ people: TeamMember[]; totals: { people: number; active: number; newThisMonth: number; monthSales: number; monthBV: number }; month: string }>(api.get('/members/team', { params: { filter } })),
  earnings: (period?: string) => d<Earnings>(api.get('/members/earnings', { params: { period } })),
  recognition: () => d<{ month: string; list: { rank: number; name: string; city: string; groupBV: number; title: string; isMe: boolean }[] }>(api.get('/members/recognition')),
  outOfStock: () => d<{ _id: string; name: string; slug: string; sku?: string; image: string; stock: number; variantsOut: string[] }[]>(api.get('/members/out-of-stock')),
  registerFriend: (body: Record<string, unknown>) => d<{ _id: string; name: string; activationLink: string; expiresInDays: number }>(api.post('/members/register-friend', body)),
  registered: () => d<{ _id: string; name: string; email: string; phone?: string; createdAt: string; activated: boolean; expired: boolean }[]>(api.get('/members/registered')),
  newActivationLink: (id: string) => d<{ activationLink: string; expiresInDays: number }>(api.post(`/members/registered/${id}/link`, {})),

  admin: {
    overview: () =>
      d<{ partners: number; partnerPending: number; businesses: number; businessPending: number; kycPending: number; commissionPending: number; commissionReleased: number; walletLiability: number; withdrawalsRequested: number; withdrawalsRequestedAmount: number }>(
        api.get('/members/admin/overview')
      ),
    list: (kind: 'partner' | 'business' | 'kyc', status?: string) => d<AdminMember[]>(api.get('/members/admin/list', { params: { kind, status } })),
    decide: (userId: string, kind: 'partner' | 'business' | 'kyc', action: string, note?: string) =>
      d<AdminMember>(api.post(`/members/admin/${userId}/${kind}`, { action, note })),
    withdrawals: (status?: string) => d<Withdrawal[]>(api.get('/members/admin/withdrawals', { params: { status } })),
    payout: (id: string, action: 'paid' | 'reject', reference?: string, note?: string) =>
      d<Withdrawal>(api.post(`/members/admin/withdrawals/${id}`, { action, reference, note })),
    commissions: (status?: string) => d<(WalletEntry & { partner?: { name: string; memberCode: string } })[]>(api.get('/members/admin/commissions', { params: { status } })),
    adjust: (userId: string, amount: number, note: string) => d<WalletSummary>(api.post('/members/admin/wallet-adjust', { userId, amount, note })),
    settings: () => d<MemberSettings>(api.get('/members/admin/settings')),
    saveSettings: (body: MemberSettings) => d<MemberSettings>(api.put('/members/admin/settings', body)),
    reallocate: (userId: string, sponsorCode: string, note: string) => d<AdminMember>(api.post('/members/admin/reallocate', { userId, sponsorCode, note })),
    closeMonth: () => d<{ period: string; members: number }>(api.post('/members/admin/close-month', {})),
  },
};

/** Pull a readable message out of an API error. */
export const apiError = (err: unknown, fallback = 'Something went wrong. Please try again.') =>
  (err as { response?: { data?: { message?: string; errors?: { message: string }[] } } })?.response?.data?.errors?.[0]?.message ||
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  fallback;
