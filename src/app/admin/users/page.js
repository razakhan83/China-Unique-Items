import { requireAdmin } from '@/lib/requireAdmin';
import { getAdminUsersPage } from '@/lib/data';
import AdminUsersClient from './AdminUsersClient';

export const metadata = {
  title: 'User Management | Admin',
};

export default async function AdminUsersPage({ searchParams }) {
  await requireAdmin();

  const params = await searchParams;
  const search = String(params?.search || '').trim();
  const status = String(params?.status || 'all').trim() || 'all';
  const page = Math.max(1, Number(params?.page) || 1);
  const result = await getAdminUsersPage({ search, status, page, limit: 12 });

  return (
    <AdminUsersClient
      initialUsers={result.items}
      total={result.total}
      totalPages={result.totalPages}
      currentPage={result.page}
      initialSearchQuery={result.searchTerm}
      initialStatusFilter={result.status}
      summary={result.summary}
    />
  );
}
