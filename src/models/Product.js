import mongoose from 'mongoose';

const ProductImageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        blurDataURL: {
            type: String,
            default: '',
        },
        publicId: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        _id: false,
    }
);

const ProductSchema = new mongoose.Schema(
    {
        storeKey: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },
        Name: {
            type: String,
            required: [true, 'Please provide a name for this product.'],
            maxlength: [200, 'Name cannot be more than 200 characters'],
        },
        Description: {
            type: String,
            required: false,
        },
        seoTitle: {
            type: String,
            trim: true,
            maxlength: [70, 'SEO title cannot be more than 70 characters'],
            default: '',
        },
        seoDescription: {
            type: String,
            trim: true,
            maxlength: [320, 'SEO description cannot be more than 320 characters'],
            default: '',
        },
        seoKeywords: {
            type: String,
            trim: true,
            maxlength: [250, 'SEO keywords cannot be more than 250 characters'],
            default: '',
        },
        seoCanonicalUrl: {
            type: String,
            trim: true,
            default: '',
        },
        Price: {
            type: Number,
            required: [true, 'Please provide a price.'],
        },
        Images: {
            type: [ProductImageSchema],
            default: []
        },
        Category: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category',
            }],
            required: [true, 'Please provide at least one category.'],
            default: [],
        },
        stockQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        StockStatus: {
            type: String,
            enum: ['In Stock', 'Out of Stock'], // Only allow these two values
            required: true,
        },
        slug: {
            type: String,
            required: false,
            trim: true,
        },
        isLive: {
            type: Boolean,
            default: true
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        isDiscounted: {
            type: Boolean,
            default: false,
        },
        discountedPrice: {
            type: Number,
            default: null,
        },
        isNewArrival: {
            type: Boolean,
            default: false,
        },
        isBestSelling: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

ProductSchema.index({ storeKey: 1, slug: 1 }, { unique: true, sparse: true });

const cachedProduct = mongoose.models.Product;
if (
    cachedProduct &&
    (
        !cachedProduct.schema.path('storeKey') ||
        !cachedProduct.schema.indexes().some(([index]) => index?.storeKey === 1 && index?.slug === 1)
    )
) {
    delete mongoose.models.Product;
}

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
