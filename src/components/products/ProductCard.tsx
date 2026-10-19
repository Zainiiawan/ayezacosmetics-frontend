'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { m as motion } from 'framer-motion';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { cn, formatPrice, optimizeCloudinaryUrl, getCloudinarySrcSet } from '@/lib/utils';
import { getDiscountPercentage, getEffectivePrice, getDiscountDisplay } from '@/lib/productUtils';
import { useDispatch, useSelector } from 'react-redux';
import { addItem as addToCart } from '@/store/slices/cartSlice';
import { addItem as addToWishlist, removeItem as removeFromWishlist } from '@/store/slices/wishlistSlice';
import { RootState } from '@/store';
import { cartApi } from '@/lib/api/cartApi';
import { wishlistApi } from '@/lib/api/wishlistApi';
import { Product } from '@/lib/api/productApi';

interface ProductCardProps {
  product: Pick<
    Product,
    '_id' | 'name' | 'slug' | 'images' | 'basePrice' | 'rating' | 'reviewCount'
  > &
    Partial<Pick<Product, 'compareAtPrice' | 'isFeatured' | 'discount' | 'isComingSoon' | 'launchDate'>>;
  className?: string;
  priority?: boolean;
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23fbecef'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23c8213f'%3EAZEEORA%3C/text%3E%3C/svg%3E";

const ProductCard = ({ product, className, priority = false }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const isWishlisted = useSelector((state: RootState) =>
    state.wishlist.items.some((item) => item._id === product._id)
  );

  const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];
  const effectivePrice = getEffectivePrice(product);
  const discountDisplay = getDiscountDisplay(product);
  const imageSrc = mainImage?.url ? optimizeCloudinaryUrl(mainImage.url, 600, true) : PLACEHOLDER;
  const imageSrcSet = mainImage?.url ? getCloudinarySrcSet(mainImage.url, undefined, true) : '';

  const handleAddToCart = async () => {
    dispatch(
      addToCart({
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images ?? [],
          basePrice: product.basePrice,
        },
        quantity: 1,
        price: effectivePrice,
        total: effectivePrice,
      })
    );
    if (isAuthenticated) {
      try {
        await cartApi.addItem({ productId: product._id, quantity: 1 });
      } catch {
        // Redux state remains as optimistic UI
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      if (isAuthenticated) {
        try {
          await wishlistApi.remove(product._id);
        } catch {
          // best-effort sync
        }
      }
    } else {
      dispatch(
        addToWishlist({
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images ?? [],
          basePrice: product.basePrice,
          compareAtPrice: product.compareAtPrice,
          rating: product.rating,
          reviewCount: product.reviewCount,
        })
      );
      if (isAuthenticated) {
        try {
          await wishlistApi.add(product._id);
        } catch {
          // best-effort sync
        }
      }
    }
  };

  const badge = product.isComingSoon ? 'Coming soon' : discountDisplay ? discountDisplay : product.isFeatured ? 'Featured' : null;
  const onSale = product.basePrice > effectivePrice;
  const iconBtn =
    'w-10 h-10 rounded-full bg-white text-ink flex items-center justify-center hover:text-crimson transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson';

  return (
    <motion.article
      className={cn('group flex flex-col', className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative bg-blush overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block aspect-square" aria-label={product.name}>
          <img
            src={imageSrc}
            {...(imageSrcSet ? { srcSet: imageSrcSet, sizes: '(max-width: 768px) 50vw, 25vw' } : {})}
            alt={mainImage?.alt || product.name}
            className={cn('w-full h-full object-cover transition-transform duration-700', isHovered ? 'scale-[1.04]' : 'scale-100')}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER;
            }}
          />
        </Link>

        {badge && (
          <span className={cn('absolute top-3 left-3 bg-white px-2.5 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.06em]', onSale && !product.isComingSoon ? 'text-crimson' : 'text-ink')}>
            {badge}
          </span>
        )}

        <div className="absolute right-3 bottom-3 flex flex-col gap-2">
          <button type="button" onClick={handleWishlistToggle} className={iconBtn} aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={isWishlisted}>
            <Heart className={cn('w-[18px] h-[18px]', isWishlisted && 'fill-current text-crimson')} strokeWidth={1.5} />
          </button>
          {!product.isComingSoon && (
            <button type="button" onClick={handleAddToCart} className={iconBtn} aria-label={`Add ${product.name} to bag`}>
              <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      <div className="pt-3.5 pb-6">
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-1.5" aria-label={`Rated ${product.rating} out of 5`}>
            <span className="flex text-crimson">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={cn('w-3.5 h-3.5', n <= Math.round(product.rating) ? 'fill-current' : 'text-gray-300')} strokeWidth={1} />
              ))}
            </span>
            <span className="text-[0.75rem] text-muted">({product.reviewCount})</span>
          </div>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif text-[1rem] sm:text-[1.08rem] text-ink leading-snug line-clamp-2 hover:text-crimson transition-colors">{product.name}</h3>
        </Link>
        <p className="mt-1.5 text-[0.95rem]">
          <span className={cn('font-medium', onSale ? 'text-crimson' : 'text-ink')}>{formatPrice(effectivePrice)}</span>
          {onSale && <span className="ml-2 text-muted line-through text-[0.85rem]">{formatPrice(product.basePrice)}</span>}
        </p>
        {!product.isComingSoon && (
          <button
            type="button"
            onClick={() => router.push(`/checkout?buyNow=true&productId=${product._id}`)}
            className="mt-2 text-[0.75rem] uppercase tracking-[0.14em] font-medium text-ink hover:text-crimson underline underline-offset-[6px] decoration-crimson/40"
          >
            Buy now
          </button>
        )}
      </div>
    </motion.article>
  );
};

export default ProductCard;
