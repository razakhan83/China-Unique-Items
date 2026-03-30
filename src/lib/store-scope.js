import mongoose from 'mongoose';

import { getStoreConfig } from '@/lib/store-config';

function cloneFilter(filter = {}) {
  return filter && typeof filter === 'object' ? { ...filter } : {};
}

export function getStoreKey() {
  return getStoreConfig().key;
}

export function withStoreScope(filter = {}, field = 'storeKey') {
  return {
    ...cloneFilter(filter),
    [field]: getStoreKey(),
  };
}

export function withStoreScopeForCreate(input = {}, field = 'storeKey') {
  return {
    ...(input && typeof input === 'object' ? input : {}),
    [field]: getStoreKey(),
  };
}

export function withStoreScopedId(id, extraFilter = {}, field = 'storeKey') {
  if (!mongoose.Types.ObjectId.isValid(String(id || ''))) {
    return null;
  }

  return withStoreScope(
    {
      _id: String(id),
      ...cloneFilter(extraFilter),
    },
    field,
  );
}

export function withStoreScopedSlug(slug, extraFilter = {}, field = 'storeKey') {
  const safeSlug = String(slug || '').trim();
  if (!safeSlug) return null;

  return withStoreScope(
    {
      slug: safeSlug,
      ...cloneFilter(extraFilter),
    },
    field,
  );
}

export function isStoreDocument(document, field = 'storeKey') {
  return String(document?.[field] || '').trim() === getStoreKey();
}
