'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';
import { cn } from '@/lib/utils';

export default function MyOrdersButton({ className, isMobile = false }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleClick = () => {
    if (session) {
      router.push('/orders');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors bg-muted/60 text-foreground hover:bg-muted w-full',
            className
          )}
        >
          <ClipboardList className="size-4" />
          My Orders
        </button>
        <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleClick}
        className={cn('text-muted-foreground hover:bg-muted hover:text-foreground gap-2', className)}
      >
        <ClipboardList className="size-4" />
        My Orders
      </Button>
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
}
