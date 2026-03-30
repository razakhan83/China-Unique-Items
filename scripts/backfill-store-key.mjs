import mongoose from 'mongoose';
import nextEnv from '@next/env';

const { loadEnvConfig } = nextEnv;

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

async function main() {
  await mongoose.connect(uri);

  const collections = await mongoose.connection.db
    .listCollections({}, { nameOnly: true })
    .toArray();

  const results = [];

  for (const { name } of collections) {
    if (!name || name.startsWith('system.')) continue;

    const result = await mongoose.connection.db.collection(name).updateMany(
      { $or: [{ storeKey: { $exists: false } }, { storeKey: '' }, { storeKey: null }] },
      { $set: { storeKey } },
    );

    results.push({
      collection: name,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  }

  console.log(
    JSON.stringify(
      {
        storeKey,
        collections: results,
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
