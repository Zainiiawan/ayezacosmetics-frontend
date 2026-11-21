import type { Metadata } from 'next';
import { config } from '@/lib/config';
import Link from 'next/link';
import { Sparkles, Heart, Shield, Leaf, Award, MapPin, Phone, Mail, CheckCircle, Truck, Droplets, Sun, Wind, Users } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Our Story & Heritage | Luxury Skincare for Pakistani Weather',
  description: 'Learn about AZEEORA Cosmetics — born in Vehari, Punjab. We craft authentic, mercury-free whitening creams, hair serums, face washes, and skin polish kits formulated for Pakistani skin and weather.',
  alternates: {
    canonical: `${config.getBaseUrl()}/about`,
  },
  openGraph: {
    title: 'Our Story & Heritage | AZEEORA Cosmetics Pakistan',
    description: 'Learn about AZEEORA Cosmetics — born in Vehari, Punjab. Crafted specifically for Pakistani skin, climate, and daily routines.',
    url: `${config.getBaseUrl()}/about`,
    type: 'website',
  },
};

const pillars = [
  {
    icon: Leaf,
    title: '100% Mercury & Steroid Free',
    desc: 'Unlike harsh local creams that ruin the skin barrier, AZEEORA formulations are completely free of mercury, steroids, and harmful bleaches. Safe for long-term daily glow.',
  },
  {
    icon: Sun,
    title: 'Engineered for Pakistani Climate',
    desc: 'Formulated to withstand our unique weather — scorching summer heat, heavy monsoon humidity, airborne dust, and dehydrating winters without clogging pores.',
  },
  {
    icon: Droplets,
    title: 'Active Scientific Botanicals',
    desc: 'We combine potent, clinically proven actives like Glutathione, Niacinamide, Alpha Arbutin, and Vitamin C with soothing herbal extracts for genuine, lasting radiance.',
  },
  {
    icon: Award,
    title: 'Strict Quality Testing',
    desc: 'Every batch is prepared in certified facilities, quality-tested for purity, stability, and safety before leaving our dispatch center.',
  },
];

const milestones = [
  { year: 'Our Beginning', title: 'A Vision Born in Vehari', desc: 'Frustrated by unsafe local beauty creams packed with harsh steroids and mercury, we set out to create a truly honest skincare brand tailored for Pakistani complexions.' },
  { year: 'Formulation Phase', title: 'Science Meets Skin Comfort', desc: 'Over two years of intensive testing and formulation to create lightweight, non-greasy textures that absorb deeply in hot and humid Asian weather.' },
  { year: 'National Launch', title: 'Trusted Across Pakistan', desc: 'Expanding from Punjab to every province — delivering luxury skincare with fast Cash on Delivery from Karachi to Khyber.' },
  { year: 'Today & Beyond', title: 'Empowering Natural Radiance', desc: 'Thousands of verified glowing reviews, a growing product family, and an unwavering commitment to cruelty-free, clean beauty.' },
];

