import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Truck } from 'lucide-react';
import { config } from '@/lib/config';
import { rebrand } from '@/lib/rebrand';

export const metadata: Metadata = {
  title: 'Shop by Category | Luxury Skincare & Hair Care Collections',
  description: 'Explore AZEEORA luxury skincare and beauty collections in Pakistan: Whitening Beauty Creams, Hair Growth Serums, Radiance Face Washes, and Glutathione Skin Polish Kits. Cash on delivery nationwide.',
  alternates: {
    canonical: `${config.getBaseUrl()}/categories`,
  },
  openGraph: {
    title: 'Shop by Category | AZEEORA Cosmetics Collections',
    description: 'Explore AZEEORA luxury skincare and beauty collections in Pakistan: Whitening Beauty Creams, Hair Growth Serums, Radiance Face Washes, and Glutathione Skin Polish Kits.',
    url: `${config.getBaseUrl()}/categories`,
    type: 'website',
  },
};

export const revalidate = 3600;

const fallbackCategories = [
  {
    _id: 'cat-skincare',
    name: 'Skin Care',
    slug: 'skin-care',
    description: 'Targeted brightening beauty creams, pore-cleansing face washes, and exfoliating glutathione skin polish kits formulated for glowing Pakistani skin.',
    productCount: 3,
    image: {
      url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_700/v1794256314/ayeza-cosmetics/avp2mr3io0wc5nx4q41i.jpg',
      alt: 'AZEEORA Skin Care Collection',
    },
  },
  {
    _id: 'cat-haircare',
    name: 'Hair Care',
    slug: 'hair-care',
    description: 'Intensive hair growth serums and frizz-defense oils formulated to protect strands from humidity, heat damage, and root fall.',
    productCount: 1,
    image: {
      url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_700/v1794257977/ayeza-cosmetics/iyw1ocjvxcvplvwyugn2.jpg',
      alt: 'AZEEORA Hair Care Collection',
    },
  },
];

async function getCategories() {
  try {
    const res = await fetch(`${config.apiUrl}/categories`, {
      next: { tags: ['categories'], revalidate: 3600 },
    });
    if (res.ok) {
      const json = rebrand(await res.json());
      const list = json.data;
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Backend categories endpoint unreachable during SSR, using fallback categories.');
  }
  return fallbackCategories;
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  const base = config.getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AZEEORA Categories',
    description: 'Explore our carefully curated categories designed to enhance your natural beauty.',
    url: `${base}/categories`,
    hasPart: categories.map((cat: any) => ({
      '@type': 'CollectionPage',
      name: cat.name,
      url: `${base}/categories/${cat.slug}`,
      description: cat.description || `Browse our collection of ${cat.name} at AZEEORA.`,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <div className="bg-blush border-b border-line">
        <div className="container mx-auto px-4 py-14 text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 bg-rose-gold/10 text-rose-gold px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Collections
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-black mb-4 tracking-tight">
            Shop by Category
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Thoughtfully formulated collections designed to address Pakistani heat, humidity, dust, and dry winters with pure, mercury-free ingredients.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {categories.map((category: any) => (
            <Link
              key={category._id || category.slug}
              href={`/categories/${category.slug}`}
              className="block group bg-white rounded-3xl overflow-hidden border border-line shadow-sm hover:shadow-luxury transition-all duration-300"
            >
              <div className="aspect-[16/10] bg-blush relative overflow-hidden">
                {category.image?.url ? (
                  <img
                    src={category.image.url}
                    alt={category.image.alt || category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400 font-serif text-lg">{category.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <span className="absolute bottom-4 left-6 text-white font-serif text-2xl font-bold">
                  {category.name}
                </span>
              </div>

              <div className="p-8">
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {category.description || 'Explore our clean, luxurious formulations made for everyday radiant skin and hair.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted">
                    {category.productCount ? `${category.productCount} Products` : 'View Range'}
                  </span>
                  <span className="inline-flex items-center text-sm font-semibold text-crimson group-hover:translate-x-1 transition-transform gap-1.5">
                    Explore Collection
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Informational Guarantee Section */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6 pt-12 border-t border-gray-200 text-center">
          <div className="p-6 bg-white rounded-2xl border border-line">
            <ShieldCheck className="w-8 h-8 text-crimson mx-auto mb-3" />
            <h4 className="font-serif font-bold text-ink mb-1">Mercury-Free Guarantee</h4>
            <p className="text-xs text-muted">Zero steroids, zero bleaching shortcuts. Safe daily skincare.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-line">
            <Truck className="w-8 h-8 text-crimson mx-auto mb-3" />
            <h4 className="font-serif font-bold text-ink mb-1">Nationwide COD</h4>
            <p className="text-xs text-muted">Fast delivery in 3–5 working days to 200+ cities in Pakistan.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-line">
            <HeartHandshake className="w-8 h-8 text-crimson mx-auto mb-3" />
            <h4 className="font-serif font-bold text-ink mb-1">14-Day Easy Returns</h4>
            <p className="text-xs text-muted">Shop with confidence. Easy exchange on unopened products.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
