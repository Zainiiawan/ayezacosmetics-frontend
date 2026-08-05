'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { m as motion } from 'framer-motion';
import { Star, ThumbsUp, BadgeCheck, MessageSquare, Camera, X } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { reviewApi, Review } from '@/lib/api/reviewApi';
import { mediaApi } from '@/lib/api/mediaApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  body: string;
  guestName?: string;
  guestEmail?: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.getByProduct(productId),
  });

  const { data: stats } = useQuery({
    queryKey: ['review-stats', productId],
    queryFn: () => reviewApi.getStats(productId),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<ReviewFormData>({ defaultValues: { rating: 5 } });

  const selectedRating = watch('rating');

  const createReview = useMutation({
    mutationFn: reviewApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', productId] });
      reset();
      setSelectedFiles([]);
      setShowForm(false);
      toast.success('Review submitted successfully!');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Failed to submit review');
    },
  });

  const helpfulMutation = useMutation({
    mutationFn: reviewApi.markHelpful,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = selectedFiles.length + newFiles.length;
      if (totalFiles > 5) {
        toast.error('You can only upload up to 5 media files per review.');
        return;
      }
      
      const validFiles = newFiles.filter((file) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        if (!isImage && !isVideo) {
          toast.error(`${file.name} is not a valid image or video.`);
          return false;
        }
        if (isImage && file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds the 5MB image limit.`);
          return false;
        }
        if (isVideo && file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name} exceeds the 20MB video limit.`);
          return false;
        }
        return true;
      });

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setUploading(true);
      let images: string[] = [];
      
      if (selectedFiles.length > 0) {
        const uploadedMedia = await mediaApi.uploadPublic(selectedFiles);
        images = uploadedMedia.map(m => m.url);
      }
      
      createReview.mutate({ ...data, product: productId, images });
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Failed to upload media. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const maxCount = stats
    ? Math.max(...Object.values(stats.ratingDistribution), 1)
    : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 bg-white rounded-2xl p-8 luxury-border"
    >
      <h2 className="text-2xl font-serif font-bold text-black mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-rose-gold" />
        Customer Reviews
      </h2>

      {stats && (
        <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-black mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-5 h-5',
                    i < Math.round(stats.averageRating)
                      ? 'fill-rose-gold text-rose-gold'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <p className="text-gray-500">{stats.totalReviews} reviews</p>
          </div>

          <div className="space-y-2">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = stats.ratingDistribution[star] ?? 0;
              const pct = (count / maxCount) * 100;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-gold rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-8">
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} variant="outline">
            Write a Review
          </Button>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 rounded-xl p-6">
            <h3 className="font-medium text-black">Share your experience</h3>

            {!isAuthenticated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  {...register('guestName', { required: 'Please enter your name' })}
                  error={errors.guestName?.message}
                />
                <Input
                  label="Your Email Address"
                  type="email"
                  {...register('guestEmail', { 
                    required: 'Please enter your email address',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  error={errors.guestEmail?.message}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('rating', star)}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        'w-6 h-6',
                        star <= selectedRating ? 'fill-rose-gold text-rose-gold' : 'text-gray-300'
                      )}
                    />
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('rating', { required: true, min: 1, max: 5 })} />
            </div>

            <Input
              label="Title"
              {...register('title', { required: 'Title is required', minLength: 3 })}
              error={errors.title?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
              <textarea
                {...register('body', { 
                  required: 'Review is required', 
                  minLength: { value: 10, message: 'Review must be at least 10 characters.' },
                  maxLength: { value: 500, message: 'Review cannot exceed 500 characters.' }
                })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/30 focus:outline-none"
                placeholder="Share your experience with this product..."
              />
              {errors.body && <p className="mt-1 text-sm font-medium text-red-600">{errors.body.message}</p>}
            </div>

            {/* Media Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attach Media (optional)</label>
              <div className="flex flex-wrap gap-4 items-center">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow hover:bg-gray-100"
                    >
                      <X className="w-3 h-3 text-black" />
                    </button>
                  </div>
                ))}
                
                {selectedFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-rose-gold hover:text-rose-gold transition-colors flex-shrink-0"
                  >
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Add Media</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Up to 5 images/videos. Max 5MB for images, 20MB for videos.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={uploading || createReview.isPending}>
                Submit Review
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowForm(false);
                setSelectedFiles([]);
              }} disabled={uploading}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {reviewsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review: Review) => (
            <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-black">
                      {review.user ? `${review.user.firstName} ${review.user.lastName?.[0] ?? ''}.` : review.guestName}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                         key={i}
                        className={cn(
                          'w-4 h-4',
                          i < review.rating ? 'fill-rose-gold text-rose-gold' : 'text-gray-300'
                        )}
                      />
                    ))}
                    <span className="text-sm text-gray-400 ml-2">
                      {review.createdAt ? formatDate(review.createdAt) : ''}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                  <p className="text-gray-600">{review.body}</p>

                  {/* Display media attached to review */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {review.images.map((img, idx) => {
                        const url = typeof img === 'string' ? img : (img as any).url;
                        const isVideo = url.match(/\.(mp4|mov|webm)$/i);
                        return isVideo ? (
                          <video key={idx} src={url} className="w-24 h-24 object-cover rounded-lg border border-gray-200" controls />
                        ) : (
                          <img key={idx} src={url} alt="Review attachment" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                        );
                      })}
                    </div>
                  )}

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100 ml-4 relative before:content-[''] before:absolute before:-left-4 before:top-4 before:w-4 before:h-px before:bg-gray-200">
                      <div className="flex items-center gap-2 mb-1 text-rose-gold font-medium text-sm">
                        <MessageSquare className="w-4 h-4" />
                        <span>Admin Reply</span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.adminReply.body}</p>
                    </div>
                  )}

                </div>
              </div>

              {isAuthenticated && user && (
                <button
                  onClick={() => helpfulMutation.mutate(review._id)}
                  className={cn(
                    'mt-4 inline-flex items-center gap-1 text-sm transition-colors ml-1',
                    review.helpfulVoters?.includes(user._id)
                      ? 'text-rose-gold'
                      : 'text-gray-500 hover:text-rose-gold'
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulVotes ?? 0})
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
