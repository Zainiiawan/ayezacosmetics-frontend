'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Banknote, FileText, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { categoryApi, Category } from '@/lib/api/categoryApi';
import { productApi, Product } from '@/lib/api/productApi';
import { settingsApi } from '@/lib/api/settingsApi';
import { slideApi, Slide } from '@/lib/api/slideApi';
import HeroSlider from '@/components/home/HeroSlider';
import CategorySlider from '@/components/home/CategorySlider';
import { formatPrice, optimizeCloudinaryUrl } from '@/lib/utils';

const imgOf = (p?: Product) => (p?.images?.find((i) => i.isMain) || p?.images?.[0])?.url;

/**
 * Homepage, top to bottom: the slideshow (one full screen), every category,
 * a short About, then the store policies.
 */
export default function HomeClient({
  initialCategories,
  initialProducts,
  initialSlides,
}: {
  initialCategories: Category[];
  initialProducts: Product[];
  initialSlides: Slide[];
}) {
  const { data: categories = initialCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
    initialData: initialCategories,
    staleTime: 0,
    refetchOnMount: true,
  });
  const { data: productData } = useQuery({
    queryKey: ['home-products'],
    queryFn: () => productApi.getAll({ page: 1, limit: 50, sortBy: 'bestselling' }),
    initialData: initialProducts.length ? { products: initialProducts, pagination: undefined as never } : undefined,
  });
  const { data: slides = initialSlides } = useQuery({
    queryKey: ['home-slides'],
    queryFn: slideApi.getActive,
    initialData: initialSlides,
    staleTime: 0,
    refetchOnMount: true,
  });
  const { data: settings } = useQuery({ queryKey: ['store-settings'], queryFn: settingsApi.getSettings, staleTime: 10 * 60_000 });

  const products = productData?.products ?? [];
  const live = products.filter((p) => !p.isComingSoon);
  const aboutImage = imgOf(live[0] ?? products[0]);
  const freeOver = settings?.freeShippingThreshold;

  const policies = [
    { href: '/shipping', icon: Truck, title: 'Shipping policy', text: freeOver ? `Delivery in 3 to 5 working days, free over ${formatPrice(freeOver)}.` : 'Delivery in 3 to 5 working days, all over Pakistan.' },
    { href: '/refunds', icon: RotateCcw, title: 'Refund & returns', text: 'Easy 14-day returns on unopened products.' },
    { href: '/terms', icon: FileText, title: 'Terms of service', text: 'How orders, prices and payments work.' },
    { href: '/privacy', icon: ShieldCheck, title: 'Privacy policy', text: 'What we collect and how we keep it safe.' },
  ];

  const sectionTitle = 'mt-3 font-serif text-[1.9rem] sm:text-[2.5rem] text-ink leading-tight';

  return (
    <div className="flex flex-col bg-white">
      {/* ---------------- Slideshow: admin slides, else one per product ---------------- */}
      <h1 className="sr-only">AZEEORA skincare and beauty, made for Pakistani skin</h1>
      {slides.length > 0 || products.length > 0 ? (
        <HeroSlider slides={slides} products={live.length ? live : products} />
      ) : (
        <section className="bg-blush h-[calc(100svh-98px)] lg:h-[calc(100svh-110px)] min-h-[420px] flex items-center justify-center text-center px-6">
          <div>
            <p className="eyebrow text-crimson">Made for Pakistani skin</p>
            <p className="mt-5 font-serif text-[2.4rem] sm:text-[3.6rem] text-ink leading-[1.08]">Your glow, in its truest light.</p>
            <Link href="/shop" className="mt-8 inline-flex items-center gap-2 bg-crimson text-white px-8 py-4 rounded-full uppercase tracking-[0.12em] text-[0.8rem] font-medium hover:bg-crimson-deep transition-colors">
              Shop the collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ---------------- Categories ---------------- */}
      <section className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="eyebrow text-crimson">The collection</p>
          <h2 className={sectionTitle}>Shop by category</h2>
        </div>
        <CategorySlider categories={categories} />
      </section>

      {/* ---------------- About ---------------- */}
      <section className="bg-blush">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-12 sm:py-16 lg:py-20 grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="aspect-[4/3] md:aspect-[4/5] lg:aspect-[5/4] bg-white overflow-hidden">
            {aboutImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={optimizeCloudinaryUrl(aboutImage, 1000, false)} alt="AZEEORA skincare" className="w-full h-full object-cover" loading="lazy" />
            )}
          </div>
          <div>
            <p className="eyebrow text-crimson">About AZEEORA</p>
            <h2 className={sectionTitle}>Skincare made for Pakistani skin and weather</h2>
            <p className="mt-5 text-gray-600 leading-relaxed">
              AZEEORA started in Vehari with one simple idea: gentle, honest skincare that works through our heat, humidity, dust and dry winters. Every product is
              made to be easy to use every day, at a fair price.
            </p>
            <ul className="mt-6 space-y-3 text-[0.95rem] text-ink">
              <li className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-crimson shrink-0" strokeWidth={1.5} /> Cash on delivery all over Pakistan
              </li>
              <li className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-crimson shrink-0" strokeWidth={1.5} /> Delivery in 3 to 5 working days
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-crimson shrink-0" strokeWidth={1.5} /> Cruelty-free, never tested on animals
              </li>
            </ul>
            <Link href="/about" className="mt-8 inline-flex items-center gap-2 border border-ink px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.16em] font-medium text-ink hover:bg-ink hover:text-white transition-colors">
              Read our story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Policies ---------------- */}
      <section className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="eyebrow text-crimson">Shop with confidence</p>
          <h2 className={sectionTitle}>Our policies</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {policies.map(({ href, icon: Icon, title, text }) => (
            <Link key={href} href={href} className="group bg-tile p-4 sm:p-6 flex flex-col hover:bg-blush transition-colors">
              <Icon className="w-6 h-6 text-crimson" strokeWidth={1.4} />
              <h3 className="mt-4 font-serif text-[1rem] sm:text-[1.2rem] text-ink leading-snug">{title}</h3>
              <p className="mt-1.5 text-[0.8rem] sm:text-[0.88rem] text-gray-600 leading-relaxed flex-1">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.14em] font-medium text-crimson">
                Read <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
