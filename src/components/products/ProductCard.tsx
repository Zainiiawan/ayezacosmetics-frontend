'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { cn, formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';
import { getDiscountPercentage, getEffectivePrice } from '@/lib/productUtils';
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
}

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f9f0f3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23c29375'%3EAYEZA%3C/text%3E%3C/svg%3E";

const ProductCard = ({ product, className }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const isWishlisted = useSelector((state: RootState) =>
    state.wishlist.items.some((item) => item._id === product._id)
  );

  const mainImage = product.images?.find((img) => img.isMain) || product.images?.[0];
  const effectivePrice = getEffectivePrice(product);
  const discountPercentage = getDiscountPercentage(product);
  const imageSrc = mainImage?.url ? optimizeCloudinaryUrl(mainImage.url, 600) : PLACEHOLDER;

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
      className={cn('group', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative bg-white rounded-xl overflow-hidden luxury-border">
        {product.isComingSoon ? (
          <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-md z-10 shadow-lg border border-orange-400/50 uppercase tracking-wider">
            Coming Soon
          </div>
        ) : discountPercentage > 0 ? (
          <div className="absolute top-3 left-3 bg-rose-gold-dark text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            -{discountPercentage}%
          </div>
        ) : null}

        {product.isFeatured && (
          <div className="absolute top-3 right-3 bg-black text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            Featured
          </div>
        )}

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10 transition-all duration-300 opacity-100 translate-x-0">
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={cn(
              'p-2.5 rounded-full shadow-lg border transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-gold',
              isWishlisted
                ? 'bg-rose-gold-dark border-rose-gold-dark text-white hover:bg-black'
                : 'bg-white border-gray-200 text-gray-800 hover:border-rose-gold-dark hover:text-rose-gold-dark'
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWishlisted}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isWishlisted ? 'fill-current scale-110' : 'fill-none'
              )}
            />
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="p-2.5 bg-white border border-gray-200 text-gray-800 rounded-full shadow-lg hover:border-rose-gold hover:text-rose-gold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-gold"
            aria-label="View product details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        <Link href={`/products/${product.slug}`} className="block aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageSrc}
            alt={mainImage?.alt || product.name}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500',
              isHovered ? 'scale-110' : 'scale-100'
            )}
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER;
            }}
          />
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-12 flex gap-2">
          {product.isComingSoon ? (
            <button
              type="button"
              disabled
              className="w-full bg-white/50 backdrop-blur-md text-white border border-white/20 shadow-lg py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed uppercase tracking-wider text-sm"
            >
              Coming Soon
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-lg py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                title="Add to Cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/checkout?buyNow=true&productId=${product._id}`);
                }}
                className="flex-[2] bg-rose-gold-dark hover:bg-black text-white shadow-lg py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Buy Now
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 hover:text-rose-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < Math.floor(product.rating) ? 'fill-rose-gold text-rose-gold' : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(effectivePrice)}</span>
          {product.basePrice > effectivePrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
