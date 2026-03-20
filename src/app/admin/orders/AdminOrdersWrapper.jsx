'use client';

import dynamic from 'next/dynamic';

const AdminOrdersClient = dynamic(() => import('./AdminOrdersClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary text-primary"></div>
    </div>
  )
});

export default function AdminOrdersWrapper({ initialOrders }) {
  return <AdminOrdersClient initialOrders={initialOrders} />;
}
