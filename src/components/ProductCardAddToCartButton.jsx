'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProductCardAddToCartButton({ product }) {
  const { addToCart } = useCart();
  const [didJustAdd, setDidJustAdd] = useState(false);

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={product.StockStatus === 'Out of Stock'}
      onClick={(event) => {
        event.preventDefault();
        addToCart(product);
        setDidJustAdd(true);
        window.setTimeout(() => setDidJustAdd(false), 650);
      }}
      className="add-to-cart-button size-10 cursor-pointer shadow-none md:hover:border-primary/30 md:hover:bg-primary/12 md:hover:text-primary md:hover:shadow-sm disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="relative inline-flex size-5 items-center justify-center">
        <ShoppingCart
          className={cn(
            'add-to-cart-icon absolute size-5',
            'is-visible',
            didJustAdd ? 'text-primary' : ''
          )}
        />
      </span>
    </Button>
  );
}
