'use client';

import { Minus, Plus } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProductCardAddToCartButton({ product }) {
  const { addToCart, cart, updateQuantity } = useCart();
  const itemId = product?.slug || product?._id || product?.id || product?.productId || product?.Name || product?.name;
  const cartItem = cart.find((item) => item.id === itemId);
  const quantity = cartItem?.quantity || 0;
  const isOutOfStock = product.StockStatus === 'Out of Stock';

  if (quantity > 0) {
    return (
      <div className="inline-flex h-8 items-center rounded-md bg-transparent shadow-none">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            updateQuantity(product, quantity - 1);
          }}
          className="relative size-8 touch-manipulation rounded-md p-0 text-primary shadow-none transition-[transform,background-color,color] duration-200 ease-out hover:bg-primary/10 hover:text-primary active:scale-[0.96] active:bg-primary/10 active:text-primary after:absolute after:-inset-2 after:content-['']"
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </Button>
        <span className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-[13px] font-semibold leading-none tabular-nums text-foreground">
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isOutOfStock}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            updateQuantity(product, quantity + 1);
          }}
          className="relative size-8 touch-manipulation rounded-md p-0 text-primary shadow-none transition-[transform,background-color,color] duration-200 ease-out hover:bg-primary/10 hover:text-primary active:scale-[0.96] active:bg-primary/10 active:text-primary disabled:pointer-events-none disabled:opacity-50 after:absolute after:-inset-2 after:content-['']"
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    );
  }

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
      <Plus className={cn('size-4 text-primary')} />
    </Button>
  );
}
