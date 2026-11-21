import type { Metadata } from 'next';
import LegalFooter from '@/components/legal/LegalFooter';
import { config } from '@/lib/config';
import Link from 'next/link';
import { Truck, Clock, ShieldCheck, MapPin, CheckCircle, AlertTriangle, Phone, Mail, Package, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Fast Nationwide COD',
  description: 'Understand AZEEORA shipping timelines, Cash on Delivery (COD) policies, delivery charges, and courier partners across 200+ cities in Pakistan. Delivery in 2–5 working days.',
  alternates: {
    canonical: `${config.getBaseUrl()}/shipping`,
  },
  openGraph: {
    title: 'Shipping & Delivery Policy | Fast Nationwide COD | AZEEORA',
    description: 'Understand AZEEORA shipping timelines, Cash on Delivery policies, and courier partners across Pakistan.',
    url: `${config.getBaseUrl()}/shipping`,
    type: 'website',
  },
};

const cities = [
  { region: 'Major Metros', time: '2 to 3 Business Days', list: 'Lahore, Karachi, Islamabad, Rawalpindi' },
  { region: 'Punjab Central & South', time: '3 to 4 Business Days', list: 'Faisalabad, Multan, Gujranwala, Sialkot, Vehari, Bahawalpur, Sargodha, Gujrat' },
  { region: 'Sindh Cities', time: '3 to 5 Business Days', list: 'Hyderabad, Sukkur, Larkana, Nawabshah, Mirpur Khas' },
  { region: 'Khyber Pakhtunkhwa', time: '3 to 5 Business Days', list: 'Peshawar, Abbottabad, Mardan, Swat, Kohat, D.I. Khan' },
  { region: 'Balochistan & Regional', time: '4 to 6 Business Days', list: 'Quetta, Gwadar, Hub, Turbat, and surrounding regional districts' },
  { region: 'Azad Kashmir & Gilgit', time: '4 to 7 Business Days', list: 'Muzaffarabad, Mirpur, Gilgit, Skardu, Rawalakot' },
];

