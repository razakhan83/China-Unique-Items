import { Suspense } from 'react';

import CheckoutPageSkeleton from '@/components/CheckoutPageSkeleton';
import { getStoreSettings } from '@/lib/data';
import { getStoreConfig } from '@/lib/store-config';

import CheckoutClient from './CheckoutClient';

const store = getStoreConfig();

export const metadata = {
  title: 'Checkout',
  description: `Complete your order at ${store.name}.`,
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}

async function CheckoutContent() {
  const settings = await getStoreSettings();
  return <CheckoutClient settings={settings} />;
}
