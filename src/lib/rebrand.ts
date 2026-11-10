/**
 * The catalogue in the backend still carries the old brand name in product
 * and category text. Until it is renamed in the admin panel, the storefront
 * shows AZEEORA instead. Display only: nothing is written back, image paths
 * are untouched, so photos uploaded in the admin panel always show.
 * Slugs starting with ayeza- are converted to azeeora- so all links use AZEEORA.
 */
const TEXT_KEYS = new Set(['name', 'description', 'shortDescription', 'seoContent', 'metaTitle', 'metaDescription', 'title', 'subtitle', 'buttonText']);

const swap = (s: string) =>
  s
    .replace(/(?<![\w/@.-])AYEZA COSMETICS(?!\w)/g, 'AZEEORA')
    .replace(/(?<![\w/@.-])Ayeza [Cc]osmetics(?!\w)/g, 'AZEEORA')
    .replace(/(?<![\w/@.-])AYEZA(?![\w-])/g, 'AZEEORA')
    .replace(/(?<![\w/@.-])Ayeza(?![\w-])/g, 'Azeeora')
    .replace(/\bayeza\b/gi, 'Azeeora');

const swapSlug = (s: string) =>
  s
    .replace(/^ayeza-/i, 'azeeora-')
    .replace(/-ayeza-/i, '-azeeora-')
    .replace(/-ayeza$/i, '-azeeora')
    .replace(/^ayeza$/i, 'azeeora');

export function rebrand<T>(value: T, key?: string): T {
  if (typeof value === 'string') {
    if (key === 'slug') return swapSlug(value) as T;
    if (key === 'link' || key === 'canonicalUrl' || key === 'href' || key === 'url') {
      return value
        .replace(/\/products\/ayeza-/gi, '/products/azeeora-')
        .replace(/^ayeza-/i, 'azeeora-') as T;
    }
    return (key && TEXT_KEYS.has(key) ? swap(value) : value) as T;
  }
  if (Array.isArray(value)) return value.map((v) => rebrand(v, key)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = rebrand(v, k);
    return out as T;
  }
  return value;
}
