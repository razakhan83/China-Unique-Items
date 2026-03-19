import { connection } from 'next/server';

import AdminLayoutShell from './AdminLayoutShell';

export default async function AdminLayout({ children }) {
  await connection();
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
