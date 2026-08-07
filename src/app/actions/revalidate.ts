'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateProductsCache() {
  // @ts-ignore - Next.js type definitions might be mismatched
  revalidateTag('products');
}
