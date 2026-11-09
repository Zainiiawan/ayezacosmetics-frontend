'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Category } from '@/lib/api/categoryApi';
import { optimizeCloudinaryUrl } from '@/lib/utils';

const INTERVAL_MS = 5000;

/**
 * Every category as a row of whole cards: two on a phone, three on a tablet,
 * four on a laptop. Swipe or use the arrows; it snaps to whole cards, so no
 * card is ever left half on screen.
 */
export default function CategorySlider({ categories }: { categories: Category[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setPages(Math.max(1, Math.round(el.scrollWidth / el.clientWidth)));
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, categories.length]);

  const goTo = useCallback((p: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: p * el.clientWidth, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (paused || pages < 2) return;
    const id = window.setInterval(() => goTo((page + 1) % pages), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [goTo, page, pages, paused]);

  const card = 'snap-start shrink-0 w-[calc((100%-0.75rem)/2)] md:w-[calc((100%-2*1.25rem)/3)] lg:w-[calc((100%-3*1.5rem)/4)]';

  return (
    <div
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={track}
        onScroll={measure}
        className="flex gap-3 md:gap-5 lg:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Categories"
      >
        {categories.map((c) => (
          <Link key={c._id} href={`/categories/${c.slug}`} className={`${card} group block`}>
            <div className="relative aspect-[4/5] bg-blush overflow-hidden">
              {c.image?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={optimizeCloudinaryUrl(c.image.url, 700, false)}
                  alt={c.name}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
              )}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <h3 className="font-serif text-[1rem] sm:text-[1.2rem] text-ink capitalize leading-snug">{c.name.toLowerCase()}</h3>
              <ArrowRight className="w-5 h-5 shrink-0 text-crimson transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
        <Link href="/shop" className={`${card} group block`}>
          <div className="relative aspect-[4/5] bg-crimson text-white flex flex-col items-center justify-center p-5 text-center">
            <p className="font-urdu text-[1.4rem] sm:text-[1.8rem]" lang="ur" dir="rtl">
              سب دیکھیں
            </p>
            <p className="mt-1 font-serif text-[1.15rem] sm:text-[1.6rem] leading-tight">Shop everything</p>
            <span className="mt-4 sm:mt-6 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white text-crimson flex items-center justify-center transition-transform group-hover:scale-110">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <h3 className="font-serif text-[1rem] sm:text-[1.2rem] text-ink">All products</h3>
            <ArrowRight className="w-5 h-5 shrink-0 text-crimson transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" onClick={() => goTo(Math.max(0, page - 1))} disabled={page === 0} className="w-10 h-10 rounded-full border border-ink/20 text-ink hover:text-crimson hover:border-crimson disabled:opacity-30 flex items-center justify-center" aria-label="Previous categories">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2" role="tablist" aria-label="Category pages">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === page}
                aria-label={`Page ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === page ? 'w-8 bg-crimson' : 'w-3 bg-crimson/30'}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => goTo(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1} className="w-10 h-10 rounded-full border border-ink/20 text-ink hover:text-crimson hover:border-crimson disabled:opacity-30 flex items-center justify-center" aria-label="Next categories">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
