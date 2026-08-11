import { Product } from '@/lib/api/productApi';
import { formatPrice } from '@/lib/utils';

export function isDiscountActive(discount?: Product['discount']): boolean {
  if (!discount || !discount.type || discount.value == null || discount.value <= 0) return false;
  
  const now = new Date();
  
  if (discount.startDate) {
    const start = new Date(discount.startDate);
    if (!isNaN(start.getTime()) && start > now) return false;
  }
  
  if (discount.endDate) {
    const end = new Date(discount.endDate);
    if (!isNaN(end.getTime()) && end < now) return false;
  }
  
  return true;
}

export function getEffectivePrice(product: Pick<Product, 'basePrice' | 'discount'>): number {
  if (!isDiscountActive(product.discount)) return product.basePrice;
  const discount = product.discount!;
  if (discount.type === 'percentage') {
    return product.basePrice * (1 - discount.value / 100);
  }
  return Math.max(0, product.basePrice - discount.value);
}

export function getDiscountPercentage(
  product: Pick<Product, 'basePrice' | 'compareAtPrice' | 'discount'>
): number {
  const effectivePrice = getEffectivePrice(product);
  if (product.basePrice && product.basePrice > effectivePrice) {
    return Math.round(((product.basePrice - effectivePrice) / product.basePrice) * 100);
  }
  if (isDiscountActive(product.discount) && product.discount?.type === 'percentage') {
    return product.discount.value;
  }
  return 0;
}

export function getDiscountDisplay(product: Pick<Product, 'basePrice' | 'discount'>): string | null {
  if (!isDiscountActive(product.discount)) return null;
  const discount = product.discount!;
  if (discount.type === 'percentage') {
    return `-${discount.value}%`;
  }
  return `-${formatPrice(discount.value)}`;
}
