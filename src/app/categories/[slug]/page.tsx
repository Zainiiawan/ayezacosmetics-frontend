import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import CategoryPageClient from './CategoryPageClient';
import { config } from '@/lib/config';
import { rebrand } from '@/lib/rebrand';

export const revalidate = 3600;

const fallbackCategoryMap: Record<string, any> = {
  'skin-care': {
    category: {
      _id: 'cat-skincare',
      name: 'Skin Care',
      slug: 'skin-care',
      description: 'Shop authentic AZEEORA whitening cream, night cream, and glutathione skin polish kit in Pakistan. 100% natural glow formulas with cash on delivery.',
    },
    subcategories: [],
  },
  'whitening-cream': {
    category: {
      _id: 'cat-skincare',
      name: 'Skin Care',
      slug: 'skin-care',
      description: 'Shop authentic AZEEORA whitening cream, night cream, and glutathione skin polish kit in Pakistan. 100% natural glow formulas with cash on delivery.',
    },
    subcategories: [],
  },
  'hair-care': {
    category: {
      _id: 'cat-haircare',
      name: 'Hair Care',
      slug: 'hair-care',
      description: 'Explore AZEEORA Hair Care in Pakistan. Best hair growth serum and hair oil solutions for hair fall control, root strength and silk shine.',
    },
    subcategories: [],
  },
};

