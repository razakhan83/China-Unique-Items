import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongooseConnect from '@/lib/mongooseConnect';
import Review from '@/models/Review';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Notification from '@/models/Notification';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, reviews } = body;

    if (!orderId || !reviews || !Array.isArray(reviews)) {
      return NextResponse.json({ success: false, error: 'Invalid request data' }, { status: 400 });
    }

    await mongooseConnect();

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Verify ownership (simplified check, usually by email)
    if (order.customerEmail !== session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const results = [];
    const errors = [];

    for (const reviewData of reviews) {
      const { productId, rating, comment } = reviewData;

      // 1. Validate Product Existence
      const product = await Product.findById(productId);
      if (!product) {
        errors.push({ productId, error: 'This product has been removed' });
        continue;
      }

      // 2. Create Review
      const newReview = await Review.create({
        productId,
        userId: session.user.id || session.user._id, // Handle different ID formats
        userName: session.user.name,
        rating,
        comment,
      });

      // 3. Update Order Item Status
      await Order.updateOne(
        { _id: orderId, 'items.productId': productId },
        { $set: { 'items.$.isReviewed': true } }
      );

      // 4. Create Notification for Admin
      await Notification.create({
        type: 'review',
        message: `${session.user.name} left a ${rating}-star rating on ${product.Name}`,
        link: `/admin/reviews?id=${newReview._id}`,
        metadata: {
          id: productId,
          userName: session.user.name,
          rating,
        },
      });

      results.push(newReview);
    }

    if (errors.length > 0 && results.length === 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Reviews submitted successfully', 
      results,
      errors: errors.length > 0 ? errors : undefined 
    });

  } catch (error) {
    console.error('Bulk review error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
