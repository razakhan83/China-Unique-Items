import { connection } from 'next/server';

import { getAdminSettings } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';

import AdminSettingsClient from './AdminSettingsClient';

export default async function AdminSettingsPage() {
  await connection();
  await requireAdmin();

  return <SettingsContent />;
}

async function SettingsContent() {
  const settings = await getAdminSettings();
  return <AdminSettingsClient initialSettings={settings} />;
}
