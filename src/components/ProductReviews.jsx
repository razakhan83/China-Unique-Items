'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Star, MessageSquarePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function ReviewCard({ name, body, rating, date }) {
  const initial = (name || 'U').charAt(0).toUpperCase();
  return (
    <div className="rounded-xl border border-border bg-muted/35 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {initial}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{name}</span>
            <span className="text-[10px] text-muted-foreground">{new Date(date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-0.5 text-accent-foreground">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className={cn('size-3.5', index < rating ? 'fill-current' : 'text-muted/40')} />
          ))}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export default function ProductReviews({ productId, productName }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  }

  function handleAddReviewClick() {
    if (!session) {
      toast.info('Please sign in to leave a review.');
      signIn('google');
      return;
    }
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Thank you! Your review has been submitted.');
        setModalOpen(false);
        setRating(0);
        setComment('');
        fetchReviews(); // Refresh
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="surface-card rounded-xl p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="mb-1 text-xl font-bold text-foreground md:text-2xl">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <div className="flex text-accent-foreground">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star 
                  key={index} 
                  className={cn('size-4', index < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-current' : 'text-muted/40')} 
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">
              {reviews.length > 0 ? `${reviews.length} Verified Reviews` : 'Be the first to review'}
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="max-w-max border-primary/20 text-primary hover:bg-primary/5"
          onClick={handleAddReviewClick}
        >
          <MessageSquarePlus className="mr-2 size-4" />
          Write a Review
        </Button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              name={review.userName}
              body={review.comment}
              rating={review.rating}
              date={review.createdAt}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          <p>No reviews yet for this product. Be the first to share your experience!</p>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your thoughts on <span className="font-semibold text-foreground">{productName}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2 text-center">
              <Label className="block text-sm font-medium">Rating</Label>
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;
                  return (
                    <button
                      key={index}
                      type="button"
                      className="transition-transform active:scale-95"
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starValue)}
                    >
                      <Star
                        className={cn(
                          'size-8 transition-colors',
                          (hoverRating || rating) >= starValue
                            ? 'fill-accent-foreground text-accent-foreground'
                            : 'text-muted'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Comments (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="What did you like or dislike?"
                className="min-h-[100px] rounded-xl"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl font-bold" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
