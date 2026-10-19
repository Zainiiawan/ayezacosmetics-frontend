'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut, Shield } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import Wordmark from '@/components/brand/Wordmark';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settingsApi';

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  const cartItemCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistItemCount = useSelector(
    (state: RootState) => state.wishlist.items.length
  );

  const navigation = [
    { name: 'Shop', href: '/shop' },
    { name: 'Categories', href: '/categories' },
    { name: 'Offers', href: '/offers' },
    { name: 'Journal', href: '/blog' },
    { name: 'Our Story', href: '/about' },
  ];
  const moreLinks = [
    { name: 'Track Order', href: '/track-order' },
    { name: 'Contact', href: '/contact' },
    { name: 'Help & FAQ', href: '/help' },
  ];

  const { data: storeSettings } = useQuery({ queryKey: ['store-settings'], queryFn: settingsApi.getSettings, staleTime: 10 * 60_000 });
  const announcements = [
    'Cash on Delivery all over Pakistan',
    storeSettings?.freeShippingThreshold ? `Free delivery on orders over Rs ${storeSettings.freeShippingThreshold.toLocaleString()}` : 'Fast delivery across Pakistan',
    'Easy 14-day returns',
    'Made for Pakistani skin and weather',
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      router.push('/');
    } catch {
      router.push('/');
    } finally {
      setIsLoggingOut(false);
      setIsMobileMenuOpen(false);
    }
  };

  const iconBtn = 'w-11 h-11 flex items-center justify-center text-ink hover:bg-blush hover:text-crimson rounded-full transition-colors relative shrink-0';
  const badge = 'absolute -top-0.5 -right-0.5 bg-crimson text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center';

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50">
      <div className="bg-crimson text-white overflow-hidden h-[34px] flex items-center" aria-label="Store announcements">
        <div className="marquee-track flex whitespace-nowrap w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex" aria-hidden={copy === 1}>
              {announcements.map((t) => (
                <span key={t} className="eyebrow !text-[0.66rem] !tracking-[0.28em] px-8 flex items-center gap-8">
                  {t}
                  <span className="text-white/60">❀</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-md border-b border-line">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-16 lg:h-[76px] grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${iconBtn} lg:hidden`}
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <nav className="hidden lg:flex items-center gap-7">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="group relative text-[0.8rem] uppercase tracking-[0.16em] font-medium text-ink hover:text-crimson transition-colors">
                  {item.name}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-crimson transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="justify-self-center text-[26px] lg:text-[34px]" aria-label="AZEEORA home">
            <Wordmark priority />
          </Link>

          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={iconBtn} aria-label="Search">
              <Search className="w-5 h-5" strokeWidth={1.6} />
            </button>

            <Link href="/wishlist" className={`${iconBtn} hidden lg:flex`} aria-label="Wishlist">
              <Heart className="w-5 h-5" strokeWidth={1.6} />
              {wishlistItemCount > 0 && <span className={badge}>{wishlistItemCount > 99 ? '99+' : wishlistItemCount}</span>}
            </Link>

            <div className="hidden lg:flex shrink-0 items-center">
              <NotificationBell />
            </div>

            {isAuthenticated && user ? (
              <div className="hidden lg:flex items-center gap-1">
                <Link href="/account" className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-line hover:bg-blush transition-colors">
                  <span className="w-7 h-7 rounded-full bg-blush text-crimson flex items-center justify-center text-[0.8rem] font-semibold">
                    {user.firstName?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
                  </span>
                  <span className="text-sm font-medium text-ink max-w-[90px] truncate">{user.firstName}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className={iconBtn} aria-label="Admin Panel" title="Admin Panel">
                    <Shield className="w-5 h-5" strokeWidth={1.6} />
                  </Link>
                )}
                <button
                  onClick={() => void handleLogout()}
                  disabled={isLoggingOut}
                  className={`${iconBtn} hover:!text-crimson disabled:opacity-50`}
                  aria-label={isLoggingOut ? 'Logging out' : 'Logout'}
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.6} />
                </button>
              </div>
            ) : (
              <Link href="/login" className={`${iconBtn} hidden lg:flex`} aria-label="Account">
                <User className="w-5 h-5" strokeWidth={1.6} />
              </Link>
            )}

            <Link href="/cart" className={iconBtn} aria-label="Cart">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.6} />
              {cartItemCount > 0 && <span className={badge}>{cartItemCount > 99 ? '99+' : cartItemCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blush border-b border-line overflow-hidden"
          >
            <div className="max-w-3xl mx-auto px-4 py-5">
              <form action="/shop" method="get" className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search face wash, cream, glow..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-full border border-line bg-white text-gray-900 placeholder:text-gray-500 focus:border-crimson focus:ring-2 focus:ring-crimson/20 focus:outline-none"
                  autoFocus
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[98px] bg-ink/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-full left-0 w-full bg-white overflow-hidden overflow-y-auto overscroll-contain max-h-[calc(100dvh-98px)] z-50 shadow-xl lg:hidden"
            >
              <nav className="px-6 py-6">
                <div className="flex flex-col gap-1">
                  {[...navigation, ...moreLinks].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="font-serif text-[1.2rem] text-ink hover:text-crimson transition-colors py-2.5 border-b border-line"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <Link
                    href="/wishlist"
                    className="font-serif text-[1.2rem] text-ink hover:text-crimson transition-colors py-2.5 border-b border-line flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Wishlist
                    {wishlistItemCount > 0 && (
                      <span className="bg-crimson text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
                      </span>
                    )}
                  </Link>
                  {isAuthenticated && user ? (
                    <>
                      <Link href="/account" className="text-ink hover:text-crimson font-medium py-3" onClick={() => setIsMobileMenuOpen(false)}>
                        My Account ({user.firstName})
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="text-ink hover:text-crimson font-medium py-3" onClick={() => setIsMobileMenuOpen(false)}>
                          Admin Panel
                        </Link>
                      )}
                      <Button variant="outline" onClick={() => void handleLogout()} loading={isLoggingOut} className="w-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-4">
                      <Button className="w-full">Sign In</Button>
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
