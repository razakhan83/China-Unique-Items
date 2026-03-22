// @ts-nocheck
import { getAdminSettings } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';

import AdminSettingsClient from './AdminSettingsClient';

export default async function AdminSettingsPage() {
  await requireAdmin();

  const session = await getServerSession(authOptions);
  let isProAdmin = false;
  if (session?.user?.email) {
    isProAdmin = isAdminEmail(session.user.email);
  }

  return <SettingsContent isProAdmin={isProAdmin} />;
}

async function SettingsContent({ isProAdmin }) {
  const settings = await getAdminSettings();
  return <AdminSettingsClient initialSettings={settings} isProAdmin={isProAdmin} />;
}

