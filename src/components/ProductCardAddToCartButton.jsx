'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import { useCartActions } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export default function ProductCardAddToCartButton({ product, isOutOfStock = false }) {
  const { addToCart } = useCartActions();
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
      await addToCart(product);
    } finally {
      setIsAdding(false);
    }
  }

  if (isOutOfStock) {
    return (
      <span className="inline-flex min-h-8 items-center justify-center rounded-md border border-border bg-muted/35 px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Out of Stock
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isAdding}
      onClick={handleAddToCart}
      className="add-to-cart-button relative size-8 cursor-pointer touch-manipulation rounded-md bg-transparent p-0 text-primary shadow-none transition-[transform,background-color,color] duration-200 ease-out hover:bg-primary/10 hover:text-primary active:scale-[0.96] active:bg-primary/10 active:text-primary disabled:pointer-events-none disabled:opacity-50 after:absolute after:-inset-2 after:content-['']"
      aria-label="Add to cart"
    >
      <span className="relative inline-flex size-[1.125rem] items-center justify-center">
        <Spinner
          className={cn(
            "add-to-cart-icon absolute size-[1.125rem]",
            isAdding ? "is-visible" : ""
          )}
        />
        <ShoppingCart
          className={cn(
            "add-to-cart-icon absolute size-[1.125rem] text-primary",
            !isAdding ? "is-visible" : ""
          )}
        />
      </span>
    </Button>
  );
}
