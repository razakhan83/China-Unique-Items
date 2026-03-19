'use client';

import { useState, useTransition } from 'react';
import { Phone, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { linkOrdersAction } from '@/app/actions';
import { toast } from 'sonner';

export default function LinkOrdersForm() {
  const [phone, setPhone] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!phone.trim()) return;

    startTransition(async () => {
      try {
        const result = await linkOrdersAction(phone.trim());
        if (result.success) {
          setIsSuccess(true);
          toast.success(result.message);
          // Refresh the page to show new orders after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          toast.error(result.message || 'Could not find any orders with this phone number.');
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
      }
    });
  }

  if (isSuccess) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
        <CheckCircle2 className="size-5 shrink-0" />
        <p className="text-sm font-medium">Orders linked successfully! Refreshing...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LinkIcon className="size-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Missing an order?</h3>
          <p className="text-sm text-muted-foreground">Enter the phone number used in previous orders to link them to your account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="0300 1234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10 h-11"
            disabled={isPending}
            required
          />
        </div>
        <Button type="submit" className="h-11 px-6 min-w-[140px]" disabled={isPending || !phone.trim()}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Link Orders'}
        </Button>
      </form>
    </div>
  );
}
