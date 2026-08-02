'use client';

import { m as motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Truck, Shield, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { categoryApi, Category } from '@/lib/api/categoryApi';
import { optimizeCloudinaryUrl, getCloudinarySrcSet } from '@/lib/utils';

const whyChooseUs = [
  { title: 'Premium Quality', description: 'Only the finest ingredients for your skin', icon: Star },
  { title: 'Cruelty Free', description: 'We never test on animals — 100% ethical', icon: Shield },
  { title: 'Fast Delivery', description: 'Free shipping on orders over PKR 5,000', icon: Truck },
];

export default function HomeClient({ initialCategories }: { initialCategories: Category[] }) {
  const { data: categories = initialCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
    initialData: initialCategories,
  });

  const featuredCategories = categories;

  return (
    <div className="flex flex-col">
      <section className="relative bg-gradient-to-br from-gray-50 to-white pt-0 md:pt-2 pb-4 flex flex-col justify-start">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-black mb-2 leading-tight">
                Discover Your <span className="text-rose-gold">True Beauty</span>
              </h1>
              <p className="text-base text-gray-600 mb-4 max-w-md mx-auto">
                Experience the difference with premium skincare and makeup.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 mt-2"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections designed to enhance your natural beauty
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
            {featuredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/categories/${category.slug}`} className="block group h-full">
                  <div className="relative bg-white rounded-xl luxury-border hover:shadow-xl transition-all duration-500 overflow-hidden hover:border-rose-gold/40 h-full flex flex-col group-hover:-translate-y-1">
                    <div className="relative h-[400px] w-full overflow-hidden bg-gray-50 flex items-center justify-center">
                      {category.image?.url ? (
                        <img
                          src={optimizeCloudinaryUrl(category.image.url, 800, true)}
                          srcSet={getCloudinarySrcSet(category.image.url, undefined, true)}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          fetchPriority={index < 3 ? "high" : "auto"}
                        />
                      ) : (
                        <div className="text-6xl">✨</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-xl font-serif font-bold text-black mb-1 group-hover:text-rose-gold transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                        {category.description ?? 'Explore our collection'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-rose-gold-dark font-medium group-hover:gap-2 transition-all mt-auto">
                        Shop Now
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      <section className="py-12 bg-white flex flex-col justify-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-3">
              Why Choose AYEZA COSMETICS
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are committed to delivering the best beauty experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUs.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-rose-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-rose-gold" />
                </div>
                <h3 className="text-xl font-serif font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
