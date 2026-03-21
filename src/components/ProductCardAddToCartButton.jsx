'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export default function ProductCardAddToCartButton({ product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [didJustAdd, setDidJustAdd] = useState(false);

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={product.StockStatus === 'Out of Stock' || isAdding}
      onClick={async (event) => {
        event.preventDefault();
        setIsAdding(true);
        const startedAt = performance.now();

        try {
          await addToCart(product);
          setDidJustAdd(true);

          const elapsed = performance.now() - startedAt;
          const remaining = Math.max(140 - elapsed, 0);

          if (remaining > 0) {
            await new Promise((resolve) => window.setTimeout(resolve, remaining));
          }
        } finally {
          setIsAdding(false);
          window.setTimeout(() => setDidJustAdd(false), 650);
        }
      }}
      className="add-to-cart-button size-10 cursor-pointer shadow-none md:hover:border-primary/30 md:hover:bg-primary/12 md:hover:text-primary md:hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="relative inline-flex size-5 items-center justify-center">
        <Spinner
          className={cn(
            'add-to-cart-icon absolute size-5 text-muted-foreground',
            isAdding ? 'is-visible' : ''
          )}
        />
        <ShoppingCart
          className={cn(
            'add-to-cart-icon absolute size-5',
            !isAdding ? 'is-visible' : '',
            didJustAdd ? 'text-primary' : ''
          )}
        />
      </span>
    </Button>
  );
}
