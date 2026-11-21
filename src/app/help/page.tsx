import type { Metadata } from 'next';
import Link from 'next/link';
import {
  HelpCircle, MessageCircle, Mail, Phone, Clock, Truck, RotateCcw, CreditCard, Package, ChevronDown, MapPin, CheckCircle2, ShieldAlert
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { config } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Help Center | FAQs & Customer Support',
  description: 'Find quick answers to common questions about AZEEORA luxury cosmetics: order placement, Cash on Delivery, courier delivery times, and 14-day returns.',
  alternates: {
    canonical: `${config.getBaseUrl()}/help`,
  },
  openGraph: {
    title: 'Help Center | FAQs & Customer Support | AZEEORA',
    description: 'Find quick answers about AZEEORA: orders, COD, shipping across Pakistan, and returns.',
    url: `${config.getBaseUrl()}/help`,
    type: 'website',
  },
};

const CONTACT = {
  phone: '+92 306 0466911',
  whatsapp: '923060466911',
  email: 'azeeoracosmetics@gmail.com',
  address: 'Sharqi Colony, Vehari, Punjab, Pakistan',
  hours: 'Mon – Sat: 10:00 AM – 8:00 PM (PKT)',
};

const faqs = [
  {
    q: 'How do I place an order on AZEEORA?',
    a: 'Browse our catalog, select your products, and click "Add to Cart" or "Buy Now". On the checkout page, enter your delivery name, active mobile number, and complete street address in Pakistan. Choose Cash on Delivery (COD), JazzCash, or Easypaisa, and confirm your order.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery (COD) in all cities and towns across Pakistan. We also accept instant digital wallet payments via JazzCash and Easypaisa, as well as major debit/credit cards through encrypted payment channels.',
  },
  {
    q: 'How long does shipping and delivery take?',
    a: 'Orders are processed within 24 to 48 hours. Major cities (Lahore, Karachi, Islamabad, Rawalpindi) receive delivery within 2 to 3 business days. Other cities across Punjab, Sindh, KPK, and Balochistan receive delivery within 3 to 5 business days.',
  },
  {
    q: 'How can I track my order status?',
    a: 'Once your parcel is dispatched, you will receive an SMS and email with your courier tracking number (TCS, Leopards, Trax, or PostEx). You can also enter your Order ID on our on-site Track Order page at https://azeeoracosmetics.com/track-order for real-time tracking.',
  },
  {
    q: 'Are AZEEORA products genuine and safe from mercury and steroids?',
    a: 'Yes, 100%. AZEEORA is strictly dedicated to clean, ethical cosmetics. All our formulations are formulated without mercury, steroids, hydroquinone, or harmful chemical bleaches. We use clinically verified actives like Glutathione, Niacinamide, and herbal extracts that nourish the skin barrier.',
  },
  {
    q: 'What is your return and refund policy?',
    a: 'We offer a hassle-free 14-day return and exchange policy on unused, unopened products in their original packaging with protective seals intact. If your order arrives damaged during transit, contact us within 24 hours with photos for an immediate free replacement.',
  },
  {
    q: 'Can I cancel or modify my order after placing it?',
    a: 'Yes, as long as the parcel has not yet been dispatched from our warehouse. Please reach out to our WhatsApp support team at +92 306 0466911 with your Order ID as soon as possible to make changes or cancellations.',
  },
  {
    q: 'Do you deliver to small towns and villages in Pakistan?',
    a: 'Yes! Through our national courier network (TCS, Leopards Courier, Trax, PostEx), we provide doorstep Cash on Delivery delivery to more than 200 cities, tehsils, and rural districts throughout Pakistan.',
  },
];

