import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    image: {
      type: String,
    },
    storeKey: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    phone: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String, // Complete Address
    },
    landmark: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    forceLogoutAt: {
      type: Date,
    },
    wishlist: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1, storeKey: 1 }, { unique: true });

const cachedUser = mongoose.models.User;
if (
  cachedUser &&
  (
    !cachedUser.schema.path('storeKey') ||
    !cachedUser.schema.indexes().some(([index]) => index?.email === 1 && index?.storeKey === 1)
  )
) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
