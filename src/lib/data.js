import 'server-only';
import mongoose from 'mongoose';
import { revalidateTag } from 'next/cache';
import { cacheLife } from 'next/cache';
import { cacheTag } from 'next/cache';

import Category from '@/models/Category';
import CoverPhoto from '@/models/CoverPhoto';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import User from '@/models/User';
import mongooseConnect from '@/lib/mongooseConnect';
import { optimizeCloudinaryUrl } from '@/lib/cloudinaryImage';
import { normalizeEmail, getPhoneRegex } from '@/lib/admin';
import {
  getProductCategories,
  getProductCategoryNames,
  hasProductCategory,
  normalizeCategoryId,
} from '@/lib/productCategories';
import { normalizeProductImages } from '@/lib/productImages';

const SETTINGS_KEY = 'site-settings';
const COVER_PHOTOS_KEY = 'home-cover-photos';

function normalizeMediaItem(item, sortOrder = 0, fallbackItem = null) {
  if ((!item || typeof item !== 'object') && (!fallbackItem || typeof fallbackItem !== 'object')) return null;

  const source = item && typeof item === 'object' ? item : {};
  const fallback = fallbackItem && typeof fallbackItem === 'object' ? fallbackItem : {};
  const url = String(source.url || source.image || fallback.url || fallback.image || '').trim();
  if (!url) return null;

  return {
    url: optimizeCloudinaryUrl(url),
    publicId: String(source.publicId || source.public_id || fallback.publicId || fallback.public_id || '').trim(),
    blurDataURL: String(source.blurDataURL || fallback.blurDataURL || '').trim(),
    sortOrder: Number(source.sortOrder ?? sortOrder) || 0,
  };
}

function serializeProduct(product) {
  const { Image, ImageURL, ...safeProduct } = product;

  return {
    ...safeProduct,
    _id: safeProduct._id.toString(),
    id: safeProduct.slug || safeProduct._id.toString(),
    slug: safeProduct.slug || safeProduct._id.toString(),
    Category: getProductCategories(safeProduct),
    Images: normalizeProductImages(safeProduct.Images),
    createdAt: safeProduct.createdAt ? new Date(safeProduct.createdAt).toISOString() : null,
    updatedAt: safeProduct.updatedAt ? new Date(safeProduct.updatedAt).toISOString() : null,
    isNewArrival: safeProduct.isNewArrival === true,
    isTrending: safeProduct.isTrending === true,
    isBestSelling: safeProduct.isBestSelling === true,
  };
}

function toProductCardItem(product) {
  return {
    id: product.id,
    _id: product._id,
    slug: product.slug,
    Name: product.Name,
    Price: Number(product.Price || 0),
    Description: product.Description || '',
    Category: product.Category,
    Images: product.Images,
    StockStatus: product.StockStatus || 'Out of Stock',
    createdAt: product.createdAt,
    isLive: product.isLive !== false,
    discountPercentage: Number(product.discountPercentage || 0),
    isDiscounted: product.isDiscounted === true,
    discountedPrice: product.discountedPrice != null ? Number(product.discountedPrice) : null,
  };
}

function toProductDetailView(product) {
  return {
    id: product.id,
    _id: product._id,
    slug: product.slug,
    Name: product.Name,
    Description: product.Description || '',
    Price: Number(product.Price || 0),
    Category: product.Category,
    Images: product.Images,
    StockStatus: product.StockStatus || 'Out of Stock',
    stockQuantity: Number(product.stockQuantity || 0),
    createdAt: product.createdAt,
    discountPercentage: Number(product.discountPercentage || 0),
    isDiscounted: product.isDiscounted === true,
    discountedPrice: product.discountedPrice != null ? Number(product.discountedPrice) : null,
  };
}

