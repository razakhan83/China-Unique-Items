'use client';

import { signIn } from 'next-auth/react';
import { LockKeyhole, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function SignInPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="surface-card w-full max-w-md rounded-xl p-8 text-center sm:p-10">
        <div className="mx-auto mb-6 flex size-18 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store className="size-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Access</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">Secure login for China Unique Store management.</p>

        <Button className="mt-8 w-full" size="lg" onClick={() => signIn('google', { callbackUrl: '/' })}>
          Continue with Google
        </Button>

        <div className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <LockKeyhole className="size-3.5" />
          Authorized personnel only
        </div>
      </div>
    </section>
  );
}
