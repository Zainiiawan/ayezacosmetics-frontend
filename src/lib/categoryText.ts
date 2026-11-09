const squash = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

/**
 * Whether a long category article was written for the category's current
 * name. A category renamed in the admin panel (say "Whitening Cream" to
 * "Skin Care") keeps its old article, which would then describe the wrong
 * thing, so the article's first heading must name the category.
 */
export function articleFitsCategory(categoryName: string, articleHtml: string): boolean {
  const name = squash(categoryName);
  if (!name) return false;
  const heading = articleHtml.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i)?.[1];
  const opening = (heading ?? articleHtml.replace(/<[^>]+>/g, ' ').slice(0, 200)).replace(/<[^>]+>/g, ' ');
  const text = squash(opening);
  // allow a plural ("Whitening Creams") and the singular of a plural name
  return text.includes(name) || text.includes(name.replace(/s$/, ''));
}
