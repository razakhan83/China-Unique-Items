import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    storeKey: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    imagePublicId: {
      type: String,
      default: "",
      trim: true,
    },
    blurDataURL: {
      type: String,
      default: "",
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    showOnHome: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique: same name/slug allowed across different stores
CategorySchema.index({ name: 1, storeKey: 1 }, { unique: true });
CategorySchema.index({ slug: 1, storeKey: 1 }, { unique: true });

const cachedCategory = mongoose.models.Category;
if (cachedCategory && !cachedCategory.schema.path('storeKey')) {
  delete mongoose.models.Category;
}

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
