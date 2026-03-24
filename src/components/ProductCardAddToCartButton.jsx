'use client';

import { ShoppingCart } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function ProductCardAddToCartButton({ product }) {
  const { addToCart } = useCart();
  const isOutOfStock = product.StockStatus === 'Out of Stock';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isOutOfStock}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(product);
      }}
      className="add-to-cart-button relative size-8 cursor-pointer touch-manipulation rounded-md bg-transparent p-0 text-primary shadow-none transition-[transform,background-color,color] duration-200 ease-out hover:bg-primary/10 hover:text-primary active:scale-[0.96] active:bg-primary/10 active:text-primary disabled:pointer-events-none disabled:opacity-50 after:absolute after:-inset-2 after:content-['']"
      aria-label="Add to cart"
    >
      <ShoppingCart className="size-[1.125rem] text-primary" />
    </Button>
  );
}
