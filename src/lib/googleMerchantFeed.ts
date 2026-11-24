import { config } from '@/lib/config';
import { rebrand } from '@/lib/rebrand';

export interface FeedProduct {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImages?: string[];
  availability: 'in_stock' | 'out_of_stock';
  price: string; // e.g. "899.00 PKR"
  salePrice?: string;
  brand: string;
  condition: 'new';
  googleProductCategory: string;
  productType: string;
}

const fallbackFeedProducts: FeedProduct[] = [
  {
    id: 'azeeora-beauty-cream',
    title: 'AZEEORA Beauty Cream - Best Whitening Cream in Pakistan',
    description: 'AZEEORA Beauty Cream is a safe, 100% mercury-free and steroid-free whitening beauty cream formulated specifically for Pakistani skin and weather. Deeply brightens, evens complexion, and fades dark spots naturally.',
    link: 'https://azeeoracosmetics.com/products/azeeora-beauty-cream',
    imageLink: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_1000/v1792457415/ayeza-cosmetics/bzltpg2ajhjhoe8hijti.jpg',
    availability: 'in_stock',
    price: '899.00 PKR',
    salePrice: '699.00 PKR',
    brand: 'AZEEORA',
    condition: 'new',
    googleProductCategory: 'Health & Beauty > Personal Care > Cosmetics > Skin Care',
    productType: 'Skin Care > Whitening Cream',
  },
  {
    id: 'azeeora-radiance-face-wash',
    title: 'AZEEORA Radiance Face Wash - Deep Pore Cleansing & Glow',
    description: 'AZEEORA Radiance Face Wash cleanses deep within pores, balancing excess oil and pollution without stripping natural moisture. Enriched with gentle brightening actives for clear, glowing Pakistani skin.',
    link: 'https://azeeoracosmetics.com/products/azeeora-radiance-face-wash',
    imageLink: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_1000/v1792457379/ayeza-cosmetics/lwxi0m5si15oj7pfmdxk.jpg',
    availability: 'in_stock',
    price: '1199.00 PKR',
    salePrice: '999.00 PKR',
    brand: 'AZEEORA',
    condition: 'new',
    googleProductCategory: 'Health & Beauty > Personal Care > Cosmetics > Skin Care',
    productType: 'Skin Care > Face Wash',
  },
  {
    id: 'azeeora-skin-polish-kit',
    title: 'AZEEORA Glutathione Skin Polish Kit - Salon-Grade Exfoliation',
    description: 'AZEEORA Glutathione Skin Polish Kit with oxidizing emulsion and dust-free blonder powder delivers salon-grade exfoliation, instant brightening, and radiant skin texture.',
    link: 'https://azeeoracosmetics.com/products/azeeora-glutathione-skin-polish-kit-or-oxidizing-emulsion-and-dust-free-blonder-powder',
    imageLink: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_1000/v1794256870/ayeza-cosmetics/dvdjicbu4xtxbxkbaukv.jpg',
    availability: 'in_stock',
    price: '1999.00 PKR',
    salePrice: '1299.00 PKR',
    brand: 'AZEEORA',
    condition: 'new',
    googleProductCategory: 'Health & Beauty > Personal Care > Cosmetics > Skin Care',
    productType: 'Skin Care > Skin Polish',
  },
  {
    id: 'azeeora-hair-growth-serum-30ml',
    title: 'AZEEORA Hair Growth Serum – 30ml Intensive Hair Fall Defense',
    description: 'AZEEORA Hair Growth Serum (30ml) strengthens roots, fights humidity frizz, and reduces hair fall for thicker, shinier, healthier hair in Pakistani weather.',
    link: 'https://azeeoracosmetics.com/products/azeeora-hair-growth-serum-30ml',
    imageLink: 'https://res.cloudinary.com/ekrmlhyf/image/upload/f_auto,q_auto,w_1000/v1794297821/ayeza-cosmetics/h9dqbkgl6txrfeo3qrbn.jpg',
    availability: 'in_stock',
    price: '1999.00 PKR',
    salePrice: '1099.00 PKR',
    brand: 'AZEEORA',
    condition: 'new',
    googleProductCategory: 'Health & Beauty > Personal Care > Hair Care',
    productType: 'Hair Care > Hair Growth Serum',
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateGoogleMerchantFeedXml(): Promise<string> {
  const base = 'https://azeeoracosmetics.com';
  let productsList: FeedProduct[] = [...fallbackFeedProducts];

  try {
    const res = await fetch(`${config.apiUrl}/products?limit=100`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = rebrand(await res.json());
      const remoteProducts = data.data?.products;
      if (Array.isArray(remoteProducts) && remoteProducts.length > 0) {
        productsList = remoteProducts.map((p: any) => {
          const rawSlug = p.slug?.replace(/^ayeza-/, 'azeeora-') || p.slug;
          const imageObj = p.images?.find((img: any) => img.isMain) || p.images?.[0];
          const mainImage = (typeof imageObj === 'string' ? imageObj : imageObj?.url) ||
            'https://azeeoracosmetics.com/brand/og.png';

          const additionalImages = (p.images || [])
            .map((img: any) => (typeof img === 'string' ? img : img?.url))
            .filter((url: string) => url && url !== mainImage);

          const basePriceNum = Number(p.basePrice) || 999;
          const salePriceNum = p.salePrice ? Number(p.salePrice) : undefined;

          const isHair = rawSlug.includes('hair') || rawSlug.includes('serum');
          const isPolish = rawSlug.includes('polish');
          const isFaceWash = rawSlug.includes('wash') || rawSlug.includes('cleanser');

          // Google Merchant Center strictly enforces max 50 characters on <g:id>
          let productId = rawSlug;
          if (productId.includes('skin-polish')) {
            productId = 'azeeora-skin-polish-kit';
          } else if (productId.length > 50) {
            productId = productId.substring(0, 50).replace(/-+$/, '');
          }

          let productType = 'Skin Care > Whitening Cream';
          let googleProductCategory = 'Health & Beauty > Personal Care > Cosmetics > Skin Care';

          if (isHair) {
            productType = 'Hair Care > Hair Growth Serum';
            googleProductCategory = 'Health & Beauty > Personal Care > Hair Care';
          } else if (isPolish) {
            productType = 'Skin Care > Skin Polish Kit';
          } else if (isFaceWash) {
            productType = 'Skin Care > Face Wash';
          }

          return {
            id: productId,
            title: `${p.name} - Luxury ${isHair ? 'Hair Care' : 'Skincare'} Pakistan`,
            description: p.description || p.shortDescription || `${p.name} by AZEEORA. Formulated for glowing Pakistani skin.`,
            link: `${base}/products/${rawSlug}`,
            imageLink: mainImage,
            additionalImages,
            availability: (p.stock > 0 && p.isActive !== false) ? 'in_stock' : 'out_of_stock',
            price: `${basePriceNum.toFixed(2)} PKR`,
            salePrice: (salePriceNum && salePriceNum < basePriceNum) ? `${salePriceNum.toFixed(2)} PKR` : undefined,
            brand: 'AZEEORA',
            condition: 'new',
            googleProductCategory,
            productType,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Backend products endpoint unreachable for Google Merchant feed, using fallback catalogue.');
  }

  const itemsXml = productsList
    .map((item) => {
      return `    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description><![CDATA[${item.description.replace(/]]>/g, '')}]]></g:description>
      <g:link>${escapeXml(item.link)}</g:link>
      <g:image_link>${escapeXml(item.imageLink)}</g:image_link>
${(item.additionalImages || [])
  .map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
  .join('\n')}
      <g:availability>${item.availability}</g:availability>
      <g:price>${item.price}</g:price>
${item.salePrice ? `      <g:sale_price>${item.salePrice}</g:sale_price>` : ''}
      <g:brand>${escapeXml(item.brand)}</g:brand>
      <g:condition>${item.condition}</g:condition>
      <g:google_product_category>${escapeXml(item.googleProductCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(item.productType)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>PK</g:country>
        <g:service>Standard Nationwide Delivery</g:service>
        <g:price>200.00 PKR</g:price>
      </g:shipping>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>AZEEORA Cosmetics Products Feed</title>
    <link>https://azeeoracosmetics.com</link>
    <description>AZEEORA luxury skincare and beauty formulations crafted for Pakistani skin and weather.</description>
${itemsXml}
  </channel>
</rss>`;
}
