'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

export async function revalidateProductsCache() {
  // @ts-ignore - Next.js type definitions might be mismatched
  revalidateTag('products');
  revalidatePath('/', 'layout');
}

export async function revalidateCategoriesCache() {
  // @ts-ignore
  revalidateTag('categories');
  revalidatePath('/', 'layout');
}
