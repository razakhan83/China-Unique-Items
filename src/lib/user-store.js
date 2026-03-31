import { getStoreKey } from '@/lib/store-scope';

export function getCurrentStoreUserFilter(email, { includeLegacy = false } = {}) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const storeKey = getStoreKey();

  if (!includeLegacy) {
    return { email: normalizedEmail, storeKey };
  }

  return {
    email: normalizedEmail,
    $or: [
      { storeKey },
      { storeKey: { $exists: false } },
      { storeKey: null },
      { storeKey: '' },
    ],
  };
}
