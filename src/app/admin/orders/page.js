import { getOrdersList } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';
import AdminOrdersWrapper from './AdminOrdersWrapper';

export default async function AdminOrdersPage() {
  await requireAdmin();

  const orders = await getOrdersList();

  return <AdminOrdersWrapper initialOrders={orders} />;
}
