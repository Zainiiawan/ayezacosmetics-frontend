import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

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

  return (
    <footer className={`bg-[#0a0a0a] text-white ${className || ''}`}>
      {/* Newsletter Section */}
      <div className="relative bg-[#8b4d5b] py-5 overflow-hidden">
        {/* Subtle Decorative Rose Graphics */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/4 opacity-10 pointer-events-none">
          <svg width="300" height="300" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M50 50 Q 50 10, 90 10 T 50 50 Z" />
            <path d="M50 50 Q 90 50, 90 90 T 50 50 Z" />
            <path d="M50 50 Q 50 90, 10 90 T 50 50 Z" />
            <path d="M50 50 Q 10 50, 10 10 T 50 50 Z" />
            <circle cx="50" cy="50" r="15" />
            <circle cx="50" cy="50" r="5" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 opacity-10 pointer-events-none">
          <svg width="300" height="300" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M50 50 Q 50 10, 90 10 T 50 50 Z" />
            <path d="M50 50 Q 90 50, 90 90 T 50 50 Z" />
            <path d="M50 50 Q 50 90, 10 90 T 50 50 Z" />
            <path d="M50 50 Q 10 50, 10 10 T 50 50 Z" />
            <circle cx="50" cy="50" r="15" />
            <circle cx="50" cy="50" r="5" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <Mail className="w-5 h-5 mx-auto mb-1 text-[#1A1A1A]/80" strokeWidth={1.5} />
            <h3 className="text-xl md:text-2xl font-serif font-bold mb-1" style={{ color: '#1A1A1A' }}>Subscribe to Our Newsletter</h3>
            <p className="text-white/70 mb-4 text-xs md:text-sm">Get exclusive offers, beauty tips, and new arrivals.</p>
            <form className="flex flex-col sm:flex-row gap-2 justify-center">
              <div className="relative flex-1 max-w-sm mx-auto sm:mx-0 w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 transition-colors text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-[#111] text-white px-5 py-2 rounded-md font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 text-sm border border-[#111] mx-auto sm:mx-0"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="w-full bg-[#0a0a0a]">
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 py-10">
          <div className="flex flex-col lg:flex-row justify-center items-start w-full gap-10 lg:gap-14 xl:gap-[80px]">
            
            {/* Brand & About */}
            <div className="flex flex-col w-full lg:w-auto max-w-[320px]">
              <div>
                <h4 style={{ color: '#B56A82' }} className="text-lg font-bold mb-1 tracking-wide uppercase">
                  AYEZA COSMETICS
                </h4>
                <div style={{ backgroundColor: '#B56A82' }} className="w-12 h-[2px] mb-3"></div>
              </div>
              <p className="text-gray-300 mb-4 text-base leading-snug">
                Luxury beauty products curated for the modern woman. Experience the difference with premium cosmetics.
              </p>
              <div className="flex gap-4 mt-1">
                <a href="#" aria-label="Instagram" style={{ color: '#B56A82', borderColor: '#374151' }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-[#B56A82] hover:text-white transition-all"><InstagramIcon className="w-5 h-5" /></a>
                <a href="#" aria-label="Facebook" style={{ color: '#B56A82', borderColor: '#374151' }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-[#B56A82] hover:text-white transition-all"><FacebookIcon className="w-5 h-5" /></a>
                <a href="#" aria-label="TikTok" style={{ color: '#B56A82', borderColor: '#374151' }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-[#B56A82] hover:text-white transition-all"><TikTokIcon className="w-5 h-5" /></a>
                <a href="#" aria-label="WhatsApp" style={{ color: '#B56A82', borderColor: '#374151' }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-[#B56A82] hover:text-white transition-all"><WhatsAppIcon className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Shop */}
            <div className="flex flex-col w-full lg:w-auto">
              <div>
                <h5 style={{ color: '#B56A82' }} className="text-lg font-bold mb-1 tracking-wide uppercase">Shop</h5>
                <div style={{ backgroundColor: '#B56A82' }} className="w-8 h-[2px] mb-3"></div>
              </div>
              <ul className="space-y-1.5">
                {footerLinks.shop.map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-base block">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="flex flex-col w-full lg:w-auto">
              <div>
                <h5 style={{ color: '#B56A82' }} className="text-lg font-bold mb-1 tracking-wide uppercase">Categories</h5>
                <div style={{ backgroundColor: '#B56A82' }} className="w-8 h-[2px] mb-3"></div>
              </div>
              <ul className="space-y-1.5">
                {footerLinks.categories.map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-base block">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information */}
            <div className="flex flex-col w-full lg:w-auto">
              <div>
                <h5 style={{ color: '#B56A82' }} className="text-lg font-bold mb-1 tracking-wide uppercase">Information</h5>
                <div style={{ backgroundColor: '#B56A82' }} className="w-8 h-[2px] mb-3"></div>
              </div>
              <ul className="space-y-1.5">
                {footerLinks.information.map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-base block">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="flex flex-col w-full lg:w-auto">
              <div>
                <h5 style={{ color: '#B56A82' }} className="text-lg font-bold mb-1 tracking-wide uppercase">Contact Us</h5>
                <div style={{ backgroundColor: '#B56A82' }} className="w-8 h-[2px] mb-3"></div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-gray-300 text-base whitespace-nowrap">
                  <MapPin style={{ color: '#B56A82' }} className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  <span>Sahiwal, Punjab, Pakistan</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-base whitespace-nowrap">
                  <Phone style={{ color: '#B56A82' }} className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  <a href="tel:+923060466911" className="hover:text-white transition-colors">+92 306 0466911</a>
                </li>
                <li className="flex items-center gap-3 text-gray-300 text-base whitespace-nowrap">
                  <Mail style={{ color: '#B56A82' }} className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                  <a href="mailto:ayezacosmtics@gmail.com" className="hover:text-white transition-colors">ayezacosmtics@gmail.com</a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-base">
              © {currentYear} AYEZA COSMETICS. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-end gap-x-5 gap-y-2 text-base text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-gray-700 hidden lg:inline">|</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <span className="text-gray-700 hidden lg:inline">|</span>
              <Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
              <span className="text-gray-700 hidden lg:inline">|</span>
              <Link href="/refunds" className="hover:text-white transition-colors">Refund & Returns</Link>
              <span className="text-gray-700 hidden lg:inline">|</span>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;