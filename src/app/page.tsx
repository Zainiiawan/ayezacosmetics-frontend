'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Truck, Shield, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { categoryApi } from '@/lib/api/categoryApi';

const whyChooseUs = [
  { title: 'Premium Quality', description: 'Only the finest ingredients for your skin', icon: Star },
  { title: 'Cruelty Free', description: 'We never test on animals — 100% ethical', icon: Shield },
  { title: 'Fast Delivery', description: 'Free shipping on orders over PKR 5,000', icon: Truck },
];

export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
  });

  const featuredCategories = categories;

  return (
    <div className="flex flex-col">
      <section className="relative bg-gradient-to-br from-gray-50 to-white pt-20 md:pt-24 pb-12 md:snap-start md:min-h-[calc(100vh-73px)] flex flex-col justify-start">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 bg-rose-gold/10 text-rose-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                New Collection Available
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-black mb-4 leading-tight">
                Discover Your <span className="text-rose-gold">True Beauty</span>
              </h1>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
                Luxury cosmetics curated for the modern woman. Experience the difference with premium skincare, makeup, and fragrances.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shop">
                  <Button size="lg" className="w-full sm:w-auto">
                    Shop Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Categories
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 mt-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections designed to enhance your natural beauty
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredCategories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/categories/${category.slug}`} className="block group h-full">
                  <div className="relative bg-white rounded-2xl hover:shadow-luxury transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                    <div className="relative h-64 w-full overflow-hidden bg-gray-50 flex items-center justify-center">
                      {category.image?.url ? (
                        <img
                          src={category.image.url}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-6xl">✨</div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-serif font-bold text-black mb-2 group-hover:text-rose-gold transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
                        {category.description ?? 'Explore our collection'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-rose-gold font-medium group-hover:gap-2 transition-all mt-auto">
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



      <section className="py-14 bg-white md:snap-start md:min-h-[calc(100vh-73px)] flex flex-col justify-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
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
