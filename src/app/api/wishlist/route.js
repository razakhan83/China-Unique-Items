import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

import { authOptions } from '@/lib/auth';
import mongooseConnect from '@/lib/mongooseConnect';
import Product from '@/models/Product';
import User from '@/models/User';
import Wishlist from '@/models/Wishlist';
import { normalizeEmail } from '@/lib/admin';
import { getStoreKey, withStoreScope, withStoreScopeForCreate } from '@/lib/store-scope';

function serializeWishlistProduct(product) {
  return {
    _id: product._id.toString(),
    id: product.slug || product._id.toString(),
    slug: product.slug || product._id.toString(),
    Name: product.Name || '',
    Price: Number(product.Price || 0),
    discountedPrice: product.discountedPrice != null ? Number(product.discountedPrice) : null,
    discountPercentage: Number(product.discountPercentage || 0),
    isDiscounted: product.isDiscounted === true,
    Images: Array.isArray(product.Images) ? product.Images : [],
    Category: Array.isArray(product.Category) ? product.Category : product.Category ? [product.Category] : [],
    StockStatus: product.StockStatus || 'Out of Stock',
    isLive: product.isLive !== false,
  };
}

async function getWishlistPayload(email) {
  await mongooseConnect();

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne(withStoreScope({ email: normalizedEmail })).select('_id wishlist').lean();
  if (!user?._id) {
    return { ids: [], items: [] };
  }

  const wishlistEntries = await Wishlist.find(withStoreScope({ userId: user._id }))
    .select('productId')
    .sort({ createdAt: -1 })
    .lean();

  let wishlistIds = wishlistEntries.map((entry) => String(entry.productId || '')).filter(Boolean);

  if (wishlistIds.length === 0 && Array.isArray(user?.wishlist) && user.wishlist.length > 0) {
    const legacyIds = user.wishlist
      .map((id) => String(id || '').trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (legacyIds.length > 0) {
      await Wishlist.bulkWrite(
        legacyIds.map((productId) => ({
          updateOne: {
            filter: withStoreScope({ userId: user._id, productId }),
            update: {
              $setOnInsert: withStoreScopeForCreate({ userId: user._id, productId }),
            },
            upsert: true,
          },
        })),
        { ordered: false },
      ).catch(() => null);

      wishlistIds = legacyIds;
    }
  }

  if (wishlistIds.length === 0) {
    return { ids: [], items: [] };
  }

  const products = await Product.find({
    ...withStoreScope({}),
    _id: { $in: wishlistIds },
    isLive: true,
  }).lean();

  const productMap = new Map(products.map((product) => [product._id.toString(), serializeWishlistProduct(product)]));
  const items = wishlistIds.map((id) => productMap.get(id)).filter(Boolean);

  return {
    ids: items.map((item) => item._id),
    items,
  };
}

async function upsertWishlistUser(email, update) {
  const normalizedEmail = normalizeEmail(email);
  return User.findOneAndUpdate(
    withStoreScope({ email: normalizedEmail }),
    {
      ...update,
      $set: {
        ...(update?.$set || {}),
        storeKey: getStoreKey(),
      },
      $setOnInsert: withStoreScopeForCreate({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0] || 'Customer',
        ...(update?.$setOnInsert || {}),
      }),
    },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  );
}

function validateStoreKey(inputStoreKey) {
  const requestStoreKey = String(inputStoreKey || '').trim();
  const currentStoreKey = getStoreKey();

  if (requestStoreKey && requestStoreKey !== currentStoreKey) {
    return false;
  }

  return true;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const data = await getWishlistPayload(session.user.email);
  return NextResponse.json({ success: true, data });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, storeKey } = await request.json();
  if (!validateStoreKey(storeKey)) {
    return NextResponse.json({ success: false, error: 'Invalid store scope' }, { status: 403 });
  }
  const safeProductId = String(productId || '').trim();
  if (!safeProductId || !mongoose.Types.ObjectId.isValid(safeProductId)) {
    return NextResponse.json({ success: false, error: 'Product is required' }, { status: 400 });
  }

  await mongooseConnect();
  const product = await Product.findOne(withStoreScope({ _id: safeProductId })).select('_id').lean();
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found for this store' }, { status: 404 });
  }
  const user = await upsertWishlistUser(session.user.email);
  await Wishlist.updateOne(
    withStoreScope({ userId: user._id, productId: safeProductId }),
    { $setOnInsert: withStoreScopeForCreate({ userId: user._id, productId: safeProductId }) },
    { upsert: true },
  );

  const data = await getWishlistPayload(session.user.email);
  return NextResponse.json({ success: true, data });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { productIds, storeKey } = await request.json();
  if (!validateStoreKey(storeKey)) {
    return NextResponse.json({ success: false, error: 'Invalid store scope' }, { status: 403 });
  }
  const safeIds = Array.isArray(productIds)
    ? productIds
        .map((id) => String(id || '').trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
    : [];

  await mongooseConnect();
  if (safeIds.length > 0) {
    const scopedProducts = await Product.find(withStoreScope({ _id: { $in: safeIds } }))
      .select('_id')
      .lean();
    const scopedProductIds = new Set(scopedProducts.map((product) => String(product._id)));
    const validIds = safeIds.filter((id) => scopedProductIds.has(id));

    if (validIds.length === 0) {
      const data = await getWishlistPayload(session.user.email);
      return NextResponse.json({ success: true, data });
    }

    const user = await upsertWishlistUser(session.user.email);
    await Wishlist.bulkWrite(
      validIds.map((productId) => ({
        updateOne: {
          filter: withStoreScope({ userId: user._id, productId }),
          update: {
            $setOnInsert: withStoreScopeForCreate({ userId: user._id, productId }),
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  const data = await getWishlistPayload(session.user.email);
  return NextResponse.json({ success: true, data });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, storeKey } = await request.json();
  if (!validateStoreKey(storeKey)) {
    return NextResponse.json({ success: false, error: 'Invalid store scope' }, { status: 403 });
  }
  const safeProductId = String(productId || '').trim();
  if (!safeProductId || !mongoose.Types.ObjectId.isValid(safeProductId)) {
    return NextResponse.json({ success: false, error: 'Product is required' }, { status: 400 });
  }

  await mongooseConnect();
  const user = await upsertWishlistUser(session.user.email);
  await Wishlist.deleteOne(withStoreScope({ userId: user._id, productId: safeProductId }));

  const data = await getWishlistPayload(session.user.email);
  return NextResponse.json({ success: true, data });
}