function toAdminProductRow(product) {
  return {
    id: product.id,
    _id: product._id,
    slug: product.slug,
    Name: product.Name,
    Price: Number(product.Price || 0),
    Category: product.Category,
    Images: product.Images,
    StockStatus: product.StockStatus || 'Out of Stock',
    stockQuantity: Number(product.stockQuantity || 0),
    isLive: product.isLive !== false,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    isNewArrival: product.isNewArrival === true,
    isTrending: product.isTrending === true,
    isBestSelling: product.isBestSelling === true,
    discountPercentage: Number(product.discountPercentage || 0),
    isDiscounted: product.isDiscounted === true,
    discountedPrice: product.discountedPrice != null ? Number(product.discountedPrice) : null,
  };
}

function toOrderSummaryRow(order) {
  return {
    _id: order._id.toString(),
    orderId: order.orderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail || '',
    customerPhone: order.customerPhone || '',
    customerAddress: order.customerAddress || '',
    customerCity: order.customerCity || '',
    landmark: order.landmark || '',
    paymentStatus: order.paymentStatus || 'COD',
    weight: Number(order.weight ?? 2),
    manualCodAmount: order.manualCodAmount,
    itemType: order.itemType || 'Mix',
    orderQuantity: Number(order.orderQuantity || 1),
    totalAmount: Number(order.totalAmount || 0),
    status: order.status,
    notes: order.notes || '',
    courierName: order.courierName || '',
    trackingNumber: order.trackingNumber || '',
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          ...item,
          _id: item._id?.toString(),
          productId: item.productId?.toString() || item.productId,
        }))
      : [],
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
  };
}

async function getLiveProductsRaw() {
  await mongooseConnect();

  const products = await Product.find({ isLive: true })
    .populate('Category')
    .sort({ createdAt: -1 })
    .lean();
  return products.map(serializeProduct);
}

async function getAllProductsRaw() {
  await mongooseConnect();

  const products = await Product.find({})
    .populate('Category')
    .sort({ createdAt: -1 })
    .lean();
  return products.map(serializeProduct);
}

async function getSettingsRaw() {
  await mongooseConnect();

  let settings = await Settings.findOne({ singletonKey: SETTINGS_KEY }).lean();
  if (!settings) {
    settings = await Settings.create({ singletonKey: SETTINGS_KEY });
    settings = settings.toObject();
  }

  return {
    _id: settings._id.toString(),
    storeName: settings.storeName || 'China Unique Store',
    supportEmail: settings.supportEmail || '',
    businessAddress: settings.businessAddress || '',
    whatsappNumber: settings.whatsappNumber || '923001234567',
    karachiDeliveryFee: Number(settings.karachiDeliveryFee || 200),
    outsideKarachiDeliveryFee: Number(settings.outsideKarachiDeliveryFee || 250),
    freeShippingThreshold: Number(settings.freeShippingThreshold || 3000),
    announcementBarEnabled: settings.announcementBarEnabled ?? true,
    announcementBarText: settings.announcementBarText || '',
  };
}

