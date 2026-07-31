import { Metadata } from 'next';
import CategoryPageClient from './CategoryPageClient';
import { config } from '@/lib/config';

async function getCategoryBySlug(slug: string) {
  try {
    const res = await fetch(`${config.apiUrl}/categories/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching category for SEO:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getCategoryBySlug(params.slug);
  const category = data?.category;

  if (!category) {
    return {
      title: 'Category Not Found | AYEZA COSMETICS',
      description: 'The requested category could not be found.',
    };
  }

  const title = `${category.name} | AYEZA COSMETICS`;
  const description = category.description || `Browse our premium collection of ${category.name} at AYEZA COSMETICS.`;
  const canonicalUrl = `/categories/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: category.image ? [{ url: category.image.url }] : [{ url: '/logo.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: category.image ? [category.image.url] : ['/logo.png'],
    },
  };
}

export default async function CategoryPageServer({ params }: { params: { slug: string } }) {
  const data = await getCategoryBySlug(params.slug);
  const category = data?.category;

  let jsonLdArray: any[] = [];
  if (category) {
    const categoryJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name,
      description: category.description,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store'}/categories/${category.slug}`,
    };

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
          name: 'Categories',
          item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store'}/categories`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.name,
          item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayezacosmetics.store'}/categories/${category.slug}`,
        },
      ],
    };

    jsonLdArray = [categoryJsonLd, breadcrumbJsonLd];
  }

  return (
    <>
      {jsonLdArray.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArray) }}
        />
      )}
      <CategoryPageClient />
    </>
  );
}
