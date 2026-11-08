import { Product } from '@/lib/api/productApi';

// plain text from a description that may hold HTML or markdown
const plain = (s = '') =>
  s
    .replace(/<\/(p|li|h\d|div)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[*_#`>]/g, '')
    .replace(/[ \t]+/g, ' ');

const BULLET = /^\s*(?:[-•*✓✔▪◦·]|\d+[.)])\s+/;

// used only when the product text itself lists no benefits
const FALLBACK: [RegExp, string[]][] = [
  [/wash|cleans/i, ['Deep cleansing', 'Removes dirt and excess oil', 'Hydrating, never drying', 'Gentle, sulfate-free']],
  [/night cream/i, ['Brightens overnight', 'Deep moisturising', 'Soft, smooth skin', 'Glowing look by morning']],
  [/cream|lotion|moistur/i, ['Brightens', 'Nourishes', 'Deep moisture', 'Soft, smooth skin']],
  [/serum/i, ['Lightweight', 'Visible glow', 'Absorbs fast', 'Layers under makeup']],
  [/sun|spf/i, ['Daily sun protection', 'Lightweight feel', 'No white cast', 'Wear under makeup']],
];

/** Short benefit points for a product: bullets from its description, then its tags, then a sensible default. */
export function productBenefits(p: Product, max = 4): string[] {
  const lines = plain(p.description).split('\n');
  const bullets = lines
    .filter((l) => BULLET.test(l))
    .map((l) => l.replace(BULLET, '').replace(/[:.;]\s*$/, '').trim())
    .filter((l) => l.length > 2 && l.length <= 70);
  if (bullets.length >= 2) return bullets.slice(0, max);

  const tags = (p.tags ?? [])
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !/^ayeza|^azeeora/i.test(t))
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  if (tags.length >= 2) return tags.slice(0, max);

  return (FALLBACK.find(([re]) => re.test(p.name))?.[1] ?? []).slice(0, max);
}

/** One or two sentences on what the product is for. */
export function productUses(p: Product, maxLength = 190): string {
  const short = plain(p.shortDescription).trim();
  if (short) return short.length > maxLength ? `${short.slice(0, maxLength - 1).trimEnd()}…` : short;
  const text = plain(p.description)
    .split('\n')
    .filter((l) => l.trim() && !BULLET.test(l))
    .join(' ')
    .trim();
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? (text ? [text] : []);
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > maxLength) break;
    out += s;
  }
  return (out || text.slice(0, maxLength)).trim();
}
