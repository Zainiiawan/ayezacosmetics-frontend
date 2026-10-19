'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, m as motion } from 'framer-motion';
import { ArrowRight, Banknote, ChevronLeft, ChevronRight, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '@/lib/api/productApi';
import { getEffectivePrice } from '@/lib/productUtils';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';

const INTERVAL_MS = 6000;
const MAX_SLIDES = 8;

const mainImage = (p: Product) => (p.images?.find((i) => i.isMain) || p.images?.[0])?.url;

/** Plain-text summary of a product for the slide, from the short or full description. */
function blurb(p: Product) {
  const raw = p.shortDescription || p.description || '';
  const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= 170) return text;
  return text.slice(0, 170).replace(/\s+\S*$/, '') + '…';
}

/**
 * Homepage hero: one slide per product in the catalogue, so anything added
 * in the admin panel shows up here on its own.
 */
export default function HeroSlider({ products }: { products: Product[] }) {
  const slides = products.filter((p) => mainImage(p)).slice(0, MAX_SLIDES);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const current = slides[count ? index % count : 0];

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

  if (!current) return null;

  const price = getEffectivePrice(current);
  const onSale = current.basePrice > price;
  const category = typeof current.category === 'object' ? current.category?.name : undefined;
  const isFirst = index === 0;

  return (
    <section
      className="bg-blush relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Our products"
      // pause while a mouse rests on it; taps on phones should not stop the slideshow
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 items-stretch min-h-[560px] lg:min-h-[640px]">
        {/* text */}
        <div className="relative px-6 lg:px-16 py-12 lg:py-20 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current._id}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow text-crimson">
                {category ? category : 'AZEEORA'}
                {onSale && <span className="ml-3 text-ink">· Save {formatPrice(current.basePrice - price)}</span>}
              </p>
              <h2 className="mt-5 font-serif text-[2.2rem] leading-[1.08] sm:text-[3rem] lg:text-[3.6rem] text-ink">{current.name}</h2>
              {blurb(current) && <p className="mt-4 text-[1rem] text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">{blurb(current)}</p>}
              <p className="mt-5 text-[1.4rem] text-ink">
                <span className={onSale ? 'text-crimson font-medium' : 'font-medium'}>{formatPrice(price)}</span>
                {onSale && <span className="ml-3 text-[1rem] text-gray-500 line-through">{formatPrice(current.basePrice)}</span>}
              </p>
              <div className="mt-7 flex flex-wrap gap-3 justify-center lg:justify-start">
                {current.isComingSoon ? (
                  <span className="inline-flex items-center px-8 py-4 rounded-full bg-white text-ink uppercase tracking-[0.12em] text-[0.8rem] font-medium">Coming soon</span>
                ) : (
                  <Link
                    href={`/checkout?buyNow=true&productId=${current._id}`}
                    className="group inline-flex items-center gap-2 bg-crimson text-white px-8 py-4 rounded-full font-medium uppercase tracking-[0.12em] text-[0.8rem] hover:bg-crimson-deep transition-colors"
                  >
                    Buy now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                <Link
                  href={`/products/${current.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium uppercase tracking-[0.12em] text-[0.8rem] text-ink bg-white hover:text-crimson transition-colors"
                >
                  View details
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 justify-center lg:justify-start text-[0.85rem] text-gray-600">
            <span className="inline-flex items-center gap-2"><Banknote className="w-4 h-4 text-crimson" /> Cash on delivery</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-crimson" /> Cruelty-free</span>
            <span className="inline-flex items-center gap-2"><Truck className="w-4 h-4 text-crimson" /> All over Pakistan</span>
          </div>

          {count > 1 && (
            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
              <button type="button" onClick={() => go(-1)} className="w-10 h-10 rounded-full bg-white text-ink hover:text-crimson flex items-center justify-center" aria-label="Previous product">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2" role="tablist" aria-label="Choose a product">
                {slides.map((p, i) => (
                  <button
                    key={p._id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Show ${p.name}`}
                    onClick={() => {
                      setDirection(i > index ? 1 : -1);
                      setIndex(i);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-crimson' : 'w-3 bg-crimson/25 hover:bg-crimson/50'}`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} className="w-10 h-10 rounded-full bg-white text-ink hover:text-crimson flex items-center justify-center" aria-label="Next product">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* image */}
        <div className="relative order-1 lg:order-2 min-h-[380px] sm:min-h-[460px] lg:min-h-0 bg-white overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={current._id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={optimizeCloudinaryUrl(mainImage(current)!, 1200, false)}
                alt={current.name}
                className="w-full h-full object-cover"
                fetchPriority={isFirst ? 'high' : 'auto'}
              />
            </motion.div>
          </AnimatePresence>
          {count > 1 && (
            <span className="absolute top-4 right-4 bg-white/90 text-ink text-[0.75rem] tracking-[0.12em] px-3 py-1.5" aria-live="polite">
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
