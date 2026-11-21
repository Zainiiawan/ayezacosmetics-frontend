import type { Metadata } from 'next';
import LegalFooter from '@/components/legal/LegalFooter';
import { config } from '@/lib/config';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Data Protection & Security',
  description: 'Read the official Privacy Policy of AZEEORA Cosmetics Pakistan. Learn how we safeguard your personal data, ensure secure payments (COD, JazzCash, Easypaisa), and respect your privacy rights.',
  alternates: {
    canonical: `${config.getBaseUrl()}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | Data Protection & Security | AZEEORA',
    description: 'Read the official Privacy Policy of AZEEORA Cosmetics Pakistan. Learn how we safeguard your personal data and protect your rights.',
    url: `${config.getBaseUrl()}/privacy`,
    type: 'website',
  },
};

export default function PrivacyPage() {
  const base = config.getBaseUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy - AZEEORA Cosmetics',
    description: 'Learn how AZEEORA collects, protects, and manages customer personal information across Pakistan.',
    url: `${base}/privacy`,
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
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            Your trust is our highest priority. Learn how we safeguard your personal information and uphold strict data security.
          </p>
          <p className="text-xs text-rose-gold mt-3 font-medium uppercase tracking-widest">
            Last Updated: November 2026 • Compliant with Pakistani PECA & Consumer Protection Laws
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
              Our Commitment to Your Privacy
            </h2>
            <p className="mt-4">
              At <strong>AZEEORA</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), operating at <a href="https://azeeoracosmetics.com" className="text-rose-gold font-medium">https://azeeoracosmetics.com</a>, we respect your fundamental right to privacy. We are committed to transparency in how we collect, utilize, store, and protect your personal information when you browse our luxury cosmetics store, place orders, or communicate with our customer support team in Pakistan.
            </p>
            <p className="mt-3">
              This Privacy Policy explains what data we collect, why we need it, the stringent measures we take to keep it secure, and your legal rights under the <strong>Prevention of Electronic Crimes Act, 2016 (PECA)</strong> and relevant consumer protection statutes of Pakistan.
            </p>
          </section>

          {/* Section 2 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">2</span>
              Information We Collect
            </h2>
            <p className="mt-4">
              We collect only the minimum personal data strictly necessary to fulfill your beauty orders and deliver an exceptional shopping experience:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-rose-gold" /> Contact & Delivery Details
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Full name, mobile telephone number (essential for courier SMS and delivery rider coordination), complete delivery street address, city, and nearest landmark.
                </p>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-rose-gold" /> Order & Transaction History
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Products purchased, order dates, payment status, discount coupons redeemed, and delivery tracking records.
                </p>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-gold" /> Account Credentials
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your registered email address, securely hashed password (we never store plain passwords), and one-time password (OTP) verification logs.
                </p>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-rose-gold" /> Technical & Browser Data
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  IP address, browser version, and device type collected automatically to prevent fraudulent bot activity and render optimized screen layouts.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">3</span>
              How We Use Your Personal Data
            </h2>
            <p className="mt-4">
              We process your personal information strictly for legitimate commercial and operational purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-gray-700">
              <li><strong>Order Processing & Logistics:</strong> Printing dispatch manifests, generating courier airway bills, and delivering parcels to your address.</li>
              <li><strong>Customer Communications:</strong> Sending automated order confirmations, dispatch notices, courier tracking links, and answering support queries via phone or WhatsApp.</li>
              <li><strong>Fraud Prevention:</strong> Verifying Cash on Delivery (COD) orders with high ticket values to protect against fraudulent claims and automated spam orders.</li>
              <li><strong>Returns & Warranty Processing:</strong> Managing 14-day return and exchange requests and processing refunds via Bank Transfer or Easypaisa.</li>
              <li><strong>Platform Optimization:</strong> Analyzing aggregate website traffic to improve catalog browsing speed, mobile responsiveness, and checkout convenience.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">4</span>
              Payment Security & Financial Information
            </h2>
            <p className="mt-4">
              We believe in total financial transparency and zero risk for our customers:
            </p>
            <div className="bg-blush/60 p-6 rounded-2xl border border-line mt-4 space-y-3">
              <p className="text-sm text-gray-800">
                <strong>No Credit Card Storage:</strong> AZEEORA does <em>not</em> store, process, or have access to your sensitive debit or credit card numbers, CVV codes, or banking PINs. Online card payments are handled exclusively by certified, PCI-DSS compliant payment gateways (such as Stripe) using 256-bit SSL encryption and 3D-Secure authentication.
              </p>
              <p className="text-sm text-gray-800">
                <strong>Cash on Delivery (COD):</strong> For maximum peace of mind, you do not need to share any banking details online. You pay in cash directly to the courier rider upon physical receipt of your package at your doorstep.
              </p>
              <p className="text-sm text-gray-800">
                <strong>JazzCash & Easypaisa:</strong> Digital wallet transactions are processed via standard account-to-account mobile transfers. Payment confirmation screenshots are stored securely and used solely to verify payment before order dispatch.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">5</span>
              Data Sharing & Third-Party Partners
            </h2>
            <p className="mt-4">
              <strong>We do NOT sell, rent, lease, or trade your personal information to third-party advertisers, data aggregators, or marketing agencies.</strong> Your data is shared strictly on a confidential need-to-know basis with trusted operational partners:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-gray-700">
              <li><strong>Authorized Logistics Partners (TCS, Leopards Courier, Trax, PostEx):</strong> We share your recipient name, delivery address, and active contact number exclusively to ensure doorstep delivery and SMS parcel tracking.</li>
              <li><strong>Cloud & Hosting Infrastructure:</strong> Secure cloud infrastructure providers (Vercel, Render, Cloudinary) host our platform under strict enterprise confidentiality and encryption protocols.</li>
              <li><strong>Legal Obligations:</strong> We may disclose information only if required by a court of competent jurisdiction or formal law enforcement directive in Pakistan.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">6</span>
              Cookies & Local Browser Storage
            </h2>
            <p className="mt-4">
              AZEEORA uses first-party essential cookies and local browser storage to keep our store functioning smoothly. These allow our system to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2 text-gray-600">
              <li>Remember products placed in your shopping cart across sessions.</li>
              <li>Maintain your secure sign-in status while browsing.</li>
              <li>Remember products saved to your personal wishlist on this device.</li>
            </ul>
            <p className="mt-3">
              We do not use invasive third-party tracking cookies or sell your browsing history. For complete information, please consult our dedicated <Link href="/cookies" className="text-rose-gold font-medium">Cookie Policy</Link>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">7</span>
              Data Retention & Security Safeguards
            </h2>
            <p className="mt-4">
              We employ comprehensive technical and managerial safeguards to protect your personal information against unauthorized access, alteration, loss, or disclosure:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-gray-700">
              <li><strong>Transport Layer Security (TLS/HTTPS):</strong> All data transmitted between your browser and our servers is encrypted using modern TLS encryption.</li>
              <li><strong>Access Control:</strong> Only authorized operations personnel have access to order manifests, protected by multi-factor authentication.</li>
              <li><strong>Retention Timelines:</strong> Transaction records are retained only as long as necessary to satisfy legal, accounting, tax, and warranty requirements, after which they are securely archived or purged.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="border-b border-gray-100 pb-8">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">8</span>
              Your Privacy Rights
            </h2>
            <p className="mt-4">
              As an AZEEORA customer, you hold clear rights regarding your personal data:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <strong>Access & Correction:</strong> You can review and update your name, address, and profile details anytime by logging into your account dashboard.
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <strong>Data Deletion:</strong> You have the right to request deletion of your account and associated personal data by contacting our support desk.
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <strong>Marketing Opt-Out:</strong> You may unsubscribe from promotional emails at any time by clicking the unsubscribe link or contacting us.
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <strong>Inquiry & Grievances:</strong> If you have concerns about how your data is handled, our team provides prompt written resolution within 48 hours.
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section className="pb-4">
            <h2 className="text-2xl font-serif font-bold text-black flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-gold text-sm font-sans font-bold flex items-center justify-center shrink-0">9</span>
              Contact Our Privacy Officer
            </h2>
            <p className="mt-4">
              If you have any questions, feedback, or requests regarding this Privacy Policy or your personal information, please contact our team directly:
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
  );
}
