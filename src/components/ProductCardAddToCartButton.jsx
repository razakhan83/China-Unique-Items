'use client';

import { Minus, Plus, ShoppingCart } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ProductCardAddToCartButton({ product }) {
  const { addToCart, cart, updateQuantity } = useCart();
  const itemId = product?.slug || product?._id || product?.id || product?.productId || product?.Name || product?.name;
  const cartItem = cart.find((item) => item.id === itemId);
  const quantity = cartItem?.quantity || 0;
  const isOutOfStock = product.StockStatus === 'Out of Stock';

  return (
    <div
      className={cn(
        'product-card-cart-switch relative h-8 overflow-visible',
        quantity > 0 ? 'w-[5.5rem]' : 'w-8'
      )}
      data-state={quantity > 0 ? 'quantity' : 'idle'}
    >
      <div
        className={cn(
          'product-card-cart-switch__panel absolute inset-0 flex items-center justify-center',
          quantity > 0 ? 'is-hidden' : 'is-visible'
        )}
      >
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
          <ShoppingCart className="size-4 text-primary" />
        </Button>
      </div>

      <div
        className={cn(
          'product-card-cart-switch__panel absolute inset-0 flex items-center justify-end gap-0.5',
          quantity > 0 ? 'is-visible' : 'is-hidden'
        )}
        aria-hidden={quantity === 0}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={quantity > 0 ? 0 : -1}
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
        <span className="inline-flex h-8 min-w-7 items-center justify-center px-0.5 text-[13px] font-semibold leading-none tabular-nums text-foreground">
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={quantity > 0 ? 0 : -1}
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
    </div>
  );
}
