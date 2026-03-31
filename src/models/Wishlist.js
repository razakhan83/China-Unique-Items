import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema(
  {
    storeKey: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

WishlistSchema.index({ userId: 1, productId: 1, storeKey: 1 }, { unique: true });

const cachedWishlist = mongoose.models.Wishlist;
if (
  cachedWishlist &&
  (
    !cachedWishlist.schema.path('storeKey') ||
    !cachedWishlist.schema.indexes().some(
      ([index]) => index?.userId === 1 && index?.productId === 1 && index?.storeKey === 1,
    )
  )
) {
  delete mongoose.models.Wishlist;
}

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
