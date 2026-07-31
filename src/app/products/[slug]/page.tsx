import { Metadata } from 'next';
import ProductPageClient from './ProductPageClient';
import { config } from '@/lib/config';

async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(`${config.apiUrl}/products/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching product for SEO:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    const fallbackName = slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Product';
    return {
      title: `${fallbackName} | AYEZA COSMETICS`,
      description: `Shop ${fallbackName} at AYEZA COSMETICS. Premium luxury cosmetics curated for the modern woman.`,
    };
  }

  const title = product.seo?.metaTitle || `${product.name} | AYEZA COSMETICS`;
  const description =
    product.seo?.metaDescription ||
    product.shortDescription ||
    product.description?.slice(0, 155) ||
    'Premium luxury cosmetics curated for the modern woman.';
  
  const images = product.images?.map((img: any) => img.url) || ['/logo.png'];
  const canonicalUrl = product.seo?.canonicalUrl || `/products/${product.slug}`;

  return {
    title,
    description,
    keywords: product.seo?.metaKeywords || product.tags,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: images.map((url: string) => ({ url })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
    robots: {
      index: product.isActive !== false,
      follow: product.isActive !== false,
    },
  };
}

export default async function ProductPageServer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  let jsonLdArray: any[] = [];
  if (product) {
    const effectivePrice = product.discount?.value 
      ? (product.discount.type === 'percentage' 
          ? product.basePrice * (1 - product.discount.value / 100) 
          : Math.max(0, product.basePrice - product.discount.value))
      : product.basePrice;

    const productJsonLd: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.shortDescription,
      image: product.images?.map((img: any) => img.url),
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: typeof product.brand === 'object' ? product.brand?.name : (product.brand || 'AYEZA COSMETICS'),
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PKR',
        price: effectivePrice,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store'}/products/${product.slug}`,
      },
    };

    if (product.reviewCount > 0) {
      productJsonLd.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      };
    }

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store'}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store'}/shop`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.name,
          item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store'}/products/${product.slug}`,
        },
      ],
    };

    jsonLdArray = [productJsonLd, breadcrumbJsonLd];
  }

  return (
    <>
      {jsonLdArray.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArray) }}
        />
      )}
      <ProductPageClient />
    </>
  );
}
