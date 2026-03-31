import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    storeKey: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['order', 'review', 'user'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      id: String, // orderId, productId, userId etc
      userName: String,
      rating: Number,
    },
  },
  {
    timestamps: true,
  }
);

const cachedNotification = mongoose.models.Notification;
if (cachedNotification && !cachedNotification.schema.path('storeKey')) {
  delete mongoose.models.Notification;
}

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
