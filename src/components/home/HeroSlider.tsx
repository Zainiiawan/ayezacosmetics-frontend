'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, m as motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/api/productApi';
import { Slide } from '@/lib/api/slideApi';
import { optimizeCloudinaryUrl } from '@/lib/utils';

const INTERVAL_MS = 6000;
const MAX_SLIDES = 10;

const mainImage = (p: Product) => (p.images?.find((i) => i.isMain) || p.images?.[0])?.url;

// full-screen 1920x1080 banners for laptops and desktops; phones and tablets show the product's poster
const BANNERS: Record<string, string> = {
  'ayeza-radiance-face-wash': '/brand/banners/radiance-face-wash.jpg',
  'ayeza-beauty-cream': '/brand/banners/beauty-cream.jpg',
  'azeeora-radiance-face-wash': '/brand/banners/radiance-face-wash.jpg',
  'azeeora-beauty-cream': '/brand/banners/beauty-cream.jpg',
  'azeeora-hair-growth-serum-30ml': '/brand/banners/hair-serum.jpg',
  'hair-serum': '/brand/banners/hair-serum.jpg',
  'azeeora-hair-serum': '/brand/banners/hair-serum.jpg',
  'azeeora-glutathione-skin-polish-kit-or-oxidizing-emulsion-and-dust-free-blonder-powder': '/brand/banners/skin-polish.jpg',
  'azeeora-glutathione-skin-polish-kit': '/brand/banners/skin-polish.jpg',
  'skin-polish': '/brand/banners/skin-polish.jpg',
};

const getBanner = (slug: string): string | undefined => {
  if (BANNERS[slug]) return BANNERS[slug];
  const s = slug.toLowerCase();
  if (s.includes('serum') || s.includes('hair')) return '/brand/banners/hair-serum.jpg';
  if (s.includes('polish')) return '/brand/banners/skin-polish.jpg';
  if (s.includes('cream')) return '/brand/banners/beauty-cream.jpg';
  if (s.includes('wash') || s.includes('cleanser')) return '/brand/banners/radiance-face-wash.jpg';
  return undefined;
};

interface HeroItem {
  key: string;
  href?: string;
  label: string;
  /** shown on laptops and desktops */
  wide: string;
  /** shown on phones and tablets */
  narrow: string;
  /** the phone image was made for a phone screen, so it may fill the frame */
  narrowFills: boolean;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

const fromSlide = (s: Slide): HeroItem => ({
  key: s._id,
  href: s.link
    ? s.link.replace(/\/products\/ayeza-/gi, '/products/azeeora-').replace(/^ayeza-/i, 'azeeora-')
    : undefined,
  label: s.title || 'AZEEORA',
  wide: optimizeCloudinaryUrl(s.image.url, 1920, false),
  narrow: optimizeCloudinaryUrl((s.mobileImage ?? s.image).url, 1000, false),
  narrowFills: Boolean(s.mobileImage),
  title: s.title,
  subtitle: s.subtitle,
  buttonText: s.buttonText,
});

const fromProduct = (p: Product): HeroItem => {
  const poster = optimizeCloudinaryUrl(mainImage(p)!, 1600, false);
  const banner = getBanner(p.slug);
  const safeSlug = p.slug.replace(/^ayeza-/, 'azeeora-');
  return {
    key: p._id,
    href: `/products/${safeSlug}`,
    label: `${p.name}, view product`,
    wide: banner ?? poster,
    narrow: poster,
    narrowFills: true,
  };
};

/**
 * Homepage hero. Slides added in Admin → Slides come first; until there
 * are any, every product gets a slide on its own, so the hero is never empty.
 */
export default function HeroSlider({ slides: adminSlides = [], products }: { slides?: Slide[]; products: Product[] }) {
  const items = (
    adminSlides.length ? adminSlides.map(fromSlide) : products.filter((p) => mainImage(p)).map(fromProduct)
  ).slice(0, MAX_SLIDES);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = items.length;
  const current = items[count ? index % count : 0];

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

  const hasText = Boolean(current.title || current.subtitle || current.buttonText);
  const body = (
    <>
      <picture>
        <source media="(min-width: 1024px)" srcSet={current.wide} />
        <img
          src={current.narrow}
          alt={current.title || current.label}
          className={`w-full h-full ${current.narrowFills ? 'object-cover' : 'object-contain'} lg:object-cover`}
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
      </picture>
      {hasText && (
        <div className="absolute inset-0 flex items-end sm:items-center bg-gradient-to-t sm:bg-gradient-to-r from-ink/85 via-ink/45 to-ink/5">
          <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-16 lg:px-24 pb-14 sm:pb-0">
            <div className="max-w-xl text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
              {current.title && <h2 className="text-white font-serif text-[1.7rem] sm:text-[2.6rem] lg:text-[3.4rem] leading-[1.08]">{current.title}</h2>}
              {current.subtitle && <p className="mt-3 text-[0.92rem] sm:text-[1.05rem] text-white/90 leading-relaxed">{current.subtitle}</p>}
              {current.buttonText && current.href && (
                <span className="mt-5 inline-flex items-center gap-2 bg-white text-ink px-6 py-3 text-[0.75rem] uppercase tracking-[0.16em] font-medium">
                  {current.buttonText} <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <section
      // exactly one screen tall under the fixed header, so nothing peeks in half-cut below it
      className="relative overflow-hidden bg-tile h-[calc(100svh-98px)] lg:h-[calc(100svh-110px)] min-h-[420px]"
      aria-roledescription="carousel"
      aria-label="Featured"
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
          key={current.key}
          className="absolute inset-0"
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {current.href ? (
            <Link href={current.href} className="absolute inset-0 block" aria-label={current.label}>
              {body}
            </Link>
          ) : (
            <div className="absolute inset-0">{body}</div>
          )}
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 text-ink hover:text-crimson flex items-center justify-center shadow-sm" aria-label="Previous slide">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => go(1)} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/85 text-ink hover:text-crimson flex items-center justify-center shadow-sm" aria-label="Next slide">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 rounded-full px-3 py-2" role="tablist" aria-label="Choose a slide">
            {items.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show slide ${i + 1}`}
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