async function getCoverPhotosRaw() {
  await mongooseConnect();

  let coverPhoto = await CoverPhoto.findOne({ singletonKey: COVER_PHOTOS_KEY }).lean();
  if (!coverPhoto) {
    coverPhoto = await CoverPhoto.create({ singletonKey: COVER_PHOTOS_KEY });
    coverPhoto = coverPhoto.toObject();
  }

  return Array.isArray(coverPhoto.slides)
    ? coverPhoto.slides
        .map((item, index) => {
          const desktopImage = normalizeMediaItem(
            item.desktopImage || {
              url: item.url,
              publicId: item.publicId,
              blurDataURL: item.blurDataURL,
            },
            index,
          );
          if (!desktopImage) return null;
          const tabletImage = normalizeMediaItem(item.tabletImage, index, desktopImage);
          const mobileImage = normalizeMediaItem(item.mobileImage, index, desktopImage);

          return {
            desktopImage,
            tabletImage,
            mobileImage,
            alt: String(item.alt || '').trim(),
            sortOrder: Number(item.sortOrder ?? index) || 0,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
}

async function getCategoriesRaw() {
  await mongooseConnect();

  // Sort by sortOrder first (admin-defined order), then by name as fallback
  const dbCategories = await Category.find({}).sort({ sortOrder: 1, name: 1 }).lean();
  let mappedCategories = [];
  if (dbCategories.length > 0) {
    mappedCategories = dbCategories.map((category) => ({
      _id: category._id.toString(),
      id: category.slug || normalizeCategoryId(category.name),
      label: category.name,
      image: optimizeCloudinaryUrl(category.image || ''),
      imagePublicId: category.imagePublicId || '',
      blurDataURL: category.blurDataURL || '',
      sortOrder: category.sortOrder ?? 0,
      isEnabled: category.isEnabled !== false,
    }));
  }

  // Ensure special-offers is always in the list for the homepage sections
  if (!mappedCategories.some(c => c.id === 'special-offers')) {
    mappedCategories.unshift({
      _id: 'special-offers',
      id: 'special-offers',
      label: 'Special Offers',
      image: '',
      imagePublicId: '',
      blurDataURL: '',
      sortOrder: 0,
      isEnabled: true,
    });
  }
  
  if (mappedCategories.length > 0) {
    return mappedCategories;
  }

  const products = await getLiveProductsRaw();
  const categoryMap = new Map();

  for (const product of products) {
    for (const category of getProductCategories(product)) {
      const trimmed = String(category.name || '').trim();
      if (!trimmed) continue;
      const id = category.id || normalizeCategoryId(trimmed);
      if (!categoryMap.has(id)) {
        categoryMap.set(id, {
          id,
          label: trimmed,
          image: '',
          imagePublicId: '',
          blurDataURL: '',
        });
      }
    }
  }

  return Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export async function getStoreSettings() {
  'use cache';
  cacheLife('days');
  cacheTag('settings');
  return getSettingsRaw();
}

export async function getAdminCoverPhotos() {
  await mongooseConnect();

  let coverPhoto = await CoverPhoto.findOne({ singletonKey: COVER_PHOTOS_KEY }).lean();
  if (!coverPhoto) {
    coverPhoto = await CoverPhoto.create({ singletonKey: COVER_PHOTOS_KEY });
    coverPhoto = coverPhoto.toObject();
  }

  return Array.isArray(coverPhoto.slides)
    ? coverPhoto.slides
        .map((item, index) => {
          const desktopImage = normalizeMediaItem(
            item.desktopImage || {
              url: item.url,
              publicId: item.publicId,
              blurDataURL: item.blurDataURL,
            },
            index,
          );
          if (!desktopImage) return null;
          const tabletImage = normalizeMediaItem(item.tabletImage, index, desktopImage);
          const mobileImage = normalizeMediaItem(item.mobileImage, index, desktopImage);

          return {
            desktopImage,
            tabletImage,
            mobileImage,
            alt: String(item.alt || '').trim(),
            sortOrder: Number(item.sortOrder ?? index) || 0,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
}

export async function getStoreCategories() {
  'use cache';
  cacheLife('days');
  cacheTag('categories');
  return getCategoriesRaw();
}

export async function getHomeSections() {
  'use cache';
  cacheLife('minutes');
  cacheTag('home-sections', 'products', 'categories');
  const [products, categories, coverPhotos] = await Promise.all([
    getLiveProductsRaw(),
    getCategoriesRaw(),
    getCoverPhotosRaw(),
  ]);
  const featuredProducts = products.slice(0, 8).map(toProductCardItem);
  const sections = categories
    .map((category) => {
      let items;
      let label = category?.label || 'Special Offers';
      if (category.id === 'special-offers') {
        const discountedProducts = products
          .filter((product) => product.isDiscounted === true)
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 12)
          .map(toProductCardItem);
        
        items = discountedProducts;
        
        // Ensure the label is clean
        if (label.includes('🏷️')) {
          category.label = label.replace(' 🏷️', '');
        }
        category.iconName = 'Tag';
      } else {
        items = products
          .filter((product) => hasProductCategory(product, category.id))
          .slice(0, 12)
          .map(toProductCardItem);
      }

      return {
        category,
        products: items,
      };
    })
    .filter((section) => 
      (section.category.id === 'special-offers' || section.category.isEnabled !== false) &&
      (section.category.id === 'special-offers' || section.products.length > 0)
    );

  // Add the dynamic marketing sections (New Arrivals, Trending, Best Selling)
  const marketingSections = [
    { id: 'new-arrivals', label: 'New Arrivals', flag: 'isNewArrival', iconName: 'Sparkles' },
    { id: 'trending', label: 'Trending This Week', flag: 'isTrending', iconName: 'Flame' },
    { id: 'best-selling', label: 'Best Selling', flag: 'isBestSelling', iconName: 'Trophy' },
  ].map(m => {
    const items = products
      .filter(p => p[m.flag] === true)
      .slice(0, 12)
      .map(toProductCardItem);
    
    if (items.length === 0) return null;

    return {
      category: {
        id: m.id,
        label: m.label,
        iconName: m.iconName,
        image: '',
        isEnabled: true,
      },
      products: items
    };
  }).filter(Boolean);

  // Combine and sort sections: Special Offers first, then Marketing, then Categories
  const finalSections = [
    ...sections.filter(s => s.category.id === 'special-offers'),
    ...marketingSections,
    ...sections.filter(s => s.category.id !== 'special-offers')
  ];

  return {
    categories: categories.filter(c => c.isEnabled !== false),
    coverPhotos,
    featuredProducts,
    searchProducts: products.map(toProductCardItem),
    sections: finalSections,
  };
}

export async function getProductsList({ category = 'all', search = '', sort = 'newest', page = 1, limit = 24 } = {}) {
  'use cache';
  cacheLife('minutes');
  cacheTag('products');
  const products = await getLiveProductsRaw();
  const normalizedSearch = String(search || '').trim().toLowerCase();

  let searchMatched = products;

  if (normalizedSearch) {
    searchMatched = searchMatched.filter((product) => {
      const name = String(product.Name || '').toLowerCase();
      const categories = getProductCategoryNames(product).map((value) => String(value || '').toLowerCase());
      return name.includes(normalizedSearch) || categories.some((value) => value.includes(normalizedSearch));
    });
  }

  let filtered = searchMatched;

  if (category === 'new-arrivals') {
    filtered = filtered.filter((product) => product.isNewArrival === true);
  } else if (category === 'special-offers') {
    filtered = filtered.filter((product) => product.isDiscounted === true);
  } else if (category && category !== 'all') {
    filtered = filtered.filter((product) => hasProductCategory(product, category));
  }

  const sorted = [...filtered];
  if (sort === 'price-low') {
    sorted.sort((a, b) => Number(a.Price || 0) - Number(b.Price || 0));
  } else if (sort === 'price-high') {
    sorted.sort((a, b) => Number(b.Price || 0) - Number(a.Price || 0));
  } else if (sort === 'az') {
    sorted.sort((a, b) => String(a.Name || '').localeCompare(String(b.Name || '')));
  } else if (sort === 'za') {
    sorted.sort((a, b) => String(b.Name || '').localeCompare(String(a.Name || '')));
  } else {
    sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 24);
  const start = (safePage - 1) * safeLimit;
  const items = sorted.slice(start, start + safeLimit).map(toProductCardItem);

  const categoryCounts = new Map();
  for (const product of searchMatched) {
    for (const value of getProductCategories(product)) {
      const id = value.id || value._id;
      categoryCounts.set(id, (categoryCounts.get(id) || 0) + 1);
    }
  }

  const availableCategories = (await getCategoriesRaw()).filter(
    (entry) => entry.id === 'special-offers' || (categoryCounts.get(entry.id) || 0) > 0,
  );

  return {
    items,
    total: sorted.length,
    page: safePage,
    limit: safeLimit,
    hasMore: start + safeLimit < sorted.length,
    activeCategory: category,
    searchTerm: search,
    sort,
    categories: availableCategories,
  };
}

export async function getProductBySlug(slug) {
  'use cache';
  cacheLife('max');
  cacheTag('products', `product-${slug}`);
  const safeSlug = String(slug || '').trim();
  if (!safeSlug) return null;

  async function getSingleProduct(productSlug) {
    try {
      await mongooseConnect();
      
      // 1. Try finding by slug first (vanity URL)
      let product = await Product.findOne({ slug: productSlug, isLive: true }).populate('Category').lean();
      
      // 2. If not found, and it looks like a Mongo ID, try finding by ID
      if (!product && mongoose.Types.ObjectId.isValid(productSlug)) {
        product = await Product.findOne({ _id: productSlug, isLive: true }).populate('Category').lean();
      }
      
      return product ? serializeProduct(product) : null;
    } catch (error) {
      console.error(`❌ [DATA] Error fetching product "${productSlug}":`, error.message);
      throw error;
    }
  }

  try {
    const product = await getSingleProduct(safeSlug);
    return product ? toProductDetailView(product) : null;
  } catch (error) {
    console.error(`❌ [DATA] getProductBySlug failed for "${safeSlug}":`, error.message);
    throw error; // Rethrow to let Next.js Error boundary handle it, preventing false 404 caching
  }
}

export async function getRelatedProducts({ category = '', excludeSlug = '', limit = 8 } = {}) {
  'use cache';
  cacheLife('max');
  cacheTag('products');
  const products = await getLiveProductsRaw();

  return products
    .filter((product) => product.slug !== excludeSlug)
    .filter((product) => {
      if (!category) return true;
      return hasProductCategory(product, category);
    })
    .slice(0, limit)
    .map(toProductCardItem);
}

export async function getAdminProducts() {
  await mongooseConnect();
  const products = await Product.find({}).populate('Category').sort({ createdAt: -1 }).lean();
  const serializedProducts = products.map(serializeProduct);
  return serializedProducts.map(toAdminProductRow);
}

export async function getOrdersList() {
  await mongooseConnect();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  return orders.map(toOrderSummaryRow);
}

export async function getUserOrders(email) {
  if (!email) return [];
  await mongooseConnect();
  
  const normalizedEmail = normalizeEmail(email);

  // 1. Fetch user to see if they have a phone number linked
  const user = await User.findOne({ email: normalizedEmail }).lean();
  
  // 2. Build query: match by customerEmail OR by customerPhone if phone exists (fuzzy)
  const query = {
    $or: [
      { customerEmail: normalizedEmail }
    ]
  };

  if (user?.phone) {
    const phoneRegex = getPhoneRegex(user.phone);
    if (phoneRegex) {
      query.$or.push({ customerPhone: { $regex: phoneRegex } });
    }
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  return orders.map(toOrderSummaryRow);
}

export async function getOrderById(id) {
  await mongooseConnect();
  const order = await Order.findById(String(id || '')).lean();
  return order ? toOrderSummaryRow(order) : null;
}

export async function getAdminDashboardData() {
  await mongooseConnect();

  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    liveProducts,
    revenueAgg,
    customersAgg,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'Pending' }),
    Product.countDocuments(),
    Product.countDocuments({ isLive: true }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $group: { _id: '$customerPhone' } }, { $count: 'count' }]),
    Order.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return {
    summary: {
      totalOrders,
      pendingOrders,
      totalProducts,
      liveProducts,
      totalRevenue: Number(revenueAgg[0]?.total || 0),
      totalCustomers: Number(customersAgg[0]?.count || 0),
    },
    recentOrders: recentOrders.map(toOrderSummaryRow),
  };
}

export async function getAdminSettings() {
  await mongooseConnect();

  let settings = await Settings.findOne({ singletonKey: SETTINGS_KEY }).lean();
  if (!settings) {
    settings = await Settings.create({ singletonKey: SETTINGS_KEY });
    settings = settings.toObject();
  }

  return {
    _id: settings._id.toString(),
    storeName: settings.storeName || 'China Unique Store',
    supportEmail: settings.supportEmail || '',
    businessAddress: settings.businessAddress || '',
    whatsappNumber: settings.whatsappNumber || '923001234567',
    karachiDeliveryFee: Number(settings.karachiDeliveryFee || 200),
    outsideKarachiDeliveryFee: Number(settings.outsideKarachiDeliveryFee || 250),
    freeShippingThreshold: Number(settings.freeShippingThreshold || 3000),
    announcementBarEnabled: settings.announcementBarEnabled ?? true,
    announcementBarText: settings.announcementBarText || '',
  };
}
