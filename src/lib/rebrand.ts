/**
 * The catalogue in the backend still carries the old brand name in product
 * and category text. Until it is renamed in the admin panel, the storefront
 * shows AZEEORA instead. Display only: nothing is written back, slugs, URLs
 * and stored image paths are untouched, and the admin panel shows the stored data.
 * Product photos showing the old pack are swapped for the AZEEORA pack shots.
 */
const TEXT_KEYS = new Set(['name', 'description', 'shortDescription', 'seoContent', 'metaTitle', 'metaDescription']);

const swap = (s: string) =>
  s
    .replace(/(?<![\w/@.-])AYEZA COSMETICS(?!\w)/g, 'AZEEORA')
    .replace(/(?<![\w/@.-])Ayeza [Cc]osmetics(?!\w)/g, 'AZEEORA')
    .replace(/(?<![\w/@.-])AYEZA(?![\w-])/g, 'AZEEORA')
    .replace(/(?<![\w/@.-])Ayeza(?![\w-])/g, 'Azeeora');

// AZEEORA packaging photos for catalogue items whose stored photos still show the old pack
const FACE_WASH = '/brand/products/azeeora-radiance-face-wash.jpg';
const CREAM = '/brand/products/azeeora-beauty-cream.jpg';
const PRODUCT_PHOTOS: Record<string, string> = {
  'ayeza-radiance-face-wash': FACE_WASH,
  'ayeza-beauty-cream': CREAM,
};
const CATEGORY_PHOTOS: Record<string, string> = {
  'face-wash': FACE_WASH,
  'whitening-cream': CREAM,
};

function swapPhotos(doc: Record<string, unknown>) {
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  const productPhoto = PRODUCT_PHOTOS[slug];
  if (productPhoto && Array.isArray(doc.images)) {
    const [first, ...rest] = doc.images as Record<string, unknown>[];
    doc.images = [{ ...(first ?? {}), url: productPhoto, isMain: true }, ...rest.filter((i) => !/cloudinary/.test(String(i?.url)))];
  }
  const categoryPhoto = CATEGORY_PHOTOS[slug];
  if (categoryPhoto && doc.image && typeof doc.image === 'object') doc.image = { ...(doc.image as object), url: categoryPhoto };
}

export function rebrand<T>(value: T, key?: string): T {
  if (typeof value === 'string') return (key && TEXT_KEYS.has(key) ? swap(value) : value) as T;
  if (Array.isArray(value)) return value.map((v) => rebrand(v, key)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = rebrand(v, k);
    swapPhotos(out);
    return out as T;
  }
  return value;
}
