import { Metadata } from 'next';
import { config } from '@/lib/config';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Us | Customer Care & Support',
  description: 'Get in touch with AZEEORA customer care for orders, product consultations, or partnership enquiries in Pakistan. Fast support via WhatsApp and phone.',
  alternates: {
    canonical: `${config.getBaseUrl()}/contact`,
  },
  openGraph: {
    title: 'Contact Us | Customer Care & Support | AZEEORA',
    description: 'Get in touch with AZEEORA customer care for orders, product consultations, or partnership enquiries in Pakistan.',
    url: `${config.getBaseUrl()}/contact`,
    type: 'website',
  },
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact AZEEORA',
    description: 'Get in touch with AZEEORA for orders, product advice, or partnership enquiries.',
    url: `${config.getBaseUrl()}/contact`,
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
