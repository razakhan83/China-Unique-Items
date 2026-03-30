import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const uri = process.env.MONGODB_URI;
const storeKey = String(process.env.NEXT_PUBLIC_STORE_KEY || '').trim();

if (!uri) {
  throw new Error('MONGODB_URI is required.');
}

if (!storeKey) {
  throw new Error('NEXT_PUBLIC_STORE_KEY is required.');
}

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const orderSchema = new mongoose.Schema({}, { strict: false, collection: 'orders' });

const Product = mongoose.models.BackfillProduct || mongoose.model('BackfillProduct', productSchema);
const Order = mongoose.models.BackfillOrder || mongoose.model('BackfillOrder', orderSchema);

async function main() {
  await mongoose.connect(uri);

  const [productsResult, ordersResult] = await Promise.all([
    Product.updateMany(
      { $or: [{ storeKey: { $exists: false } }, { storeKey: '' }, { storeKey: null }] },
      { $set: { storeKey } },
    ),
    Order.updateMany(
      { $or: [{ storeKey: { $exists: false } }, { storeKey: '' }, { storeKey: null }] },
      { $set: { storeKey } },
    ),
  ]);

  console.log(
    JSON.stringify(
      {
        storeKey,
        productsMatched: productsResult.matchedCount,
        productsModified: productsResult.modifiedCount,
        ordersMatched: ordersResult.matchedCount,
        ordersModified: ordersResult.modifiedCount,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
