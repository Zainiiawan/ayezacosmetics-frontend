'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, m as motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/api/productApi';
import { optimizeCloudinaryUrl } from '@/lib/utils';

const INTERVAL_MS = 6000;
const MAX_SLIDES = 8;

const mainImage = (p: Product) => (p.images?.find((i) => i.isMain) || p.images?.[0])?.url;

/**
 * Homepage hero: a full-screen poster per product in the catalogue, so
 * anything added in the admin panel shows up here on its own.
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

  return (
    <section
      className="relative overflow-hidden bg-blush h-[calc(100svh-98px)] lg:h-[calc(100svh-110px)] min-h-[420px] max-h-[900px]"
      aria-roledescription="carousel"
      aria-label="Our products"
      // pause while a mouse rests on it; taps on phones should not stop the slideshow
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
      <AnimatePresence initial={false}>
        <motion.div
          key={current._id}
          className="absolute inset-0"
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={`/products/${current.slug}`} className="absolute inset-0 block" aria-label={`${current.name}, view product`}>
            {/* soft blurred fill so wide screens never show empty bands */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={optimizeCloudinaryUrl(mainImage(current)!, 600, false)} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60" />
            {/* the poster itself, never cropped */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={optimizeCloudinaryUrl(mainImage(current)!, 1600, false)}
              alt={current.name}
              className="relative w-full h-full object-contain"
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 text-ink hover:text-crimson flex items-center justify-center shadow-sm" aria-label="Previous product">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => go(1)} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 text-ink hover:text-crimson flex items-center justify-center shadow-sm" aria-label="Next product">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 rounded-full px-3 py-2" role="tablist" aria-label="Choose a product">
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
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-crimson' : 'w-3 bg-crimson/30 hover:bg-crimson/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