export default function AboutPage() {
  const base = config.getBaseUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About AZEEORA Cosmetics',
    description: 'Discover the story behind AZEEORA — luxury beauty and skincare formulated for Pakistani skin and climate.',
    url: `${base}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: 'AZEEORA',
      url: base,
      logo: `${base}/logo.png`,
      foundingLocation: {
        '@type': 'Place',
        name: 'Vehari, Punjab, Pakistan',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Sharqi Colony',
        addressLocality: 'Vehari',
        addressRegion: 'Punjab',
        addressCountry: 'PK',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+92-306-0466911',
        contactType: 'customer service',
        areaServed: 'PK',
        availableLanguage: ['English', 'Urdu'],
      },
      knowsAbout: [
        'Skincare Formulations',
        'Whitening Beauty Creams',
        'Hair Growth Serums',
        'Radiance Face Wash',
        'Glutathione Skin Polish',
      ],
      sameAs: [
        'https://www.facebook.com/share/1JMakEmR81/',
        'https://www.instagram.com/ayezacosmetics.store?igsh=eTF3dnZkbHUwZmph',
        'https://www.tiktok.com/@ayezacosmetics.store?_r=1&_t=ZN-98aOm1iZDQF',
      ],
    },
  };

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="bg-black text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <p className="text-rose-gold uppercase tracking-[0.2em] text-xs font-semibold mb-4">
            Our Story & Heritage
          </p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Skincare Crafted for <span className="text-rose-gold">Pakistani Skin</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
            Born in Vehari with one uncompromising mission: honest, safe, and effective beauty formulations designed to thrive in our unique climate.
          </p>
        </div>
      </section>

      {/* Origin Narrative */}
      <section className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="eyebrow text-crimson mb-2 inline-block">Why We Started</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-6 leading-tight">
              A Stand Against Unsafe, Temporary Beauty Fixes
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-[0.98rem]">
              <p>
                For decades, the Pakistani cosmetics market has been saturated with unverified night creams promising overnight miracles. Unfortunately, most of these products depend on harsh steroids, excessive mercury, and industrial bleaches that thin the delicate skin barrier, create severe hyperpigmentation rebound, and cause lasting dermal damage.
              </p>
              <p>
                <strong>AZEEORA</strong> was founded in <strong>Vehari, Punjab</strong>, to break this cycle. We asked a fundamental question: <em>Why should Pakistani women and men have to choose between safe ingredients and visible results?</em>
              </p>
              <p>
                We set out to formulate a luxury range that delivers real brightening, deep hydration, and blemish reduction using globally verified active ingredients like <strong>Glutathione, Niacinamide, Alpha Arbutin, and botanical extracts</strong> — entirely free from toxic shortcuts.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blush to-blush-deep/40 rounded-3xl p-8 lg:p-12 border border-line shadow-sm">
            <h3 className="text-2xl font-serif font-bold text-ink mb-6">The AZEEORA Promise</h3>
            <ul className="space-y-4 text-gray-800 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
                <span><strong>No Harmful Bleaches:</strong> Pure glow powered by cellular rejuvenation, never skin-thinning bleaches.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
                <span><strong>Pakistani Climate Resilience:</strong> Non-sticky textures that stay breathable in 40°C+ summer heat.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
                <span><strong>Cruelty-Free Always:</strong> Formulated ethically, never tested on animals at any stage.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
                <span><strong>Cash on Delivery Nationwide:</strong> Delivered safely to over 200 cities, towns, and villages in Pakistan.</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-line flex items-center justify-between">
              <div>
                <p className="font-serif font-bold text-ink text-base">Crafted in Vehari</p>
                <p className="text-xs text-muted">Punjab, Pakistan</p>
              </div>
              <Link href="/shop">
                <Button size="sm">Explore Catalog</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="eyebrow text-crimson">Our Scientific Standard</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-bold text-black">
              Four Pillars of Clean Luxury
            </h2>
            <p className="mt-4 text-gray-600">
              Every formula in our line is developed to honor the delicate biological balance of South Asian skin.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 bg-rose-gold/10 rounded-xl flex items-center justify-center mb-5 text-rose-gold">
                    <pillar.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-black mb-3">{pillar.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulation Science */}
      <section className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="eyebrow text-crimson">Ingredients That Work</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-serif font-bold text-black">
            Science-Backed Actives for Melanin-Rich Skin
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            South Asian skin produces higher levels of melanin, making it more prone to stubborn post-acne dark spots, sun tanning, and melasma. We carefully choose active ingredients that safely regulate melanin synthesis:
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-blush/40 rounded-2xl border border-line">
            <h4 className="font-serif font-bold text-lg text-ink mb-2">Glutathione & Niacinamide</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Master antioxidants that inhibit tyrosinase activity, reduce uneven dark patches, regulate excess sebum, and strengthen natural barrier lipids.
            </p>
          </div>
          <div className="p-6 bg-blush/40 rounded-2xl border border-line">
            <h4 className="font-serif font-bold text-lg text-ink mb-2">Alpha Arbutin & Vitamin C</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Gentle, clinically validated skin brighteners that fade hyperpigmentation, accelerate cell turnover, and brighten dull skin caused by sun exposure.
            </p>
          </div>
          <div className="p-6 bg-blush/40 rounded-2xl border border-line">
            <h4 className="font-serif font-bold text-lg text-ink mb-2">Botanical Calming Agents</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Aloe Vera, Rose extracts, and Provitamin B5 to soothe heat irritation, prevent redness, and lock in deep moisture throughout the day.
            </p>
          </div>
        </div>
      </section>

      {/* Milestones / Journey */}
      <section className="bg-blush py-20 border-t border-line">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="eyebrow text-crimson">The Journey</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-bold text-ink">
              Building Trust, Step by Step
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((m, idx) => (
              <div key={m.title} className="bg-white rounded-2xl p-6 shadow-sm border border-line flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-crimson mb-2">{m.year}</span>
                <h3 className="font-serif font-bold text-lg text-ink mb-2">{m.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Trust & Location */}
      <section className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <div className="w-16 h-16 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-gold">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-4">
          Visit Us or Reach Out Directly
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          Our headquarters and dispatch operations are proudly based in <strong>Sharqi Colony, Vehari, Punjab, Pakistan</strong>. Our client care team is available via direct WhatsApp or phone call six days a week.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/shop">
            <Button size="lg">Explore Our Products</Button>
          </Link>
          <a
            href="https://wa.me/923060466911?text=Assalam%20o%20Alaikum%2C%20I%20would%20like%20to%20know%20more%20about%20AZEEORA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#1f8f4e] text-white px-7 py-3.5 rounded-full font-medium text-sm hover:bg-[#187a42] transition-colors"
          >
            Chat with Founders on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
