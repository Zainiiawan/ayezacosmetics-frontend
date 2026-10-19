import type { Metadata, Viewport } from "next";
import { Cinzel, Jost, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";
import ScrollToTop from "@/components/layout/ScrollToTop";

const display = Cinzel({
  variable: "--font-display",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const body = Jost({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Urdu accents (a few words on the homepage), loaded only where used
const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  weight: ["400", "600"],
  subsets: ["arabic"],
  display: "swap",
  preload: false,
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
    default: "AZEEORA | Beauty for Pakistani Skin",
    template: "%s | AZEEORA",
  },
  description: "AZEEORA skincare and beauty, made for Pakistani skin and weather. Cash on delivery across Pakistan.",
  keywords: ["cosmetics", "beauty", "skincare", "makeup", "luxury", "Pakistan"],
  authors: [{ name: "AZEEORA" }],
  manifest: "/manifest.webmanifest",
  // preview deployments stay out of search results so they never compete with the real domain
  robots: process.env.NEXT_PUBLIC_NOINDEX === "true" ? { index: false, follow: false } : undefined,

  openGraph: {
    title: "AZEEORA | Beauty for Pakistani Skin",
    description: "AZEEORA skincare and beauty, made for Pakistani skin and weather.",
    type: "website",
    url: APP_URL,
    siteName: "AZEEORA",
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "AZEEORA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AZEEORA | Beauty for Pakistani Skin",
    description: "AZEEORA skincare and beauty, made for Pakistani skin and weather.",
    images: ["/brand/og.png"],
  },
  verification: {
    google: "hJhcaTPMOXI5_KbIDYvh6rf99bjD9SSs-CrFGEcwtAo",
    other: {
      "msvalidate.01": "105E6AD2380F7172A929A733738D3436",
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
    name: "AZEEORA",
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
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "PK",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      itemCondition: "https://schema.org/NewCondition",
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      url: `${APP_URL}/refunds`,
    }
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AZEEORA",
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
    <html lang="en" className={`${display.variable} ${body.variable} ${nastaliq.variable} h-full antialiased`} suppressHydrationWarning>
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
      <body className="min-h-full flex flex-col overflow-x-hidden bg-white">
        <ScrollToTop />
        <Providers>
          <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
        </Providers>
      </body>
    </html>
  );
}
