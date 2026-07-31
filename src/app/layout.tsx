import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";

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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ayezacosmetics.store";

export const viewport: Viewport = {
  themeColor: "#f9f0f3",
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
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/icon.jpg?v=2", type: "image/jpeg" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=2", sizes: "192x192", type: "image/jpeg" },
    ],
  },
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
      "https://www.facebook.com/ayezacosmetics",
      "https://www.instagram.com/ayezacosmetics",
      "https://twitter.com/ayezacosmetics",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-300-0000000",
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
      <body className="min-h-full flex flex-col">
        <Providers>
          <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
        </Providers>
      </body>
    </html>
  );
}
