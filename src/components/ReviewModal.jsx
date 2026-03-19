'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2, Package, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function ReviewModal({ isOpen, onOpenChange, order, onComplete }) {
  const [reviews, setReviews] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize reviews for items that haven't been reviewed
  useEffect(() => {
    if (order && order.items) {
      const initialReviews = {};
      order.items.forEach(item => {
        if (!item.isReviewed) {
          initialReviews[item.productId] = {
            productId: item.productId,
            name: item.name,
            image: item.image,
            rating: 5,
            comment: ''
          };
        }
      });
      setReviews(initialReviews);
    }
  }, [order]);

  const handleRatingChange = (productId, rating) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment }
    }));
  };

  const handleSubmit = async () => {
    const reviewsToSubmit = Object.values(reviews);
    if (reviewsToSubmit.length === 0) return;

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/reviews/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          reviews: reviewsToSubmit
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Thank you for your feedback!');
        onComplete();
        onOpenChange(false);
      } else {
        if (data.errors) {
          const newErrors = {};
          data.errors.forEach(err => {
            newErrors[err.productId] = err.error;
          });
          setErrors(newErrors);
          toast.error('Some products could not be reviewed.');
        } else {
          toast.error(data.error || 'Failed to submit reviews');
        }
      }
    } catch (error) {
      toast.error('An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (!order) return null;

  const itemsToReview = Object.values(reviews);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="size-6 text-primary" />
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>
            Your parcel has been delivered! Please share your feedback on the products from Order #{order.orderId}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {itemsToReview.map((item) => (
            <div key={item.productId} className="space-y-4 pb-6 border-b border-border last:border-0 last:pb-0">
              <div className="flex gap-4">
                <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-1">{item.name}</h4>
                  
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(item.productId, star)}
                        disabled={!!errors[item.productId]}
                        className={cn(
                          "transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100",
                          item.rating >= star ? "text-amber-500" : "text-muted/40"
                        )}
                      >
                        <Star className={cn("size-5", item.rating >= star && "fill-current")} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {errors[item.productId] ? (
                <div className="flex items-center gap-2 p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg">
                  <AlertCircle className="size-4" />
                  {errors[item.productId]}
                </div>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Share your thoughts about this product..."
                    className="resize-none text-sm min-h-[80px]"
                    value={item.comment}
                    onChange={(e) => handleCommentChange(item.productId, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Maybe Later
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || itemsToReview.length === 0}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Reviews'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
