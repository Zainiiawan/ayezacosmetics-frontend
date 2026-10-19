import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import Wordmark from '@/components/brand/Wordmark';

const Footer = ({ className }: { className?: string }) => {
  const currentYear = new Date().getFullYear();

  // Custom SVGs for social icons to avoid version conflicts in lucide-react
  const FacebookIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );

  const InstagramIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );

  const TikTokIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );

  const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  const footerLinks = {
    shop: [
      { name: 'All Products', href: '/shop' },
      { name: 'New Arrivals', href: '/shop?sort=new' },
      { name: 'Best Sellers', href: '/shop?sort=popular' },
      { name: 'Sale', href: '/shop?sort=sale' },
    ],
    categories: [
      { name: 'Skincare', href: '/categories/skincare' },
      { name: 'Makeup', href: '/categories/makeup' },
      { name: 'Fragrances', href: '/categories/fragrances' },
      { name: 'Hair Care', href: '/categories/hair-care' },
    ],
    information: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
  };

  const columns: [string, { name: string; href: string }[]][] = [
    ['Shop', footerLinks.shop],
    ['Explore', footerLinks.information],
    [
      'Client care',
      [
        { name: 'Track your order', href: '/track-order' },
        { name: 'Help & FAQ', href: '/help' },
        { name: 'Shipping', href: '/shipping' },
        { name: 'Returns & refunds', href: '/refunds' },
      ],
    ],
  ];
  const social = [
    { label: 'Instagram', href: 'https://www.instagram.com/ayezacosmetics.store?igsh=eTF3dnZkbHUwZmph', Icon: InstagramIcon },
    { label: 'Facebook', href: 'https://www.facebook.com/share/1JMakEmR81/', Icon: FacebookIcon },
    { label: 'TikTok', href: 'https://www.tiktok.com/@ayezacosmetics.store?_r=1&_t=ZN-98aOm1iZDQF', Icon: TikTokIcon },
    { label: 'WhatsApp', href: 'https://wa.me/923060466911', Icon: WhatsAppIcon },
  ];

  return (
    <footer className={`relative bg-emerald text-ivory overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0 jaali opacity-60 pointer-events-none" aria-hidden />

      {/* Newsletter */}
      <div className="relative border-b border-gold/20">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-14 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="eyebrow text-gold-soft">The AZEEORA circle</p>
            <h3 className="mt-3 font-serif text-[2rem] md:text-[2.6rem] leading-tight !text-ivory">
              Glow notes, first looks <span className="gold-text">&amp; Eid offers</span>
            </h3>
            <p className="mt-3 text-ivory/70 max-w-md">New launches, skin tips for Pakistani weather and members-only offers. A few emails a season, never spam.</p>
          </div>
          <form className="flex flex-col sm:flex-row gap-3 lg:justify-end">
            <label className="relative flex-1 max-w-md">
              <span className="sr-only">Email address</span>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald/50" />
              <input
                type="email"
                placeholder="Your email address"
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-ivory border border-gold/40 text-emerald placeholder:text-gray-500 focus:outline-none focus:border-gold text-sm"
              />
            </label>
            <button type="submit" className="bg-gold text-emerald px-7 py-3.5 rounded-full font-semibold tracking-[0.06em] hover:bg-gold-soft transition-colors flex items-center justify-center gap-2 text-sm">
              Join the circle
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10 py-14 grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr]">
        <div className="max-w-sm">
          <Link href="/" className="text-[34px] inline-block" aria-label="AZEEORA home">
            <Wordmark light />
          </Link>
          <p className="mt-5 text-ivory/70 leading-relaxed">
            Thoughtful skincare made for Pakistani skin, sun and seasons. Gentle formulas, honest prices, delivered to your door.
          </p>
          <p className="mt-4 font-urdu text-[1.35rem] text-gold-soft" lang="ur" dir="rtl">
            آپ کی خوبصورتی، ہماری پہچان
          </p>
          <div className="flex gap-3 mt-6">
            {social.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 rounded-full border border-gold/40 text-gold-soft flex items-center justify-center hover:bg-gold hover:text-emerald transition-all"
              >
                <Icon className="w-[18px] h-[18px]" />
              </a>
            ))}
          </div>
        </div>

        {columns.map(([title, links]) => (
          <div key={title}>
            <h5 className="eyebrow text-gold-soft !font-semibold">{title}</h5>
            <ul className="mt-5 space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-ivory/75 hover:text-gold-soft transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h5 className="eyebrow text-gold-soft !font-semibold">Contact us</h5>
          <ul className="mt-5 space-y-4 text-ivory/75">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold-soft shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>Sahiwal, Punjab, Pakistan</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gold-soft shrink-0 mt-0.5" strokeWidth={1.5} />
              <a href="tel:+923060466911" className="hover:text-gold-soft transition-colors">+92 306 0466911</a>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gold-soft shrink-0 mt-0.5" strokeWidth={1.5} />
              <a href="mailto:ayezacosmtics@gmail.com" className="hover:text-gold-soft transition-colors break-all">ayezacosmtics@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-gold/20 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-5 flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-ivory/55">
          <p>© {currentYear} AZEEORA. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-gold-soft transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gold-soft transition-colors">Terms</Link>
            <Link href="/shipping" className="hover:text-gold-soft transition-colors">Shipping</Link>
            <Link href="/refunds" className="hover:text-gold-soft transition-colors">Refunds</Link>
            <Link href="/cookies" className="hover:text-gold-soft transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
