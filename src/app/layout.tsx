import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "AYEZA COSMETICS - Luxury Beauty Products",
  description: "Discover premium luxury cosmetics curated for the modern woman. Shop skincare, makeup, fragrances, and more.",
  keywords: ["cosmetics", "beauty", "skincare", "makeup", "luxury", "Pakistan"],
  authors: [{ name: "AYEZA COSMETICS" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "AYEZA COSMETICS - Luxury Beauty Products",
    description: "Discover premium luxury cosmetics curated for the modern woman.",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "AYEZA COSMETICS" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>
          <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
        </Providers>
      </body>
    </html>
  );
}
