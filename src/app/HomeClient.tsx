'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Banknote, Truck, RotateCcw, MessageCircle, Sun, Droplets, Sparkles, Wind, Moon, Leaf, Heart, ShieldCheck, Plus } from 'lucide-react';
import { categoryApi, Category } from '@/lib/api/categoryApi';
import { productApi, Product } from '@/lib/api/productApi';
import { settingsApi } from '@/lib/api/settingsApi';
import { blogPosts } from '@/lib/data/blog';
import ProductCard from '@/components/products/ProductCard';
import HeroSlider from '@/components/home/HeroSlider';
import { optimizeCloudinaryUrl, getCloudinarySrcSet, formatPrice } from '@/lib/utils';
import { getEffectivePrice } from '@/lib/productUtils';

// slide in only, never hidden: some in-app browsers (WhatsApp, Instagram) never report
// sections as in view, and content that waits on that would stay invisible
const fadeUp = {
  initial: { y: 18 },
  whileInView: { y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const concerns = [
  { icon: Droplets, title: 'Oily summers', text: 'Sweat, shine and clogged pores in the heat. Start with a clean, fresh face.', hint: 'face wash' },
  { icon: Sparkles, title: 'Dull, uneven tone', text: 'Pollution and late nights take the glow away. Bring back brightness, gently.', hint: 'cream' },
  { icon: Sun, title: 'Sun and dust', text: 'Long days outdoors? Cleanse well every evening and never skip sunscreen.', hint: '' },
  { icon: Wind, title: 'Dry winter skin', text: 'When the cold sets in, keep skin soft with a nourishing moisturiser.', hint: 'cream' },
];

const faqs = [
  {
    q: 'Are AZEEORA products safe for sensitive skin?',
    a: 'Our products are formulated with gentle, skin-loving ingredients. We still recommend a patch test on your inner arm before first use.',
  },
  {
    q: 'Do you offer cash on delivery?',
    a: 'Yes. Cash on delivery is available all over Pakistan, and you can also pay by JazzCash or Easypaisa.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders usually arrive in 3 to 5 working days across Pakistan. You can track your order any time from the Track Order page.',
  },
  {
    q: 'Are your products cruelty-free?',
    a: 'Yes. AZEEORA is cruelty-free: we never test our formulations or ingredients on animals.',
  },
];

const imgOf = (p?: Product) => (p?.images?.find((i) => i.isMain) || p?.images?.[0])?.url;

/** Small leaf sprig, the motif printed on the AZEEORA pack. */
function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 90" className={className} aria-hidden>
      <path d="M30 88 C30 60 30 30 30 4" stroke="currentColor" strokeWidth="1.2" fill="none" />
      {[14, 30, 46, 62].map((y, i) => (
        <g key={y}>
          <path d={`M30 ${y + 8} C${18 - i} ${y + 2} ${12 - i} ${y - 8} ${16 - i} ${y - 14} C${24} ${y - 8} ${28} ${y} 30 ${y + 8}Z`} fill="currentColor" opacity={0.85 - i * 0.12} />
          <path d={`M30 ${y + 14} C${42 + i} ${y + 8} ${48 + i} ${y - 2} ${44 + i} ${y - 8} C${36} ${y - 2} ${32} ${y + 6} 30 ${y + 14}Z`} fill="currentColor" opacity={0.7 - i * 0.12} />
        </g>
      ))}
    </svg>
  );
}

