import { ApiCart } from '@/lib/api/cartApi';
import { CartItem } from '@/store/slices/cartSlice';

export function mapApiCartToReduxItems(cart: ApiCart): CartItem[] {
  return (cart.items ?? []).map((item) => ({
    product: {
      _id: String(item.product),
      name: item.name,
      slug: item.slug ?? '',
      images: item.image ? [{ url: item.image, alt: item.name }] : [],
      // compareAtPrice is the original price before discount; fallback to price if not set
      basePrice: item.compareAtPrice ?? item.price,
    },
    variant: item.variant,
    quantity: item.quantity,
    price: item.price,      // discounted/effective price
    total: item.total,      // price * quantity
  }));
}
