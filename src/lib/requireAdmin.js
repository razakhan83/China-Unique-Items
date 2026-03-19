import 'server-only';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { isAdminEmail } from '@/lib/admin';
import { authOptions } from '@/lib/auth';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || !isAdminEmail(session.user?.email)) {
    redirect('/admin/login');
  }

  return session;
}
