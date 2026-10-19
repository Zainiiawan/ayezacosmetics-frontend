import type { Metadata } from 'next';
import LegalFooter from '@/components/legal/LegalFooter';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy | AZEEORA',
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-serif font-bold mb-8">Cookie Policy</h1>
      <div className="prose prose-gray space-y-4 text-gray-600">
        <p>This Cookie Policy explains how AZEEORA uses cookies and similar technologies to recognize you when you visit our website.</p>
        
        <h2 className="text-xl font-semibold text-black mt-8">What are cookies?</h2>
        <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
        
        <h2 className="text-xl font-semibold text-black mt-8">Why do we use cookies?</h2>
        <p>We only use first-party storage that the store needs to work. These cookies and local storage entries are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. For example, they allow us to remember the items in your shopping cart and keep you logged in.</p>
        <p>We do not use advertising or tracking cookies, and we do not sell or share browsing data with third parties.</p>
        
        <h2 className="text-xl font-semibold text-black mt-8">Types of cookies we use</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., authentication, security, cart management).</li>
          <li><strong>Functionality storage:</strong> Remembers your bag and wishlist on this device so they are still there when you come back.</li>
        </ul>

        <h2 className="text-xl font-semibold text-black mt-8">How can I control cookies?</h2>
        <p>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. We only use storage that is needed to run the store, such as keeping you signed in and remembering your bag; blocking it may stop some features from working.</p>
        
        <h2 className="text-xl font-semibold text-black mt-8">Contact Us</h2>
        <p>If you have any questions about our use of cookies, please contact us at <a href="mailto:azeeoracosmetics@gmail.com" className="text-rose-gold">azeeoracosmetics@gmail.com</a>.</p>
        <LegalFooter />
      </div>
    </div>
  );
}
