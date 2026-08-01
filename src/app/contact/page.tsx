import { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Us | AYEZA COSMETICS',
  description: 'Get in touch with AYEZA COSMETICS for orders, product advice, or partnership enquiries. We are here to help.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | AYEZA COSMETICS',
    description: 'Get in touch with AYEZA COSMETICS for orders, product advice, or partnership enquiries.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact AYEZA COSMETICS',
    description: 'Get in touch with AYEZA COSMETICS for orders, product advice, or partnership enquiries.',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store'}/contact`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactPageClient />
    </>
  );
}
