import { BlogPost } from '@/lib/data/blog';
import { Product } from '@/lib/api/productApi';
import { optimizeCloudinaryUrl } from '@/lib/utils';

const imageOf = (p: Product) => (p.images?.find((i) => i.isMain) || p.images?.[0])?.url;

/**
 * Blog cover drawn from the live catalogue: the article's topic on the left,
 * up to three current products on the right. Each article starts at a
 * different product, so the covers show the whole range between them.
 * Without products (backend asleep) it falls back to the article's own image.
 */
export default function BlogCover({ post, products, offset = 0, large = false }: { post: BlogPost; products: Product[]; offset?: number; large?: boolean }) {
  const withImages = products.filter(imageOf);
  if (!withImages.length) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={post.featuredImage.url} alt={post.featuredImage.alt} className="absolute inset-0 w-full h-full object-cover" />;
  }
  const picks = Array.from({ length: Math.min(3, withImages.length) }, (_, i) => withImages[(offset + i) % withImages.length]);

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blush via-white to-blush-deep flex items-center gap-3 sm:gap-5 p-5 sm:p-8 overflow-hidden" role="img" aria-label={`${post.title}, with ${picks.map((p) => p.name).join(', ')}`}>
      <div className="w-[38%] shrink-0">
        {post.categories[0] && <p className="eyebrow !text-[0.55rem] sm:!text-[0.62rem] text-crimson">{post.categories[0]}</p>}
        <p className={`mt-2 font-serif text-ink leading-[1.1] ${large ? 'text-[1.4rem] sm:text-[2.4rem]' : 'text-[1.05rem] sm:text-[1.35rem]'}`}>{post.title}</p>
        <p className="mt-3 eyebrow !text-[0.5rem] sm:!text-[0.58rem] text-ink/70">AZEEORA</p>
      </div>
      <div className="relative flex-1 h-full">
        {picks.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p._id}
            src={optimizeCloudinaryUrl(imageOf(p)!, 500, false)}
            alt=""
            loading="lazy"
            className={[
              'absolute object-cover shadow-[0_18px_40px_-18px_rgba(35,31,32,0.45)] bg-white',
              picks.length === 1 ? 'inset-[6%] w-[88%] h-[88%]' : '',
              picks.length === 2 ? (i === 0 ? 'left-0 top-[4%] w-[60%] h-[80%]' : 'right-0 bottom-[4%] w-[52%] h-[64%]') : '',
              picks.length === 3 ? (i === 0 ? 'left-[18%] top-[2%] w-[56%] h-[78%] z-10' : i === 1 ? 'left-0 bottom-[2%] w-[42%] h-[52%]' : 'right-0 bottom-[6%] w-[42%] h-[56%]') : '',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}
