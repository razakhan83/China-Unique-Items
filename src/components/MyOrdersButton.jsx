'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import AuthModal from './AuthModal';
import { cn } from '@/lib/utils';

export default function MyOrdersButton({ className, isMobile = false }) {
  const { data: session } = useSession();
  const { setIsSidebarOpen } = useCart() || {};
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleClick = () => {
    if (session) {
      if (typeof setIsSidebarOpen === 'function') {
        setIsSidebarOpen(false);
      }
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
            'flex w-full items-center justify-start gap-3 rounded-xl bg-muted/60 px-3.5 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted',
            className
          )}
        >
          <ClipboardList className="size-4" />
          My Orders
        </button>
        <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} callbackUrl="/orders" />
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
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} callbackUrl="/orders" />
    </>
  );
}
