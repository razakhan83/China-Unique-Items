import Link from 'next/link';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrderById } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';
import OrderDetailActions from './OrderDetailActions';

const statusVariant = {
  Pending: 'accent',
  Confirmed: 'primary',
  'In Process': 'secondary',
  Delivered: 'emerald',
  'Delivery Address Issue': 'destructive',
  Returned: 'outline',
};

export default async function AdminOrderDetailPage({ params }) {
  await connection();
  await requireAdmin();
  const { id } = await params;

  return <OrderDetailContent id={id} />;
}

async function OrderDetailContent({ id }) {
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Order {order.orderId}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Saved order details and customer delivery information.</p>
        </div>
        <Button variant="outline" render={<Link href="/admin/orders" />} nativeButton={false}>
          Back to Orders
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="surface-card rounded-xl p-5 lg:col-span-1">
          <h2 className="font-semibold text-foreground">Customer</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p><span className="font-medium text-foreground">Name:</span> {order.customerName}</p>
            <p><span className="font-medium text-foreground">Phone:</span> {order.customerPhone || 'Not provided'}</p>
            <p><span className="font-medium text-foreground">Address:</span> {order.customerAddress || 'Not provided'}</p>
            <p><span className="font-medium text-foreground">Status:</span> <Badge variant={statusVariant[order.status] || 'secondary'}>{order.status}</Badge></p>
            <p><span className="font-medium text-foreground">Total:</span> Rs. {order.totalAmount.toLocaleString('en-PK')}</p>
            {order.notes ? <p><span className="font-medium text-foreground">Notes:</span> {order.notes}</p> : null}
          </div>
        </section>

        <OrderDetailActions order={order} />

        <section className="surface-card rounded-xl p-5 lg:col-span-2">
          <h2 className="font-semibold text-foreground">Items</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((item, index) => (
                  <tr key={`${item.productId}-${index}`}>
                    <td className="px-4 py-4 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{item.quantity}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">Rs. {Number(item.price || 0).toLocaleString('en-PK')}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-primary">
                      Rs. {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('en-PK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