export default function HomeClient({ initialCategories, initialProducts }: { initialCategories: Category[]; initialProducts: Product[] }) {
  const { data: categories = initialCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
    initialData: initialCategories,
    staleTime: 0,
    refetchOnMount: true,
  });
  const { data: productData } = useQuery({
    queryKey: ['home-products'],
    queryFn: () => productApi.getAll({ page: 1, limit: 12, sortBy: 'bestselling' }),
    initialData: initialProducts.length ? { products: initialProducts, pagination: undefined as never } : undefined,
  });
  const { data: settings } = useQuery({ queryKey: ['store-settings'], queryFn: settingsApi.getSettings, staleTime: 10 * 60_000 });

  const products = productData?.products ?? [];
  const live = products.filter((p) => !p.isComingSoon);
  const hero = live[0] ?? products[0];
  const second = live[1] ?? products[1];
  const cleanser = products.find((p) => /wash|cleans/i.test(p.name)) ?? hero;
  const cream = products.find((p) => /cream|moist|lotion/i.test(p.name)) ?? second;
  const freeOver = settings?.freeShippingThreshold;

  const concernLink = (hint: string) => {
    const match = hint ? categories.find((c) => c.name.toLowerCase().includes(hint)) : undefined;
    return match ? `/categories/${match.slug}` : '/shop';
  };

  const perks = [
    { icon: Banknote, title: 'Cash on Delivery', text: 'Pay at your door, all over Pakistan' },
    { icon: Truck, title: freeOver ? `Free delivery over ${formatPrice(freeOver)}` : 'Fast delivery', text: 'Usually 3 to 5 working days' },
    { icon: RotateCcw, title: 'Easy 14-day returns', text: 'Unopened products, no fuss' },
    { icon: MessageCircle, title: 'WhatsApp support', text: '+92 306 0466911' },
  ];

  const sectionTitle = 'mt-3 font-serif text-[1.9rem] sm:text-[2.5rem] text-ink leading-tight';

  return (
    <div className="flex flex-col bg-white">
      {/* ---------------- Hero: one slide per product ---------------- */}
      {products.length > 0 ? (
        <>
          <h1 className="sr-only">AZEEORA skincare and beauty, made for Pakistani skin</h1>
          <HeroSlider products={live.length ? live : products} />
        </>
      ) : (
        <>
        <section className="bg-blush relative overflow-hidden">
          <Sprig className="absolute -left-4 top-10 w-16 text-petal rotate-[-18deg] hidden lg:block" />
          <Sprig className="absolute right-[46%] bottom-6 w-12 text-petal rotate-[160deg] hidden lg:block" />
          <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 items-stretch">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative px-6 lg:px-16 py-14 lg:py-24 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
              <p className="eyebrow text-crimson">Radiance · made for Pakistani skin</p>
              <h1 className="mt-6 font-serif text-[2.4rem] leading-[1.08] sm:text-[3.4rem] lg:text-[4.1rem] text-ink">
                Your glow,
                <br />
                in its <span className="text-crimson">truest</span> light.
              </h1>
              <p className="mt-4 font-urdu text-[1.5rem] sm:text-[1.7rem] text-crimson-deep" lang="ur" dir="rtl">
                چمکتی جلد، ہر موسم میں
              </p>
              <p className="mt-3 text-[1.05rem] text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Deep cleansing, hydrating and brightening care for heat, humidity and city dust. Honest prices, delivered to your door, pay when it arrives.
              </p>
              <div className="mt-9 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link href="/shop" className="group inline-flex items-center gap-2 bg-crimson text-white px-8 py-4 rounded-full font-medium uppercase tracking-[0.12em] text-[0.8rem] hover:bg-crimson-deep transition-colors">
                  Shop the collection
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#ritual" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium uppercase tracking-[0.12em] text-[0.8rem] text-ink bg-white hover:text-crimson transition-colors">
                  Find your ritual
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 justify-center lg:justify-start text-[0.85rem] text-gray-600">
                <span className="inline-flex items-center gap-2"><Banknote className="w-4 h-4 text-crimson" /> Cash on delivery</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-crimson" /> Cruelty-free</span>
                <span className="inline-flex items-center gap-2"><Truck className="w-4 h-4 text-crimson" /> All over Pakistan</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.1 }} className="relative order-1 lg:order-2 min-h-[420px] lg:min-h-[640px]">
              {imgOf(cleanser ?? hero) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={optimizeCloudinaryUrl(imgOf(cleanser ?? hero)!, 1200, false)}
                  alt={(cleanser ?? hero)?.name ?? 'AZEEORA'}
                  className="absolute inset-0 w-full h-full object-cover"
                  fetchPriority="high"
                />
              ) : null}
              {(cleanser ?? hero) && (
                <Link href={`/products/${(cleanser ?? hero)!.slug}`} className="absolute left-4 right-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[300px] bg-white/95 backdrop-blur p-4 flex items-center justify-between gap-4 hover:bg-white transition-colors">
                  <span className="min-w-0">
                    <span className="eyebrow !text-[0.6rem] text-crimson">Bestseller</span>
                    <span className="block font-serif text-[0.95rem] text-ink leading-snug mt-0.5 line-clamp-2">{(cleanser ?? hero)!.name}</span>
                  </span>
                  <span className="shrink-0 font-medium text-crimson">{formatPrice(getEffectivePrice((cleanser ?? hero)!))}</span>
                </Link>
              )}
            </motion.div>
          </div>
        </section>
        </>
      )}

      {/* ---------------- Perks ---------------- */}
      <section className="border-b border-line">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-0 lg:divide-x divide-line">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start sm:items-center gap-2.5 sm:gap-4 py-4 sm:py-6 lg:px-6 first:lg:pl-0">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-crimson shrink-0 mt-0.5 sm:mt-0" strokeWidth={1.4} />
              <span className="min-w-0">
                <span className="block font-medium text-[0.8rem] sm:text-[0.92rem] text-ink leading-snug">{title}</span>
                <span className="block text-[0.72rem] sm:text-[0.8rem] text-muted leading-snug">{text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-12 sm:py-16 lg:py-24">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
          <p className="eyebrow text-crimson">The collection</p>
          <h2 className={sectionTitle}>Shop by category</h2>
        </motion.div>
        <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
          {categories.map((c, i) => (
            <motion.div key={c._id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <Link href={`/categories/${c.slug}`} className="group block">
                <div className="relative aspect-[4/5] bg-blush overflow-hidden">
                  {c.image?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={optimizeCloudinaryUrl(c.image.url, 800, false)}
                      srcSet={getCloudinarySrcSet(c.image.url) || undefined}
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
                  <h3 className="font-serif text-[1rem] sm:text-[1.25rem] text-ink capitalize">{c.name.toLowerCase()}</h3>
                  <ArrowRight className="w-5 h-5 text-crimson transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: categories.length * 0.08 }} className={categories.length % 2 === 0 ? 'col-span-2 lg:col-span-1' : undefined}>
            <Link href="/shop" className="group block">
              <div className={`relative ${categories.length % 2 === 0 ? 'aspect-[2/1]' : 'aspect-[4/5]'} lg:aspect-[4/5] bg-crimson text-white flex flex-col items-center justify-center p-5 sm:p-8 overflow-hidden`}>
                <Sprig className="absolute -top-2 -right-2 w-20 text-white/25 rotate-12" />
                <Sprig className="absolute -bottom-4 -left-2 w-16 text-white/20 rotate-[200deg]" />
                <p className="font-urdu text-[1.5rem] sm:text-[1.9rem]" lang="ur" dir="rtl">سب دیکھیں</p>
                <p className="mt-1 font-serif text-[1.3rem] sm:text-[1.7rem]">Shop everything</p>
                <span className="mt-4 sm:mt-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-crimson flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center justify-between">
                <h3 className="font-serif text-[1rem] sm:text-[1.25rem] text-ink">The full edit</h3>
                <ArrowRight className="w-5 h-5 text-crimson transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---------------- Bestsellers ---------------- */}
      {products.length > 0 && (
        <section className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 pb-16 lg:pb-24">
          <motion.div {...fadeUp} className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-crimson">Loved across Pakistan</p>
              <h2 className={sectionTitle}>Our bestsellers</h2>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-ink font-medium uppercase tracking-[0.12em] text-[0.78rem] underline underline-offset-[6px] decoration-crimson/50 hover:text-crimson">
              View all products <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-4">
            {products.slice(0, 8).map((p, i) => (
              <ProductCard key={p._id} product={p} priority={i < 2} />
            ))}
            {/* with a small catalogue, fill the row with service tiles rather than repeating products */}
            {[
              { href: '/shipping', eyebrow: 'Pay at your door', title: 'Cash on delivery, all over Pakistan', cta: 'How delivery works', dark: true },
              { href: 'https://wa.me/923060466911', eyebrow: 'Need advice?', title: 'Ask us on WhatsApp before you buy', cta: 'Chat with us', dark: false },
            ]
              .slice(0, (4 - (Math.min(products.length, 8) % 4)) % 4)
              .map((t) => (
                <a
                  key={t.title}
                  href={t.href}
                  {...(t.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`hidden lg:flex group relative aspect-square flex-col justify-end p-7 overflow-hidden ${t.dark ? 'bg-crimson text-white' : 'bg-blush text-ink'}`}
                >
                  <Sprig className={`absolute -top-3 -right-3 w-20 rotate-12 ${t.dark ? 'text-white/25' : 'text-petal'}`} />
                  <span className={`eyebrow !text-[0.62rem] ${t.dark ? 'text-petal' : 'text-crimson'}`}>{t.eyebrow}</span>
                  <span className="font-serif text-[1.3rem] leading-snug mt-2">{t.title}</span>
                  <span className={`mt-4 inline-flex items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.14em] font-medium ${t.dark ? 'text-white' : 'text-crimson'}`}>
                    {t.cta} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
          </div>
        </section>
      )}

      {/* ---------------- Concerns ---------------- */}
      <section className="bg-blush">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-12 sm:py-12 sm:py-16 lg:py-24 grid lg:grid-cols-[0.9fr_1.6fr] gap-8 sm:gap-12 items-start">
          <motion.div {...fadeUp} className="lg:sticky lg:top-36">
            <p className="eyebrow text-crimson">Skin, season by season</p>
            <h2 className={sectionTitle}>Made for our weather</h2>
            <p className="mt-5 text-gray-600 leading-relaxed max-w-md">
              Lahore summers, Karachi humidity, Islamabad winters. Pakistani skin goes through a lot in a year. Pick what your skin is asking for today.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 gap-px bg-blush-deep">
            {concerns.map(({ icon: Icon, title, text, hint }, i) => (
              <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="bg-white">
                <Link href={concernLink(hint)} className="group block h-full p-4 sm:p-8 hover:bg-white/60 transition-colors">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-crimson" strokeWidth={1.3} />
                  <h3 className="mt-3 sm:mt-5 font-serif text-[1rem] sm:text-[1.2rem] text-ink leading-snug">{title}</h3>
                  <p className="mt-2 text-[0.8rem] sm:text-[0.92rem] text-gray-600 leading-relaxed">{text}</p>
                  <span className="mt-3 sm:mt-5 inline-flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.14em] font-medium text-crimson">
                    Shop the fix <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Ritual ---------------- */}
      <section id="ritual" className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-12 sm:py-16 lg:py-24 scroll-mt-28">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
          <p className="eyebrow text-crimson">The daily ritual</p>
          <h2 className={sectionTitle}>Two minutes, morning and night</h2>
          <p className="mt-4 text-gray-600">Simple steps you will actually keep doing. Consistency is the real secret of glowing skin.</p>
        </motion.div>
        <div className="mt-8 sm:mt-12 grid lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {[
            { title: 'Morning', icon: Sun, steps: [['Cleanse', cleanser], ['Moisturise', cream], ['Sunscreen, always', undefined]] as [string, Product | undefined][] },
            { title: 'Night', icon: Moon, steps: [['Cleanse away the day', cleanser], ['Nourish', cream], ['Let skin rest', undefined]] as [string, Product | undefined][] },
          ].map(({ title, icon: Icon, steps }, i) => (
            <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="bg-tile p-5 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-crimson" strokeWidth={1.4} />
                <h3 className="font-serif text-[1.5rem] text-ink">{title}</h3>
              </div>
              <ol className="mt-5 sm:mt-8 space-y-4 sm:space-y-6">
                {steps.map(([label, product], n) => (
                  <li key={label} className="flex items-center gap-3 sm:gap-5">
                    <span className="w-10 h-10 shrink-0 rounded-full bg-crimson text-white font-serif flex items-center justify-center">{n + 1}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-ink">{label}</span>
                      {product ? (
                        <Link href={`/products/${product.slug}`} className="text-[0.88rem] text-crimson hover:underline underline-offset-4">
                          {product.name}
                        </Link>
                      ) : (
                        <span className="text-[0.88rem] text-muted">{n === 2 && title === 'Morning' ? 'SPF 30 or higher, even on cloudy days' : 'Sleep is skincare too'}</span>
                      )}
                    </span>
                    {product && imgOf(product) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={optimizeCloudinaryUrl(imgOf(product)!, 160, true)} alt="" className="w-14 h-14 object-cover" />
                    )}
                  </li>
                ))}
              </ol>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- Festive edit ---------------- */}
      <section className="bg-crimson text-white relative overflow-hidden">
        <Sprig className="absolute left-6 top-6 w-14 text-white/20 -rotate-12" />
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 items-stretch">
          <motion.div {...fadeUp} className="px-6 lg:px-16 py-12 sm:py-16 lg:py-24 flex flex-col justify-center">
            <p className="eyebrow text-petal">Shaadi season</p>
            <h2 className="mt-4 font-serif text-[2rem] sm:text-[2.8rem] !text-white leading-[1.1]">
              Mehndi, baraat, walima.
              <br />
              Glow through all three.
            </h2>
            <p className="mt-5 text-white/80 max-w-md">Start your prep two weeks before the big days. Clean skin, a steady routine and plenty of water make makeup sit beautifully.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/offers" className="inline-flex items-center gap-2 bg-white text-crimson px-7 py-3.5 rounded-full font-medium uppercase tracking-[0.12em] text-[0.78rem] hover:bg-blush transition-colors">
                See current offers <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/blog" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium uppercase tracking-[0.12em] text-[0.78rem] text-white hover:text-petal transition-colors">
                Read the glow guide
              </Link>
            </div>
          </motion.div>
          <div className="relative min-h-[360px] lg:min-h-[560px]">
            {imgOf(cream ?? hero) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={optimizeCloudinaryUrl(imgOf(cream ?? hero)!, 1100, false)} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            )}
          </div>
        </div>
      </section>

      {/* ---------------- Promise ---------------- */}
      <section className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-16 lg:py-20 grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
        {[
          { icon: Leaf, title: 'Gentle formulas', text: 'Skin-loving ingredients, no harsh surprises' },
          { icon: Heart, title: 'Cruelty-free', text: 'Never tested on animals' },
          { icon: ShieldCheck, title: 'Quality checked', text: 'Every batch inspected before it ships' },
          { icon: Sparkles, title: 'Honest prices', text: 'Premium care without the premium markup' },
        ].map(({ icon: Icon, title, text }, i) => (
          <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
            <span className="mx-auto w-16 h-16 rounded-full bg-blush flex items-center justify-center text-crimson">
              <Icon className="w-6 h-6" strokeWidth={1.4} />
            </span>
            <h3 className="mt-4 font-serif text-[1.1rem] text-ink">{title}</h3>
            <p className="mt-1.5 text-[0.88rem] text-muted">{text}</p>
          </motion.div>
        ))}
      </section>

      {/* ---------------- Journal ---------------- */}
      <section className="bg-tile">
        <div className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-12 sm:py-16 lg:py-24">
          <motion.div {...fadeUp} className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-crimson">The journal</p>
              <h2 className={sectionTitle}>Skin talk, the desi way</h2>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-2 text-ink font-medium uppercase tracking-[0.12em] text-[0.78rem] underline underline-offset-[6px] decoration-crimson/50 hover:text-crimson">
              All stories <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post, i) => (
              <motion.article key={post.slug} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="overflow-hidden aspect-[4/3] bg-blush">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.featuredImage.url} alt={post.featuredImage.alt} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" loading="lazy" />
                  </div>
                  <p className="mt-4 eyebrow !text-[0.64rem] text-crimson">{post.readingTime}</p>
                  <h3 className="mt-2 font-serif text-[1.15rem] text-ink leading-snug group-hover:text-crimson transition-colors">{post.title}</h3>
                  <p className="mt-2 text-[0.92rem] text-muted line-clamp-2">{post.excerpt}</p>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="max-w-3xl mx-auto w-full px-5 lg:px-10 py-12 sm:py-16 lg:py-24">
        <motion.div {...fadeUp} className="text-center">
          <p className="eyebrow text-crimson">Good to know</p>
          <h2 className={sectionTitle}>Questions, answered</h2>
        </motion.div>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
                <span className="font-serif text-[1.05rem] text-ink">{f.q}</span>
                <Plus className="w-5 h-5 text-crimson shrink-0 transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-gray-600 leading-relaxed pr-10">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-center text-gray-600">
          Still wondering?{' '}
          <a href="https://wa.me/923060466911" target="_blank" rel="noopener noreferrer" className="text-crimson font-medium underline underline-offset-4">
            Message us on WhatsApp
          </a>
        </p>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
            }),
          }}
        />
      </section>
    </div>
  );
}
