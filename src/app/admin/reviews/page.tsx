'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Star, Trash2, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { reviewApi, Review } from '@/lib/api/reviewApi';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-all-reviews'],
    queryFn: reviewApi.getAllAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => reviewApi.delete(reviewId),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-all-reviews'] });
    },
    onError: () => toast.error('Failed to delete review'),
  });

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: string; body: string }) => 
      reviewApi.reply(reviewId, { body }),
    onSuccess: () => {
      toast.success('Reply posted');
      setReplyingTo(null);
      setReplyBody('');
      queryClient.invalidateQueries({ queryKey: ['admin-all-reviews'] });
    },
    onError: () => toast.error('Failed to post reply'),
  });

  const handleReplySubmit = (reviewId: string) => {
    if (!replyBody.trim()) return;
    replyMutation.mutate({ reviewId, body: replyBody });
  };

  const handleEditClick = (reviewId: string, currentBody: string) => {
    setReplyingTo(reviewId);
    setReplyBody(currentBody);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-500 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-black">Reviews Management</h1>
            <p className="text-sm text-gray-500">{reviews.length} total reviews</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500">
            No reviews yet
          </div>
        ) : (
          reviews.map((review) => {
            const productInfo = typeof review.product === 'object' ? review.product : null;
            return (
              <div key={review._id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-rose-gold text-rose-gold' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        by {review.user?.firstName ? `${review.user.firstName} ${review.user.lastName}` : review.guestName || 'Guest'}
                      </span>
                    </div>
                    <h3 className="font-medium text-black">{review.title}</h3>
                    <p className="text-gray-600 mt-1">{review.body}</p>
                    
                    {/* Display Media if exists */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {review.images.map((img, idx) => {
                          const url = typeof img === 'string' ? img : (img as any).url;
                          const isVideo = url.match(/\.(mp4|mov|webm)$/i);
                          return isVideo ? (
                            <video key={idx} src={url} className="w-20 h-20 object-cover rounded-lg border border-gray-200" controls />
                          ) : (
                            <img key={idx} src={url} alt="Review attachment" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                          );
                        })}
                      </div>
                    )}

                    {productInfo && (
                      <p className="text-sm text-rose-gold mt-4">Product: {productInfo.name}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {review.createdAt ? formatDate(review.createdAt) : ''}
                    </p>

                    {/* Admin Reply Section */}
                    {review.adminReply && replyingTo !== review._id ? (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
                        <div className="flex items-center gap-2 mb-1 text-rose-gold font-medium text-sm">
                          <MessageSquare className="w-4 h-4" />
                          <span>Admin Reply</span>
                        </div>
                        <p className="text-gray-700 text-sm">{review.adminReply.body}</p>
                        <button
                          onClick={() => handleEditClick(review._id, review.adminReply!.body)}
                          className="absolute top-4 right-4 text-xs text-gray-400 hover:text-rose-gold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Edit Reply
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {replyingTo === review._id ? (
                          <div className="space-y-3">
                            <textarea
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              placeholder="Type your reply here..."
                              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-gold focus:ring-rose-gold text-sm"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReplySubmit(review._id)}
                                loading={replyMutation.isPending}
                                disabled={!replyBody.trim()}
                              >
                                Post Reply
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyBody('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingTo(review._id);
                              setReplyBody('');
                            }}
                            className="text-sm text-gray-500 hover:text-rose-gold font-medium flex items-center gap-1"
                          >
                            <MessageSquare className="w-4 h-4" /> Reply
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this review?')) {
                          deleteMutation.mutate(review._id);
                        }
                      }}
                      loading={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