export default function HelpPage() {
  const base = config.getBaseUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <HelpCircle className="w-12 h-12 text-rose-gold mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold mb-4">Help Center & Support</h1>
          <p className="text-gray-300">Everything you need to shop, pay, track, and get support across Pakistan</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
        {/* Quick links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '#faq', label: 'FAQs', icon: HelpCircle },
            { href: '#shipping', label: 'Shipping Policy', icon: Truck },
            { href: '#returns', label: 'Returns & Refunds', icon: RotateCcw },
            { href: '#tracking', label: 'Track Order', icon: Package },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:border-rose-gold border border-transparent transition-colors"
            >
              <item.icon className="w-5 h-5 text-rose-gold" />
              <span className="font-medium text-sm">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Contact Support */}
        <section id="contact" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-serif font-bold mb-6">Contact Client Care</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-rose-gold/5 transition-colors border border-gray-100">
              <Phone className="w-6 h-6 text-rose-gold shrink-0" />
              <div>
                <p className="font-bold text-black text-sm">Direct Phone Line</p>
                <p className="text-gray-600 text-sm">{CONTACT.phone}</p>
              </div>
            </a>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-rose-gold/5 transition-colors border border-gray-100">
              <MessageCircle className="w-6 h-6 text-rose-gold shrink-0" />
              <div>
                <p className="font-bold text-black text-sm">WhatsApp Consultation</p>
                <p className="text-gray-600 text-sm">Instant chat with support</p>
              </div>
            </a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-rose-gold/5 transition-colors border border-gray-100">
              <Mail className="w-6 h-6 text-rose-gold shrink-0" />
              <div>
                <p className="font-bold text-black text-sm">Email Support</p>
                <p className="text-gray-600 text-sm">{CONTACT.email}</p>
              </div>
            </a>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <Clock className="w-6 h-6 text-rose-gold shrink-0" />
              <div>
                <p className="font-bold text-black text-sm">Operating Hours</p>
                <p className="text-gray-600 text-sm">{CONTACT.hours}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 sm:col-span-2">
              <MapPin className="w-6 h-6 text-rose-gold shrink-0" />
              <div>
                <p className="font-bold text-black text-sm">Headquarters & Dispatch</p>
                <p className="text-gray-600 text-sm">{CONTACT.address}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact"><Button variant="outline">Contact Form</Button></Link>
            <Link href="/track-order"><Button>Track Order</Button></Link>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section id="faq" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 scroll-mt-24">
          <h2 className="text-2xl font-serif font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group border border-gray-100 rounded-xl bg-gray-50/50">
                <summary className="flex items-center justify-between cursor-pointer p-4 font-semibold text-black list-none hover:text-rose-gold transition-colors">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                </summary>
                <p className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Shipping Overview */}
        <section id="shipping" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 scroll-mt-24">
          <h2 className="text-2xl font-serif font-bold mb-4 flex items-center gap-2">
            <Truck className="w-6 h-6 text-rose-gold" />
            Shipping & Nationwide Delivery
          </h2>
          <div className="prose prose-sm text-gray-600 space-y-3 max-w-none">
            <p>We deliver to more than 200 cities, towns, and villages across Pakistan via trusted couriers (TCS, Leopards, Trax, PostEx).</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Standard Delivery:</strong> 2 to 5 business days depending on your city.</li>
              <li><strong>Free Delivery:</strong> Orders exceeding PKR 5,000 qualify for free nationwide shipping.</li>
              <li><strong>Flat Shipping Rate:</strong> PKR 200 applies to orders below PKR 5,000.</li>
              <li><strong>Cash on Delivery:</strong> Available across Pakistan with phone confirmation before dispatch.</li>
            </ul>
            <p className="pt-2">
              Read our full <Link href="/shipping" className="text-rose-gold font-medium">Shipping & Delivery Policy</Link> for city-by-city timelines.
            </p>
          </div>
        </section>

        {/* Returns & Refunds */}
        <section id="returns" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 scroll-mt-24">
          <h2 className="text-2xl font-serif font-bold mb-4 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-rose-gold" />
            14-Day Return & Replacement Policy
          </h2>
          <div className="prose prose-sm text-gray-600 space-y-3 max-w-none">
            <p>We want you to be 100% satisfied with your luxury skincare investment.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Returns accepted within 14 days of delivery for unopened, unused products in original sealed packaging.</li>
              <li>Damaged or leaking items are replaced free of charge when reported within 24 hours of delivery.</li>
              <li>Refunds processed via Bank Transfer or Easypaisa/JazzCash within 5 to 7 business days following inspection.</li>
            </ul>
            <p className="pt-2">
              For complete details, please read our dedicated <Link href="/refunds" className="text-rose-gold font-medium">Refund & Returns Policy</Link>.
            </p>
          </div>
        </section>

        {/* Tracking */}
        <section id="tracking" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 scroll-mt-24">
          <h2 className="text-2xl font-serif font-bold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-rose-gold" />
            Instant Order Tracking
          </h2>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            Track your parcel in real time with your order number and email, or sign in to your customer dashboard to view order history and courier tracking details.
          </p>
          <Link href="/track-order"><Button>Go to Track Order</Button></Link>
        </section>
      </div>
    </div>
  );
}
