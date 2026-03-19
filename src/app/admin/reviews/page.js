import { connection } from 'next/server';
import { Suspense } from 'react';
import { requireAdmin } from '@/lib/requireAdmin';
import AdminReviewsClient from './AdminReviewsClient';
import mongooseConnect from '@/lib/mongooseConnect';
import Review from '@/models/Review';

export const metadata = {
  title: 'Review Management | Admin',
};

export default async function AdminReviewsPage() {
  await connection();
  await requireAdmin();

  return <ReviewsContent />;
}

async function ReviewsContent() {
  await mongooseConnect();
  const reviews = await Review.find({})
    .populate('productId', 'Name slug')
    .sort({ createdAt: -1 })
    .lean();
  
  const serializedReviews = reviews.map(review => ({
    ...review,
    _id: review._id.toString(),
    productId: review.productId ? {
      ...review.productId,
      _id: review.productId._id.toString()
    } : null,
    userId: review.userId ? review.userId.toString() : null,
    createdAt: review.createdAt?.toISOString(),
    updatedAt: review.updatedAt?.toISOString(),
  }));

  return (
    <Suspense fallback={null}>
      <AdminReviewsClient initialReviews={serializedReviews} />
    </Suspense>
  );
}
