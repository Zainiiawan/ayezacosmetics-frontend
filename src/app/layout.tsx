import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";
import ScrollToTop from "@/components/layout/ScrollToTop";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

import { getBaseUrl } from "@/lib/config";

const APP_URL = getBaseUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "AYEZA COSMETICS | Luxury Beauty Products",
    template: "%s | AYEZA COSMETICS",
  },
  description: "Discover premium luxury cosmetics curated for the modern woman. Shop skincare, makeup, fragrances, and more.",
  keywords: ["cosmetics", "beauty", "skincare", "makeup", "luxury", "Pakistan"],
  authors: [{ name: "AYEZA COSMETICS" }],
  manifest: "/manifest.webmanifest",

  openGraph: {
    title: "AYEZA COSMETICS | Luxury Beauty Products",
    description: "Discover premium luxury cosmetics curated for the modern woman.",
    type: "website",
    url: APP_URL,
    siteName: "AYEZA COSMETICS",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "AYEZA COSMETICS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AYEZA COSMETICS | Luxury Beauty Products",
    description: "Discover premium luxury cosmetics curated for the modern woman.",
    images: ["/logo.png"],
  },
  verification: {
    google: "hJhcaTPMOXI5_KbIDYvh6rf99bjD9SSs-CrFGEcwtAo",
    other: {
      "msvalidate.01": "YOUR_BING_VERIFICATION_CODE", // Placeholder
      "p:domain_verify": "YOUR_PINTEREST_VERIFICATION_CODE", // Placeholder
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AYEZA COSMETICS",
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    sameAs: [
      "https://www.facebook.com/share/1JMakEmR81/",
      "https://www.instagram.com/ayezacosmetics.store?igsh=eTF3dnZkbHUwZmph",
      "https://www.tiktok.com/@ayezacosmetics.store?_r=1&_t=ZN-98aOm1iZDQF"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-306-0466911",
      contactType: "customer service",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AYEZA COSMETICS",
    url: APP_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${APP_URL}/shop?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden bg-[#0a0a0a]">
        <ScrollToTop />
        <Providers>
          <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
        </Providers>
      </body>
    </html>
  );
}
