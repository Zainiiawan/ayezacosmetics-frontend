import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/lib/api/productApi';

/** Every product on sale, so the blog always matches what the store sells. */
export default function ShopTheRange({ products, title = 'Shop AZEEORA' }: { products: Product[]; title?: string }) {
  if (!products.length) return null;
  return (
    <section className="mt-16 pt-12 border-t border-gray-200">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow text-crimson">From the store</p>
          <h2 className="mt-2 font-serif text-[1.7rem] sm:text-[2.2rem] text-ink leading-tight">{title}</h2>
        </div>
        <Link href="/shop" className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.16em] font-medium text-ink border-b border-crimson pb-1">
          All products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
