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
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3ead8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23b8892b'%3EAZEEORA%3C/text%3E%3C/svg%3E";

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

  return (
    <motion.div
      className={cn('group h-full flex flex-col', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative rounded-t-[999px] rounded-b-[22px] overflow-hidden bg-white border border-gold/25 group-hover:border-gold/60 shadow-[0_24px_44px_-34px_rgba(15,59,46,0.9)] transition-colors duration-500">
        {product.isComingSoon ? (
          <div className="absolute top-[18%] left-3 bg-gold text-emerald text-[10px] font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-[0.14em]">
            Coming soon
          </div>
        ) : discountDisplay ? (
          <div className="absolute top-[18%] left-3 bg-rani text-white text-[11px] font-bold px-3 py-1.5 rounded-full z-10 tracking-wide">
            {discountDisplay}
          </div>
        ) : product.isFeatured ? (
          <div className="absolute top-[18%] left-3 bg-emerald text-gold-soft text-[10px] font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-[0.14em]">
            Featured
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleWishlistToggle}
          className={cn(
            'absolute top-[18%] right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full border backdrop-blur transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
            isWishlisted ? 'bg-rani border-rani text-white' : 'bg-white/90 border-gold/30 text-emerald hover:text-rani'
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          <Heart className={cn('w-[18px] h-[18px] transition-transform duration-200', isWishlisted ? 'fill-current scale-110' : 'fill-none')} />
        </button>

        <Link href={`/products/${product.slug}`} className="block aspect-[4/5] overflow-hidden bg-sand" aria-label={product.name}>
          <img
            src={imageSrc}
            {...(imageSrcSet ? { srcSet: imageSrcSet, sizes: '(max-width: 768px) 50vw, 25vw' } : {})}
            alt={mainImage?.alt || product.name}
            className={cn('w-full h-full object-cover transition-transform duration-[1.1s]', isHovered ? 'scale-105' : 'scale-100')}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER;
            }}
          />
        </Link>

        <div className="p-2.5 sm:p-3 flex gap-2 bg-white">
          {product.isComingSoon ? (
            <button type="button" disabled className="w-full bg-sand text-gray-500 py-2.5 rounded-full text-[0.78rem] font-semibold uppercase tracking-[0.12em] cursor-not-allowed">
              Coming soon
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-11 shrink-0 border border-emerald/25 text-emerald hover:bg-emerald hover:text-ivory py-2.5 rounded-full transition-colors flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                title="Add to bag"
                aria-label={`Add ${product.name} to bag`}
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/checkout?buyNow=true&productId=${product._id}`);
                }}
                className="flex-1 bg-emerald hover:bg-jade text-ivory py-2.5 rounded-full text-[0.78rem] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Buy now
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 px-1 text-center">
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn('w-3.5 h-3.5', i < Math.floor(product.rating) ? 'fill-gold text-gold' : 'text-gray-300')} />
          ))}
          <span className="text-[0.75rem] text-gray-500 ml-1">({product.reviewCount})</span>
        </div>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1.5 font-serif text-[1.08rem] sm:text-[1.15rem] text-emerald hover:text-gold transition-colors line-clamp-2 leading-snug">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <span className="font-semibold text-emerald">{formatPrice(effectivePrice)}</span>
          {product.basePrice > effectivePrice && <span className="text-sm text-gray-500 line-through">{formatPrice(product.basePrice)}</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
