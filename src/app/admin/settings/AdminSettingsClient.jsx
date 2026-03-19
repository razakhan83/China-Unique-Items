'use client';

import { useState } from 'react';
import { BellRing, Loader2, MessageCircle, Save, Store, Truck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function SettingSection({ icon: Icon, title, description, children }) {
  return (
    <section className="surface-card rounded-xl p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function AdminSettingsClient({ initialSettings }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(initialSettings);

  function handleChange(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to save settings');
      }

      setForm(data.data);
      setSaved(true);
      toast.success('Settings updated successfully.');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings', error);
      toast.error(error.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Store Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure store details, delivery rules, and customer communication.
        </p>
      </div>

      <div className="space-y-6">
        <SettingSection icon={Store} title="General Information">
          <div>
            <Label className="mb-1.5">Store Name</Label>
            <Input
              value={form.storeName}
              onChange={(event) => handleChange('storeName', event.target.value)}
              placeholder="China Unique Store"
            />
          </div>
          <div>
            <Label className="mb-1.5">Support Email</Label>
            <Input
              type="email"
              value={form.supportEmail}
              onChange={(event) => handleChange('supportEmail', event.target.value)}
              placeholder="support@chinauniquestore.com"
            />
          </div>
          <div>
            <Label className="mb-1.5">Business Address</Label>
            <Textarea
              value={form.businessAddress}
              onChange={(event) => handleChange('businessAddress', event.target.value)}
              placeholder="Shop #12, Block A, Gulshan..."
              rows={3}
            />
          </div>
        </SettingSection>

        <SettingSection
          icon={MessageCircle}
          title="WhatsApp Integration"
          description="Used by the floating contact button and checkout handoff."
        >
          <div>
            <Label className="mb-1.5">WhatsApp Number</Label>
            <Input
              value={form.whatsappNumber}
              onChange={(event) => handleChange('whatsappNumber', event.target.value)}
              placeholder="923001234567"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Format: country code + number without spaces.
            </p>
          </div>
        </SettingSection>


        <SettingSection icon={BellRing} title="Announcement Bar">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/35 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Show top banner</p>
              <p className="text-xs text-muted-foreground">
                Display a promotional banner across the storefront.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('announcementBarEnabled', !form.announcementBarEnabled)}
              className={`inline-flex min-w-24 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                form.announcementBarEnabled
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground'
              }`}
            >
              {form.announcementBarEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div>
            <Label className="mb-1.5">Banner Message</Label>
            <Input
              value={form.announcementBarText}
              onChange={(event) => handleChange('announcementBarText', event.target.value)}
              placeholder="Free delivery on orders above Rs. 3000!"
            />
          </div>
        </SettingSection>

        <div className="flex items-center gap-4 pb-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </Button>
          {saved ? (
            <span className="text-sm font-medium text-primary">Settings updated successfully.</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
