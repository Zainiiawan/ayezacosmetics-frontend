'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, m as motion } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Product } from '@/lib/api/productApi';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';
import { getEffectivePrice } from '@/lib/productUtils';
import { productBenefits, productUses } from '@/lib/productHighlights';

const INTERVAL_MS = 7000;

const mainImage = (p: Product) => (p.images?.find((i) => i.isMain) || p.images?.[0])?.url;

/**
 * Every product in the catalogue, one slide each: its photo, what it is
 * for and its main benefits. New products from the admin panel join on their own.
 */
export default function ProductShowcase({ products }: { products: Product[] }) {
  const slides = products.filter((p) => mainImage(p));
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const p = slides[count ? index % count : 0];

  const go = useCallback(
    (step: number) => {
      if (count < 2) return;
      setDirection(step);
      setIndex((i) => (i + step + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setInterval(() => go(1), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [go, paused, count, index]);

  if (!p) return null;

  const price = getEffectivePrice(p);
  const was = p.compareAtPrice && p.compareAtPrice > price ? p.compareAtPrice : price < p.basePrice ? p.basePrice : undefined;
  const benefits = productBenefits(p);
  const uses = productUses(p);
  const soldOut = !p.isComingSoon && p.stock <= 0;

  return (
    <section className="bg-blush" aria-roledescription="carousel" aria-label="Our products">
      <div
        className="relative max-w-[1440px] mx-auto px-5 lg:px-10 py-10 sm:py-14 lg:py-16"
        onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="eyebrow text-crimson">Our products</p>
            <h2 className="mt-2 font-serif text-[1.7rem] sm:text-[2.3rem] text-ink leading-tight">What each one does for your skin</h2>
          </div>
          {count > 1 && (
            <div className="hidden sm:flex gap-2 shrink-0">
              <button type="button" onClick={() => go(-1)} className="w-11 h-11 rounded-full border border-ink/20 bg-white text-ink hover:text-crimson hover:border-crimson flex items-center justify-center" aria-label="Previous product">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => go(1)} className="w-11 h-11 rounded-full border border-ink/20 bg-white text-ink hover:text-crimson hover:border-crimson flex items-center justify-center" aria-label="Next product">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden bg-white min-h-[560px] sm:min-h-0 sm:h-[460px] lg:h-[520px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={p._id}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="grid sm:grid-cols-[1fr_1.1fr] items-stretch sm:h-full"
            >
              <Link href={`/products/${p.slug}`} className="block bg-tile aspect-square sm:aspect-auto sm:h-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={optimizeCloudinaryUrl(mainImage(p)!, 1000, false)} alt={p.name} className="w-full h-full object-cover" />
              </Link>

              <div className="p-5 sm:p-8 lg:p-12 flex flex-col justify-center sm:overflow-y-auto">
                {p.reviewCount > 0 && (
                  <p className="flex items-center gap-1 text-[0.8rem] text-muted">
                    <Star className="w-3.5 h-3.5 fill-crimson text-crimson" /> {p.rating.toFixed(1)} · {p.reviewCount} review{p.reviewCount === 1 ? '' : 's'}
                  </p>
                )}
                <h3 className="mt-2 font-serif text-[1.5rem] sm:text-[2rem] text-ink leading-tight">{p.name}</h3>
                {uses && <p className="mt-3 text-[0.92rem] sm:text-[1rem] text-gray-600 leading-relaxed">{uses}</p>}

                {benefits.length > 0 && (
                  <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[0.85rem] sm:text-[0.92rem] text-ink">
                        <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-blush text-crimson flex items-center justify-center">
                          <Check className="w-3 h-3" strokeWidth={2.5} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6 flex items-baseline gap-3">
                  <span className="text-[1.35rem] font-medium text-crimson">{formatPrice(price)}</span>
                  {was && <span className="text-[0.95rem] text-muted line-through">{formatPrice(was)}</span>}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {!soldOut && !p.isComingSoon && (
                    <Link href={`/checkout?buyNow=true&productId=${p._id}`} className="inline-flex items-center gap-2 bg-crimson text-white px-6 py-3 text-[0.75rem] uppercase tracking-[0.16em] font-medium hover:bg-crimson-deep transition-colors">
                      Buy now <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-2 border border-ink px-6 py-3 text-[0.75rem] uppercase tracking-[0.16em] font-medium text-ink hover:bg-ink hover:text-white transition-colors">
                    {soldOut ? 'Sold out, view' : p.isComingSoon ? 'Coming soon' : 'Details'}
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {count > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Choose a product">
            {slides.map((s, i) => (
              <button
                key={s._id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${s.name}`}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-crimson' : 'w-3 bg-crimson/30 hover:bg-crimson/60'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
