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
import { optimizeCloudinaryUrl, getCloudinarySrcSet, formatPrice } from '@/lib/utils';
import { getEffectivePrice } from '@/lib/productUtils';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
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

function Seal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <path id="seal-circle" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="#0f3b2e" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="#d9b25c" strokeOpacity=".5" />
      <text fill="#d9b25c" fontSize="8.6" fontFamily="var(--font-body)" fontWeight="600">
        <textPath href="#seal-circle" textLength="286" lengthAdjust="spacing">MADE FOR DESI SKIN ✦ AZEEORA ✦ PAKISTAN ✦</textPath>
      </text>
      <path d="M60 40 L66 54 L80 60 L66 66 L60 80 L54 66 L40 60 L54 54 Z" fill="#d9b25c" />
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

  return (
    <div className="flex flex-col bg-ivory">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden jaali-light">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-48 -left-32 w-[460px] h-[460px] rounded-full bg-rani/10 blur-3xl" aria-hidden />
        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-10 pt-10 pb-16 lg:pt-16 lg:pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-8 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="text-center lg:text-left">
            <p className="eyebrow text-gold inline-flex items-center gap-3">
              <span className="h-px w-8 bg-gold" /> Made for Pakistani skin
            </p>
            <h1 className="mt-6 font-serif text-[2.9rem] leading-[1.05] sm:text-[4rem] lg:text-[5.2rem] text-emerald">
              Your glow,
              <br />
              in its <span className="gold-text italic">truest</span> light.
            </h1>
            <p className="mt-5 font-urdu text-[1.6rem] sm:text-[1.9rem] text-jade" lang="ur" dir="rtl">
              چمکتی جلد، ہر موسم میں
            </p>
            <p className="mt-4 text-[1.05rem] text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Gentle face washes and beauty creams for heat, humidity and city dust. Honest prices, delivered to your door, pay when it arrives.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link href="/shop" className="group inline-flex items-center gap-2 bg-emerald text-ivory px-8 py-4 rounded-full font-semibold tracking-[0.06em] hover:bg-jade transition-colors shadow-[0_16px_30px_-16px_rgba(15,59,46,0.9)]">
                Shop the collection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#ritual" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold tracking-[0.06em] text-emerald border border-emerald/30 hover:border-gold hover:text-gold transition-colors">
                Find your ritual
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 justify-center lg:justify-start text-[0.85rem] text-gray-600">
              <span className="inline-flex items-center gap-2"><Banknote className="w-4 h-4 text-gold" /> Cash on delivery</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gold" /> Cruelty-free</span>
              <span className="inline-flex items-center gap-2"><Truck className="w-4 h-4 text-gold" /> All over Pakistan</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }} className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute inset-0 translate-x-4 translate-y-4 arch border border-gold/50" aria-hidden />
            <div className="relative arch bg-gradient-to-b from-sand to-[#ead9b8] aspect-[4/5] shadow-[0_40px_80px_-40px_rgba(15,59,46,0.6)]">
              {imgOf(hero) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={optimizeCloudinaryUrl(imgOf(hero)!, 900, false)}
                  srcSet={getCloudinarySrcSet(imgOf(hero)!)}
                  sizes="(max-width: 1024px) 90vw, 520px"
                  alt={hero?.name ?? 'AZEEORA'}
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                />
              ) : (
                <div className="w-full h-full jaali" />
              )}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-emerald/85 via-emerald/40 to-transparent">
                {hero && (
                  <Link href={`/products/${hero.slug}`} className="flex items-end justify-between gap-4 text-ivory">
                    <span>
                      <span className="eyebrow text-gold-soft !text-[0.62rem]">Bestseller</span>
                      <span className="block font-serif text-[1.35rem] leading-tight mt-1">{hero.name}</span>
                    </span>
                    <span className="shrink-0 bg-ivory text-emerald rounded-full px-4 py-2 text-sm font-semibold">{formatPrice(getEffectivePrice(hero))}</span>
                  </Link>
                )}
              </div>
            </div>
            {imgOf(second) && (
              <Link href={`/products/${second!.slug}`} className="floaty absolute -left-3 sm:-left-12 bottom-28 sm:bottom-16 w-[28%] sm:w-[34%] arch border-4 border-ivory shadow-2xl bg-sand aspect-[3/4]" aria-label={second!.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={optimizeCloudinaryUrl(imgOf(second)!, 400, false)} alt={second!.name} className="w-full h-full object-cover" />
              </Link>
            )}
            <Seal className="absolute -top-6 -right-2 sm:-right-8 w-24 sm:w-28 animate-[spin_24s_linear_infinite] motion-reduce:animate-none drop-shadow-lg" />
          </motion.div>
        </div>
      </section>

      {/* ---------------- Perks ---------------- */}
      <section className="bg-emerald relative overflow-hidden">
        <div className="absolute inset-0 jaali opacity-70" aria-hidden />
        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-10 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 text-ivory">
              <span className="w-12 h-12 shrink-0 rounded-full border border-gold/50 flex items-center justify-center text-gold-soft">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-[0.92rem] leading-snug">{title}</span>
                <span className="block text-[0.78rem] text-ivory/60">{text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-20 lg:py-28">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
          <p className="eyebrow text-gold">The collection</p>
          <h2 className="mt-4 font-serif text-[2.4rem] sm:text-[3.2rem] text-emerald leading-tight">Shop by category</h2>
          <div className="ornament mt-5 max-w-xs mx-auto"><span className="text-[0.7rem]">✦</span></div>
        </motion.div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {categories.map((c, i) => (
            <motion.div key={c._id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <Link href={`/categories/${c.slug}`} className="group block text-center">
                <div className="relative arch aspect-[3/4] bg-sand shadow-[0_30px_60px_-36px_rgba(15,59,46,0.7)]">
                  {c.image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={optimizeCloudinaryUrl(c.image.url, 700, false)}
                      srcSet={getCloudinarySrcSet(c.image.url)}
                      sizes="(max-width: 640px) 90vw, 33vw"
                      alt={c.name}
                      className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full jaali-light" />
                  )}
                  <div className="absolute inset-3 arch border border-ivory/60 pointer-events-none" />
                </div>
                <h3 className="mt-6 font-serif text-[1.6rem] text-emerald capitalize">{c.name.toLowerCase()}</h3>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[0.8rem] uppercase tracking-[0.18em] font-semibold text-gold group-hover:gap-3 transition-all">
                  Discover <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: categories.length * 0.08 }}>
            <Link href="/shop" className="group block text-center">
              <div className="relative arch aspect-[3/4] bg-emerald jaali flex flex-col items-center justify-center text-ivory p-8 shadow-[0_30px_60px_-36px_rgba(15,59,46,0.9)]">
                <div className="absolute inset-3 arch border border-gold/50 pointer-events-none" />
                <p className="font-urdu text-[2.2rem] text-gold-soft" lang="ur" dir="rtl">سب دیکھیں</p>
                <p className="mt-2 font-serif text-[1.9rem]">Everything</p>
                <span className="mt-6 w-14 h-14 rounded-full border border-gold/60 flex items-center justify-center group-hover:bg-gold group-hover:text-emerald transition-colors">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
              </div>
              <h3 className="mt-6 font-serif text-[1.6rem] text-emerald">The full edit</h3>
              <span className="mt-1 inline-flex items-center gap-1.5 text-[0.8rem] uppercase tracking-[0.18em] font-semibold text-gold group-hover:gap-3 transition-all">
                Shop all <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---------------- Bestsellers ---------------- */}
      {products.length > 0 && (
        <section className="bg-sand relative">
          <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-20 lg:py-24">
            <motion.div {...fadeUp} className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-gold">Loved across Pakistan</p>
                <h2 className="mt-4 font-serif text-[2.4rem] sm:text-[3.2rem] text-emerald leading-tight">Our bestsellers</h2>
              </div>
              <Link href="/shop" className="inline-flex items-center gap-2 text-emerald font-semibold border-b border-gold pb-1 hover:text-gold transition-colors">
                View all products <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            {/* centred so a small catalogue still looks deliberate */}
            <div className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-10">
              {products.slice(0, 8).map((p, i) => (
                <div key={p._id} className="w-[calc(50%-10px)] lg:w-[calc(25%-15px)] max-w-[340px]">
                  <ProductCard product={p} priority={i < 2} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Concerns ---------------- */}
      <section className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-20 lg:py-28">
        <motion.div {...fadeUp} className="grid lg:grid-cols-[0.9fr_1.6fr] gap-12 items-start">
          <div className="lg:sticky lg:top-36">
            <p className="eyebrow text-gold">Skin, season by season</p>
            <h2 className="mt-4 font-serif text-[2.4rem] sm:text-[3.2rem] text-emerald leading-tight">Made for our weather</h2>
            <p className="mt-5 text-gray-600 leading-relaxed max-w-md">
              Lahore summers, Karachi humidity, Islamabad winters. Pakistani skin goes through a lot in a year. Pick what your skin is asking for today.
            </p>
            <p className="mt-6 font-urdu text-[1.4rem] text-jade" lang="ur" dir="rtl">آپ کی جلد، آپ کا موسم</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {concerns.map(({ icon: Icon, title, text, hint }, i) => (
              <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                <Link href={concernLink(hint)} className="group relative block h-full p-8 rounded-[28px] bg-white border border-gold/20 hover:border-gold/60 hover:-translate-y-1 transition-all duration-500 shadow-[0_20px_40px_-34px_rgba(15,59,46,0.8)] overflow-hidden">
                  <span className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-sand group-hover:bg-gold/15 transition-colors" aria-hidden />
                  <span className="relative w-12 h-12 rounded-2xl bg-emerald text-gold-soft flex items-center justify-center">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="relative mt-6 font-serif text-[1.45rem] text-emerald">{title}</h3>
                  <p className="relative mt-2 text-[0.92rem] text-gray-600 leading-relaxed">{text}</p>
                  <span className="relative mt-5 inline-flex items-center gap-1.5 text-[0.78rem] uppercase tracking-[0.16em] font-semibold text-gold">
                    Shop the fix <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ---------------- Ritual ---------------- */}
      <section id="ritual" className="relative bg-emerald text-ivory overflow-hidden scroll-mt-28">
        <div className="absolute inset-0 jaali opacity-80" aria-hidden />
        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-10 py-20 lg:py-28">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
            <p className="eyebrow text-gold-soft">The daily ritual</p>
            <h2 className="mt-4 font-serif text-[2.4rem] sm:text-[3.2rem] !text-ivory leading-tight">Two minutes, morning and night</h2>
            <p className="mt-4 text-ivory/70">Simple steps you will actually keep doing. Consistency is the real secret of glowing skin.</p>
          </motion.div>
          <div className="mt-14 grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'Morning', icon: Sun, steps: [['Cleanse', cleanser], ['Moisturise', cream], ['Sunscreen, always', undefined]] as [string, Product | undefined][] },
              { title: 'Night', icon: Moon, steps: [['Cleanse away the day', cleanser], ['Nourish', cream], ['Let skin rest', undefined]] as [string, Product | undefined][] },
            ].map(({ title, icon: Icon, steps }, i) => (
              <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="rounded-[32px] border border-gold/30 bg-emerald/60 backdrop-blur p-8 lg:p-10">
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-gold-soft" strokeWidth={1.5} />
                  <h3 className="font-serif text-[1.9rem] !text-ivory">{title}</h3>
                </div>
                <ol className="mt-8 space-y-6">
                  {steps.map(([label, product], n) => (
                    <li key={label} className="flex items-center gap-5">
                      <span className="w-11 h-11 shrink-0 rounded-full bg-gold text-emerald font-serif text-[1.2rem] flex items-center justify-center">{n + 1}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold">{label}</span>
                        {product ? (
                          <Link href={`/products/${product.slug}`} className="text-[0.88rem] text-gold-soft hover:underline underline-offset-4">
                            {product.name}
                          </Link>
                        ) : (
                          <span className="text-[0.88rem] text-ivory/60">{n === 2 && title === 'Morning' ? 'SPF 30 or higher, even on cloudy days' : 'Sleep is skincare too'}</span>
                        )}
                      </span>
                      {product && imgOf(product) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={optimizeCloudinaryUrl(imgOf(product)!, 160, true)} alt="" className="w-14 h-14 rounded-2xl object-cover border border-gold/40" />
                      )}
                    </li>
                  ))}
                </ol>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Festive edit ---------------- */}
      <section className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-20 lg:py-28">
        <motion.div {...fadeUp} className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-rani via-[#8f1d49] to-[#5c1230] text-ivory">
          <div className="absolute inset-0 jaali opacity-60" aria-hidden />
          <div className="relative grid lg:grid-cols-[1.2fr_1fr] items-center">
            <div className="p-10 sm:p-14 lg:p-20">
              <p className="eyebrow text-gold-soft">Shaadi season</p>
              <h2 className="mt-4 font-serif text-[2.4rem] sm:text-[3.4rem] !text-ivory leading-[1.05]">
                Mehndi, baraat, walima.
                <br />
                <span className="gold-text">Glow through all three.</span>
              </h2>
              <p className="mt-5 text-ivory/80 max-w-md">Start your prep two weeks before the big days. Clean skin, a steady routine and plenty of water make makeup sit beautifully.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/offers" className="inline-flex items-center gap-2 bg-gold text-emerald px-7 py-3.5 rounded-full font-semibold hover:bg-gold-soft transition-colors">
                  See current offers <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/blog" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold border border-ivory/40 hover:border-gold-soft hover:text-gold-soft transition-colors">
                  Read the glow guide
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:flex items-center justify-center p-14">
              <div className="relative w-[78%] arch aspect-[3/4] border-[6px] border-gold-soft/60 bg-[#5c1230]">
                {imgOf(cream ?? hero) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={optimizeCloudinaryUrl(imgOf(cream ?? hero)!, 700, false)} alt="" className="w-full h-full object-cover opacity-95" />
                )}
              </div>
              <span className="absolute top-10 right-12 text-gold-soft text-4xl" aria-hidden>✦</span>
              <span className="absolute bottom-12 left-12 text-gold-soft/70 text-2xl" aria-hidden>✦</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- Promise ---------------- */}
      <section className="bg-sand jaali-light">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-20 lg:py-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          {[
            { icon: Leaf, title: 'Gentle formulas', text: 'Skin-loving ingredients, no harsh surprises' },
            { icon: Heart, title: 'Cruelty-free', text: 'Never tested on animals' },
            { icon: ShieldCheck, title: 'Quality checked', text: 'Every batch inspected before it ships' },
            { icon: Sparkles, title: 'Honest prices', text: 'Premium care without the premium markup' },
          ].map(({ icon: Icon, title, text }, i) => (
            <motion.div key={title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <span className="mx-auto w-16 h-16 rounded-full bg-ivory border border-gold/40 flex items-center justify-center text-gold">
                <Icon className="w-6 h-6" strokeWidth={1.4} />
              </span>
              <h3 className="mt-5 font-serif text-[1.4rem] text-emerald">{title}</h3>
              <p className="mt-1.5 text-[0.9rem] text-gray-600">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- Journal ---------------- */}
      <section className="max-w-[1440px] mx-auto w-full px-5 lg:px-10 py-20 lg:py-28">
        <motion.div {...fadeUp} className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-gold">The journal</p>
            <h2 className="mt-4 font-serif text-[2.4rem] sm:text-[3.2rem] text-emerald leading-tight">Skin talk, the desi way</h2>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 text-emerald font-semibold border-b border-gold pb-1 hover:text-gold transition-colors">
            All stories <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {blogPosts.slice(0, 3).map((post, i) => (
            <motion.article key={post.slug} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="overflow-hidden rounded-[28px] aspect-[4/3] bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.featuredImage.url} alt={post.featuredImage.alt} className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" loading="lazy" />
                </div>
                <p className="mt-5 eyebrow !text-[0.66rem] text-gold">{post.readingTime}</p>
                <h3 className="mt-2 font-serif text-[1.45rem] text-emerald leading-snug group-hover:text-jade transition-colors">{post.title}</h3>
                <p className="mt-2 text-[0.92rem] text-gray-600 line-clamp-2">{post.excerpt}</p>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="bg-white border-t border-gold/20">
        <div className="max-w-3xl mx-auto px-5 lg:px-10 py-20 lg:py-24">
          <motion.div {...fadeUp} className="text-center">
            <p className="eyebrow text-gold">Good to know</p>
            <h2 className="mt-4 font-serif text-[2.4rem] sm:text-[3rem] text-emerald leading-tight">Questions, answered</h2>
          </motion.div>
          <div className="mt-12 divide-y divide-gold/25 border-y border-gold/25">
            {faqs.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
                  <span className="font-serif text-[1.25rem] text-emerald">{f.q}</span>
                  <Plus className="w-5 h-5 text-gold shrink-0 transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed pr-10">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-gray-600">
            Still wondering?{' '}
            <a href="https://wa.me/923060466911" target="_blank" rel="noopener noreferrer" className="text-emerald font-semibold border-b border-gold hover:text-gold">
              Message us on WhatsApp
            </a>
          </p>
        </div>
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
