import type { Metadata } from 'next';
import LegalFooter from '@/components/legal/LegalFooter';
import { config } from '@/lib/config';
import Link from 'next/link';
import { Shield, FileText, CheckCircle2, AlertCircle, Scale, Truck, CreditCard, RotateCcw, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Legal & Purchase Terms',
  description: 'Read the official Terms of Service for AZEEORA Cosmetics Pakistan. Understand our verified policies on orders, payments (COD, JazzCash, Easypaisa), shipping, and 14-day returns.',
  alternates: {
    canonical: `${config.getBaseUrl()}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | Legal & Purchase Terms | AZEEORA',
    description: 'Read the official Terms of Service for AZEEORA Cosmetics Pakistan.',
    url: `${config.getBaseUrl()}/terms`,
    type: 'website',
  },
};

export default function TermsPage() {
  const base = config.getBaseUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service - AZEEORA Cosmetics',
    description: 'Read the Terms of Service for AZEEORA. Understand our policies on orders, payments, accounts, shipping, and liability.',
    url: `${base}/terms`,
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
            <Scale className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            Please read these terms carefully before purchasing from or using the AZEEORA platform.
          </p>
          <p className="text-xs text-rose-gold mt-3 font-medium uppercase tracking-widest">
            Last Updated: November 2026 • Effective Nationwide in Pakistan
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-gray max-w-none text-gray-700 space-y-10 leading-relaxed text-[0.95rem] md:text-base">

          {/* Section 1 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">1</span>
              Agreement & Acceptance of Terms
            </h2>
            <p className="mt-4">
              Welcome to <strong>AZEEORA</strong> (referred to herein as &quot;AZEEORA&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operating via our official digital storefront at <a href="https://azeeoracosmetics.com" className="text-rose-gold font-medium">https://azeeoracosmetics.com</a>. These Terms of Service constitute a legally binding agreement between you (&quot;Customer&quot;, &quot;User&quot;, or &quot;you&quot;) and AZEEORA, governing your access to and use of our website, digital catalogs, customer support services, and online order placements.
            </p>
            <p className="mt-3">
              By accessing, browsing, registering an account, or placing an order on our platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms, together with our <Link href="/privacy" className="text-rose-gold font-medium">Privacy Policy</Link>, <Link href="/shipping" className="text-rose-gold font-medium">Shipping Policy</Link>, and <Link href="/refunds" className="text-rose-gold font-medium">Refund & Return Policy</Link>. If you do not agree with any portion of these terms, you must refrain from using our platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">2</span>
              Electronic Contracting & Communications
            </h2>
            <p className="mt-4">
              Under the <strong>Electronic Transactions Ordinance, 2002 (ETO 2002)</strong> and applicable consumer protection statutes of the Islamic Republic of Pakistan, electronic contracts and digital acceptances entered into via website clicks, order submissions, and confirmation messages carry full legal validity and enforceability.
            </p>
            <p className="mt-3">
              When you submit an order, contact our support team, or provide your email address and mobile number, you expressly consent to receive transactional notifications, dispatch alerts, courier tracking numbers, and account updates electronically via Email, SMS, or WhatsApp.
            </p>
          </section>

          {/* Section 3 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">3</span>
              Product Descriptions, Pricing & Availability
            </h2>
            <p className="mt-4">
              AZEEORA specializes in high-grade skincare, hair care, and beauty formulations specifically developed for Pakistani weather, skin types, and seasons. We take extreme care to display accurate descriptions, ingredient listings, usage instructions, and product imagery. However:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-gray-600">
              <li><strong>Pricing Currency:</strong> All prices displayed on our website are denominated in Pakistani Rupees (PKR) and include applicable product sales taxes unless otherwise explicitly noted.</li>
              <li><strong>Price Adjustments:</strong> We reserve the right to amend pricing, promotions, and discounts at any time without prior notice. Price adjustments will not affect orders that have already received an official order confirmation.</li>
              <li><strong>Packaging & Revisions:</strong> While product formulations remain consistent and certified, bottle designs, labels, and outer cartons may undergo design updates from time to time without diminishing the quality or quantity of the formulation.</li>
              <li><strong>Inventory Availability:</strong> All orders are subject to stock availability. In the rare event that an item becomes out of stock after your order is submitted, our client care team will promptly notify you with the option of waiting for restock, choosing an equivalent product, or receiving an immediate full refund.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">4</span>
              Orders, Verification & Acceptance
            </h2>
            <p className="mt-4">
              When you complete checkout on our platform, your order constitutes an offer to purchase. AZEEORA reserves the right to accept, hold, or decline orders in cases of suspected fraud, unauthorized reseller activity, incorrect address details, or repeated unverified order cancellations.
            </p>
            <div className="bg-blush/60 p-5 rounded-xl border border-line mt-4">
              <h4 className="font-bold text-ink mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-crimson" /> Cash on Delivery (COD) Phone Verification
              </h4>
              <p className="text-sm text-gray-700">
                To prevent fraudulent orders and ensure swift delivery across Pakistan, our operations team may contact you via WhatsApp or phone call on the contact number provided at checkout to verify your shipping address before parcel dispatch. Unverified orders with invalid contact numbers may be canceled after 48 hours.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">5</span>
              Payment Methods & Security
            </h2>
            <p className="mt-4">
              We offer convenient, secure payment solutions across all provinces of Pakistan:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <p className="font-bold text-black mb-1">Cash on Delivery (COD)</p>
                <p className="text-xs text-gray-600">Pay cash in hand to the courier rider upon delivery at your doorstep anywhere in Pakistan.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <p className="font-bold text-black mb-1">JazzCash & Easypaisa</p>
                <p className="text-xs text-gray-600">Fast digital wallet transfers for instant prepaid order confirmation.</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <p className="font-bold text-black mb-1">Debit & Credit Cards</p>
                <p className="text-xs text-gray-600">Processed through encrypted, PCI-DSS compliant payment gateways with 3D-Secure protection.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">6</span>
              Shipping, Delivery Timelines & Risk of Loss
            </h2>
            <p className="mt-4">
              Orders are dispatched from our central facility within 24 to 48 business hours following verification. Nationwide transit times are typically:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2 text-gray-600">
              <li><strong>Major Metros (Lahore, Karachi, Islamabad, Rawalpindi):</strong> 2 to 3 working days.</li>
              <li><strong>Punjab & Sindh Cities (Faisalabad, Multan, Gujranwala, Sialkot, Hyderabad, Vehari):</strong> 3 to 4 working days.</li>
              <li><strong>KPK, Balochistan & Regional Towns:</strong> 4 to 6 working days.</li>
            </ul>
            <p className="mt-3">
              Title and risk of loss for all purchased goods transfer to the customer upon parcel delivery by our courier partners (TCS, Leopards Courier, Trax, PostEx). Please inspect external packaging upon receipt and document any transit damage immediately.
            </p>
          </section>

          {/* Section 7 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">7</span>
              14-Day Return, Replacement & Hygiene Standards
            </h2>
            <p className="mt-4">
              We stand behind the authenticity and quality of every AZEEORA product. If you receive an incorrect item or an item damaged during transit, you are entitled to a free, prompt replacement under our <Link href="/refunds" className="text-rose-gold font-medium">Refund & Returns Policy</Link>.
            </p>
            <p className="mt-3">
              <strong>Hygiene & Safety Protection:</strong> Due to strict health, hygiene, and cosmetic safety standards, any cosmetic product that has been opened, unsealed, sampled, or used cannot be returned or refunded unless medically verified as defective upon arrival. All return requests must be filed within <strong>14 days of delivery</strong> with original packaging and receipt.
            </p>
          </section>

          {/* Section 8 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">8</span>
              Skincare Guidance & Patch Testing Disclaimer
            </h2>
            <p className="mt-4">
              AZEEORA products are formulated with dermatologically tested, gentle, and active ingredients (including Niacinamide, Glutathione, Alpha Arbutin, Vitamin C, and herbal botanicals). However, individual skin profiles differ:
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mt-3 text-amber-900 text-sm">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Mandatory Patch Test Recommendation
              </p>
              <p>
                We strongly advise performing a patch test on the inner forearm or behind the ear 24 hours prior to first facial application. If severe irritation, swelling, or redness occurs, discontinue use immediately and consult a qualified medical professional. Content provided on this website is for educational and cosmetic purposes only and does not constitute medical diagnosis or prescription.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">9</span>
              Intellectual Property Rights
            </h2>
            <p className="mt-4">
              All visual trademarks, brand logos, photographic assets, custom product packaging graphics, typography, editorial blog articles, website copy, and software code on <a href="https://azeeoracosmetics.com" className="text-rose-gold">azeeoracosmetics.com</a> are the exclusive intellectual property of AZEEORA Cosmetics.
            </p>
            <p className="mt-3">
              Any unauthorized reproduction, digital scraping, imitation, commercial re-distribution, or brand impersonation is strictly prohibited under the Copyright Ordinance, 1962 and the Trade Marks Ordinance, 2001 of Pakistan and will be subject to immediate legal action.
            </p>
          </section>

          {/* Section 10 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">10</span>
              User Accounts & Prohibited Uses
            </h2>
            <p className="mt-4">
              When creating an account on our platform, you agree to supply authentic, updated, and accurate personal information. You are solely responsible for safeguarding your login credentials and password. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2 text-gray-600">
              <li>Use the website for any fraudulent, unlawful, or unauthorized purpose.</li>
              <li>Impersonate any person, business entity, or AZEEORA representative.</li>
              <li>Interfere with the security, network infrastructure, or API endpoints of the store.</li>
              <li>Place fictitious, abusive, or bulk non-genuine orders intended to disrupt courier logistics.</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">11</span>
              Limitation of Liability & Indemnification
            </h2>
            <p className="mt-4">
              To the fullest extent permitted by applicable law in Pakistan, AZEEORA and its directors, founders, employees, and authorized affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use our products or website. In any case, AZEEORA&apos;s aggregate liability shall not exceed the actual purchase amount paid by the customer for the specific product in question.
            </p>
            <p className="mt-3">
              You agree to defend, indemnify, and hold harmless AZEEORA from and against any third-party claims, liabilities, damages, and expenses arising from your violation of these Terms or misuse of the platform.
            </p>
          </section>

          {/* Section 12 */}
          <section className="pb-4">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">12</span>
              Governing Law, Jurisdiction & Official Contact
            </h2>
            <p className="mt-4">
              These Terms of Service and any contractual disputes arising out of the sale of goods shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any legal proceedings or dispute arbitrations shall be submitted to the exclusive jurisdiction of the competent civil courts in <strong>Vehari, Punjab, Pakistan</strong>.
            </p>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="font-serif font-bold text-lg text-black mb-4">Official Contact & Legal Inquiries</h3>
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
  );
}
