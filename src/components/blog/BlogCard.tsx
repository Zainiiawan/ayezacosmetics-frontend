import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/data/blog';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard = ({ post, featured = false }: BlogCardProps) => {
  const formattedDate = new Date(post.publishDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 luxury-border hover:border-rose-gold/40 flex flex-col group-hover:-translate-y-1">
        <div className="flex flex-col md:flex-row h-full">
          <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto overflow-hidden bg-gray-100">
            <Image
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
              {post.categories[0] && (
                <span className="text-rose-gold">{post.categories[0]}</span>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readingTime}</span>
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4 group-hover:text-rose-gold transition-colors">
              {post.title}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-900">{post.author}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 group-hover:bg-rose-gold group-hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 luxury-border hover:border-rose-gold/40 group-hover:-translate-y-1">
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={post.featuredImage.url}
          alt={post.featuredImage.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {post.categories[0] && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-black text-xs font-medium uppercase tracking-wider rounded-full">
              {post.categories[0]}
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readingTime}</span>
          </div>
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-rose-gold transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-900">{post.author}</span>
          <span className="text-rose-gold text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Read More <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