const skinCareProducts = [
  {
    _id: 'prod-cream',
    name: 'AZEEORA Beauty Cream',
    slug: 'azeeora-beauty-cream',
    basePrice: 899,
    salePrice: 699,
    images: [{ url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_600/v1792457415/ayeza-cosmetics/bzltpg2ajhjhoe8hijti.jpg', alt: 'AZEEORA Beauty Cream' }],
    rating: 4.9,
    reviewCount: 142,
    stock: 50,
    isActive: true,
  },
  {
    _id: 'prod-facewash',
    name: 'AZEEORA Radiance Face Wash',
    slug: 'azeeora-radiance-face-wash',
    basePrice: 1199,
    salePrice: 999,
    images: [{ url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_600/v1792457379/ayeza-cosmetics/lwxi0m5si15oj7pfmdxk.jpg', alt: 'AZEEORA Radiance Face Wash' }],
    rating: 4.8,
    reviewCount: 98,
    stock: 45,
    isActive: true,
  },
  {
    _id: 'prod-polish',
    name: 'AZEEORA Glutathione Skin Polish Kit',
    slug: 'azeeora-glutathione-skin-polish-kit-or-oxidizing-emulsion-and-dust-free-blonder-powder',
    basePrice: 1999,
    salePrice: 1299,
    images: [{ url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_600/v1794256870/ayeza-cosmetics/dvdjicbu4xtxbxkbaukv.jpg', alt: 'AZEEORA Glutathione Skin Polish Kit' }],
    rating: 4.9,
    reviewCount: 86,
    stock: 35,
    isActive: true,
  },
];

const fallbackCategoryProducts: Record<string, any[]> = {
  'skin-care': skinCareProducts,
  'whitening-cream': skinCareProducts,
  'hair-care': [
    {
      _id: 'prod-serum',
      name: 'AZEEORA Hair Growth Serum – 30ml',
      slug: 'azeeora-hair-growth-serum-30ml',
      basePrice: 1499,
      salePrice: 1099,
      images: [{ url: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_600/v1794297821/ayeza-cosmetics/h9dqbkgl6txrfeo3qrbn.jpg', alt: 'AZEEORA Hair Growth Serum' }],
      rating: 4.9,
      reviewCount: 112,
      stock: 40,
      isActive: true,
    },
  ],
};

async function getCategoryBySlug(slug: string) {
  try {
    let res = await fetch(`${config.apiUrl}/categories/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok && slug.startsWith('azeeora-')) {
      const fallbackSlug = slug.replace(/^azeeora-/, 'ayeza-');
      res = await fetch(`${config.apiUrl}/categories/${fallbackSlug}`, {
        next: { revalidate: 3600 },
      });
    }
    if (!res.ok && slug === 'whitening-cream') {
      res = await fetch(`${config.apiUrl}/categories/skin-care`, {
        next: { revalidate: 3600 },
      });
    }
    if (!res.ok && slug === 'skin-care') {
      res = await fetch(`${config.apiUrl}/categories/whitening-cream`, {
        next: { revalidate: 3600 },
      });
    }
    if (res.ok) {
      const json = rebrand(await res.json());
      if (json.data?.category) return json.data;
    }
  } catch (error) {
    console.warn('Error fetching category for SEO, falling back to cached category data.');
  }

  // Return fallback if available
  const normalizedSlug = slug.toLowerCase();
  return fallbackCategoryMap[normalizedSlug] || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryBySlug(slug);
  const category = data?.category;
  const canonicalSlug = slug === 'whitening-cream' ? 'skin-care' : slug;
  const canonicalUrl = `${config.getBaseUrl()}/categories/${canonicalSlug}`;

  if (!category) {
    const fallbackName = slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Category';
    return {
      title: `${fallbackName} | AZEEORA`,
      description: `Browse our premium collection of ${fallbackName} at AZEEORA. Fast cash on delivery across Pakistan.`,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  let title = `${category.name} | AZEEORA`;
  let description = category.description || `Browse our premium collection of ${category.name} at AZEEORA.`;

  const s = (category.slug || slug).toLowerCase();
  const n = (category.name || '').toLowerCase();
  let keywords: string[] = [];

  if (s.includes('whitening') || s.includes('skin-care') || s.includes('cream') || n.includes('skin care') || n.includes('whitening')) {
    title = 'Best Whitening Creams, Night Creams & Skin Polish in Pakistan | AZEEORA';
    description = 'Shop authentic Azeeora whitening cream, night cream, and glutathione skin polish kit in Pakistan. 100% natural glow formulas with cash on delivery.';
    keywords = ['whitening cream', 'best whitening cream in pakistan', 'night cream', 'glow cream', 'skin polish', 'glutathione skin polish', 'azeeora'];
  } else if (s.includes('face-wash') || n.includes('face wash') || s.includes('wash')) {
    title = 'Best Face Wash in Pakistan for Glowing & Acne-Free Skin | AZEEORA';
    description = 'Buy sulfate-free Azeeora Radiance Face Wash online in Pakistan. Enriched with Niacinamide & Green Tea for deep pore cleansing, oil balance and instant glow.';
    keywords = ['face wash', 'best face wash in pakistan', 'face wash for glowing skin', 'radiance face wash', 'niacinamide face wash', 'acne face wash', 'azeeora'];
  } else if (s.includes('hair') || n.includes('hair care') || n.includes('hair')) {
    title = 'Best Hair Growth Serums & Hair Care in Pakistan | AZEEORA';
    description = 'Explore Azeeora Hair Care in Pakistan. Best hair growth serum and hair oil solutions for hair fall control, root strength and silk shine.';
    keywords = ['hair serum', 'best hair serum in pakistan', 'hair growth serum', 'hair fall control', 'serum for hair growth', 'hair care pakistan', 'azeeora'];
  }

  return {
    title,
    description,
    keywords,
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

export default async function CategoryPageServer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === 'whitening-cream') {
    permanentRedirect('/categories/skin-care');
  }
  if (slug.startsWith('ayeza-') || slug.startsWith('ayezabeauty')) {
    const targetSlug = slug.replace(/^ayeza-?/, 'azeeora-');
    permanentRedirect(`/categories/${targetSlug}`);
  }
  const data = await getCategoryBySlug(slug);
  const category = data?.category;

  if (!category) {
    notFound();
  }

  let jsonLdArray: any[] = [];
  const base = config.getBaseUrl();
  const catSlug = (category.slug || slug).toLowerCase();
  const catName = (category.name || '').toLowerCase();

  const categoryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: `${base}/categories/${slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${base}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: `${base}/categories`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${base}/categories/${slug}`,
      },
    ],
  };

  let faqJsonLd: any = null;

  if (catSlug.includes('whitening') || catSlug.includes('cream') || catSlug.includes('skin') || catName.includes('skin') || catName.includes('whitening')) {
    faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How long does it take to see results with AZEEORA Whitening Cream?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most customers notice improved skin hydration and a refreshed glow within 7 to 10 days of consistent daily use. Visible fading of dark spots and hyperpigmentation typically occurs within 3 to 4 weeks.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is AZEEORA Whitening Beauty Cream safe from mercury and steroids?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, 100%. AZEEORA cosmetics are strictly free from mercury, steroids, hydroquinone, and harmful chemical bleaches. Our formulations rely on Glutathione, Niacinamide, and soothing botanicals.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can this cream be used on sensitive or acne-prone skin?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Our formula is non-comedogenic and contains Niacinamide to calm redness and regulate excess sebum without clogging pores.',
          },
        },
      ],
    };
  } else if (catSlug.includes('face-wash') || catName.includes('face wash') || catSlug.includes('wash')) {
    faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Which face wash is best for acne-prone and glowing skin in Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Azeeora Radiance Face Wash with Niacinamide and soothing botanical extracts unclogs pores, regulates excess oil, and leaves skin radiantly glowing without dryness.',
          },
        },
        {
          '@type': 'Question',
          name: 'Should I use face wash twice a day?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, dermatologists recommend washing your face twice daily—once in the morning to remove overnight sebum and once at night to cleanse away pollution and impurities.',
          },
        },
      ],
    };
  } else if (catSlug.includes('hair') || catName.includes('hair')) {
    faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Which is the best hair serum in Pakistan for frizz and hair fall?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Azeeora Hair Growth Serum is specially formulated to lock out humidity, eliminate frizz, and provide vital nutrients for hair fall reduction and new follicle growth.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use hair care serums on coloured or chemically treated hair?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Our formula is safe, sulfate-free, and paraben-free, making it ideal for chemically treated, heat-styled, or colored hair.',
          },
        },
      ],
    };
  }

  jsonLdArray = [categoryJsonLd, breadcrumbJsonLd];
  if (faqJsonLd) {
    jsonLdArray.push(faqJsonLd);
  }

  // Pre-fetch initial products for SSR with fallback
  let initialProductsData: any = null;
  if (category?._id && category._id !== 'cat-skincare' && category._id !== 'cat-haircare') {
    try {
      const productsRes = await fetch(
        `${config.apiUrl}/products?category=${category._id}&page=1&limit=12&sortBy=bestselling`,
        {
          next: { revalidate: 3600, tags: ['products'] },
        }
      );
      if (productsRes.ok) {
        const productsJson = rebrand(await productsRes.json());
        initialProductsData = productsJson.data;
      }
    } catch (error) {
      console.warn('Error fetching initial category products, using static fallback.');
    }
  }

  // If initialProductsData is still empty, use fallback category products
  if (!initialProductsData || !Array.isArray(initialProductsData.products) || initialProductsData.products.length === 0) {
    const fallbackList = fallbackCategoryProducts[catSlug] || fallbackCategoryProducts['whitening-cream'];
    initialProductsData = {
      products: fallbackList,
      pagination: {
        total: fallbackList.length,
        page: 1,
        pages: 1,
        limit: 12,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  return (
    <>
      {jsonLdArray.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArray) }}
        />
      )}
      <CategoryPageClient 
        initialCategoryData={data} 
        initialProductsData={initialProductsData} 
      />
    </>
  );
}
