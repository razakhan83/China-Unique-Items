import { connection } from 'next/server';

import { requireAdmin } from '@/lib/requireAdmin';

import AdminCategoriesClient from './AdminCategoriesClient';

export default async function AdminCategoriesPage() {
  await connection();
  await requireAdmin();

  return <AdminCategoriesClient />;
}