export default function ShippingPage() {
  const base = config.getBaseUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Shipping & Delivery Policy - AZEEORA Cosmetics',
    description: 'Learn about AZEEORA shipping rates, delivery timelines, Cash on Delivery procedures, and courier tracking across Pakistan.',
    url: `${base}/shipping`,
    publisher: {
      '@type': 'Organization',
      name: 'AZEEORA',
      url: base,
      logo: `${base}/logo.png`,
    },
    inLanguage: 'en-PK',
  };

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Banner */}
      <section className="bg-black text-white py-16 border-b border-gray-800">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-gold/10 text-rose-gold mb-4">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            Fast, secure, and insured Cash on Delivery delivery straight to your doorstep across Pakistan.
          </p>
          <p className="text-xs text-rose-gold mt-3 font-medium uppercase tracking-widest">
            Dispatched Daily from Punjab • Trusted Courier Network
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-12">

          {/* Quick Highlight Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-blush/40 rounded-2xl border border-line">
              <Clock className="w-6 h-6 text-crimson mb-3" />
              <h4 className="font-serif font-bold text-ink mb-1">24–48h Dispatch</h4>
              <p className="text-xs text-muted leading-relaxed">Orders verified and packed securely within 1–2 business days.</p>
            </div>
            <div className="p-6 bg-blush/40 rounded-2xl border border-line">
              <Truck className="w-6 h-6 text-crimson mb-3" />
              <h4 className="font-serif font-bold text-ink mb-1">Nationwide COD</h4>
              <p className="text-xs text-muted leading-relaxed">Pay cash in hand to the courier rider upon delivery anywhere in Pakistan.</p>
            </div>
            <div className="p-6 bg-blush/40 rounded-2xl border border-line">
              <ShieldCheck className="w-6 h-6 text-crimson mb-3" />
              <h4 className="font-serif font-bold text-ink mb-1">Damage-Free Pack</h4>
              <p className="text-xs text-muted leading-relaxed">Bubble-wrapped and sealed in tamper-proof boxes for zero transit leaks.</p>
            </div>
            <div className="p-6 bg-blush/40 rounded-2xl border border-line">
              <Package className="w-6 h-6 text-crimson mb-3" />
              <h4 className="font-serif font-bold text-ink mb-1">Live SMS Tracking</h4>
              <p className="text-xs text-muted leading-relaxed">Track parcel status via SMS tracking link or our Track Order page.</p>
            </div>
          </div>

          {/* Detailed Policy Prose */}
          <div className="prose prose-gray max-w-none text-gray-700 space-y-10 leading-relaxed text-[0.95rem] md:text-base">

            {/* Section 1 */}
            <section className="border-b border-gray-100 pb-8">
              <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">1</span>
                Order Processing & Verification
              </h2>
              <p className="mt-4">
                All orders placed on <a href="https://azeeoracosmetics.com" className="text-rose-gold font-medium">azeeoracosmetics.com</a> are processed from our central dispatch facility in <strong>Vehari, Punjab</strong>. Orders submitted Sunday through Friday are processed within 24 to 48 hours. Orders submitted on Saturdays or national holidays are queued for verification on the next business day.
              </p>
              <p className="mt-3">
                <strong>Cash on Delivery (COD) Phone Verification:</strong> For all new customers and orders exceeding PKR 3,000, our client care team may initiate a quick WhatsApp or phone confirmation to verify the delivery address and active recipient contact details before dispatch. Ensuring your phone number is active and reachable guarantees your parcel ships without delay.
              </p>
            </section>

            {/* Section 2: City Timelines Table */}
            <section className="border-b border-gray-100 pb-8">
              <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">2</span>
                City-by-City Delivery Timelines Across Pakistan
              </h2>
              <p className="mt-4">
                We partner with Pakistan&apos;s leading courier services—including <strong>TCS, Leopards Courier, Trax, and PostEx</strong>—to reach major urban centers as well as remote tehsils and villages:
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-black font-serif">
                      <th className="border border-gray-200 p-3.5 text-left w-1/4">Region</th>
                      <th className="border border-gray-200 p-3.5 text-left w-1/4">Estimated Timeline</th>
                      <th className="border border-gray-200 p-3.5 text-left">Major Cities & Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities.map((c, i) => (
                      <tr key={c.region} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="border border-gray-200 p-3.5 font-bold text-black">{c.region}</td>
                        <td className="border border-gray-200 p-3.5 text-rose-gold font-semibold">{c.time}</td>
                        <td className="border border-gray-200 p-3.5 text-gray-600">{c.list}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted mt-3 italic">
                * Note: Timelines reflect typical courier business days excluding Sundays, public holidays, or severe weather disruptions.
              </p>
            </section>

            {/* Section 3: Shipping Fees */}
            <section className="border-b border-gray-100 pb-8">
              <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">3</span>
                Shipping Charges & Free Delivery Threshold
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-5 bg-blush/60 rounded-2xl border border-line">
                  <h4 className="font-serif font-bold text-ink mb-1">Standard Delivery Fee</h4>
                  <p className="text-2xl font-bold text-crimson mb-2">PKR 200</p>
                  <p className="text-xs text-gray-700 leading-relaxed">Flat shipping rate applied to standard orders below PKR 5,000 anywhere in Pakistan.</p>
                </div>
                <div className="p-5 bg-blush/60 rounded-2xl border border-line">
                  <h4 className="font-serif font-bold text-ink mb-1">Free Delivery Offer</h4>
                  <p className="text-2xl font-bold text-crimson mb-2">FREE</p>
                  <p className="text-xs text-gray-700 leading-relaxed">Orders exceeding PKR 5,000 automatically qualify for 100% free delivery nationwide.</p>
                </div>
              </div>
            </section>

            {/* Section 4: Tracking */}
            <section className="border-b border-gray-100 pb-8">
              <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">4</span>
                Parcel Tracking & Delivery Coordination
              </h2>
              <p className="mt-4">
                As soon as your package is dispatched from our facility, our system generates an airway bill number. You will receive:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3 text-gray-700">
                <li>An automated confirmation email containing your courier name and tracking code.</li>
                <li>An SMS notification containing a direct link to track your rider on the day of out-for-delivery.</li>
                <li>Live on-site tracking by visiting our <Link href="/track-order" className="text-rose-gold font-medium">Track Order</Link> page with your Order Number and email.</li>
              </ul>
              <p className="mt-3">
                On the day of delivery, the courier rider will call you prior to arriving at your address. Please ensure an authorized individual is present with the exact cash amount for COD parcels.
              </p>
            </section>

            {/* Section 5: Delivery Rules */}
            <section className="border-b border-gray-100 pb-8">
              <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">5</span>
                Important Delivery Guidelines & Failed Attempts
              </h2>
              <div className="space-y-4 mt-4 text-gray-700">
                <p>
                  <strong>Accurate Address Requirements:</strong> Please provide complete delivery instructions including house/flat number, street name, area/colony, and city. Incomplete addresses cause delays as riders cannot locate the premises.
                </p>
                <p>
                  <strong>Failed Delivery Attempts:</strong> Our courier partners make up to <strong>two delivery attempts</strong>. If the customer is unavailable or the phone is switched off, the parcel is held at the local courier hub for 48 hours before being returned to our warehouse. If you anticipate being unavailable, please inform our WhatsApp support team to reschedule your delivery date.
                </p>
                <p>
                  <strong>Transit Damage & Inspection:</strong> All cosmetic jars, serums, and bottles are shrink-wrapped and encased in bubble cushioning. If a package arrives visibly broken, leaking, or crushed by the courier, please take a photo immediately and contact our support team within 24 hours. We will ship a replacement at zero extra cost.
                </p>
              </div>
            </section>

            {/* Section 6: Contact */}
            <section className="pb-4">
              <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">6</span>
                Shipping Support & Inquiries
              </h2>
              <p className="mt-4">
                Need help changing your delivery address or inquiring about an in-transit parcel? Our logistics desk is available Monday through Saturday:
              </p>

              <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-rose-gold shrink-0 mt-0.5" />
                    <span>Sharqi Colony, Vehari, Punjab, Pakistan</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-rose-gold shrink-0 mt-0.5" />
                    <a href="tel:+923060466911" className="hover:text-rose-gold transition-colors">+92 306 0466911</a>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-rose-gold shrink-0 mt-0.5" />
                    <a href="mailto:azeeoracosmetics@gmail.com" className="hover:text-rose-gold transition-colors break-all">azeeoracosmetics@gmail.com</a>
                  </div>
                </div>
              </div>
            </section>

            <LegalFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
