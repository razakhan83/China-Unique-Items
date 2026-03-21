'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, Truck, ArrowRight } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CLOUDINARY_IMAGE_PRESETS, optimizeCloudinaryUrl } from '@/lib/cloudinaryImage';
import { getPrimaryProductImage } from '@/lib/productImages';
import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';

const formatPrice = (raw) => {
  const clean = String(raw).replace(/[^\d.]/g, '');
  return clean ? Number(clean) : 0;
};

const formatPriceLabel = (raw) => `Rs. ${formatPrice(raw).toLocaleString('en-PK')}`;

export default function CartDrawer() {
  const { cart, updateQuantity, removeFromCart, isCartOpen, setIsCartOpen } = useCart();
  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.discountedPrice != null ? item.discountedPrice : formatPrice(item.Price || item.price);
    return total + itemPrice * item.quantity;
  }, 0);

  function handleWhatsAppDirectCheckout() {
    if (!cart.length) return;
    let message = `*New Order from China Unique Store*\n\n`;
    message += `*Items*\n`;
    cart.forEach((item, index) => {
      const itemPrice = item.discountedPrice != null ? item.discountedPrice : formatPrice(item.Price || item.price);
      message += `${index + 1}. ${item.Name || item.name} - ${item.quantity} x Rs. ${formatPrice(itemPrice)}\n`;
    });
    message += `\n*Subtotal:* Rs. ${subtotal.toLocaleString('en-PK')}\n`;
    message += `Please confirm my order.`;
    window.open(`https://wa.me/923052622043?text=${encodeURIComponent(message)}`, '_blank');
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="w-[min(70vw,28rem)] min-w-[18rem] gap-0 bg-card p-0">
        <SheetHeader className="border-b border-border/70 px-5 pb-3 pt-5">
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>{cart.length ? `${cart.length} item${cart.length > 1 ? 's' : ''} ready for checkout.` : 'Add products to start your order.'}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-5 py-4">
          <div className="flex flex-col gap-3.5">
            {cart.length ? (
              <>
                {cart.map((item, index) => {
                  const primaryImage = getPrimaryProductImage(item);
                  const primaryImageSrc = primaryImage?.url
                    ? optimizeCloudinaryUrl(primaryImage.url, CLOUDINARY_IMAGE_PRESETS.cartItem)
                    : '';

                  return (
                  <div
                    key={item.id || item.slug || item._id || item.Name || item.name || index}
                    className="surface-card rounded-xl p-3 transition-[background-color,border-color] duration-200 hover:bg-[color:color-mix(in_oklab,var(--color-card)_96%,white)]"
                  >
                    <div className="flex gap-3">
                      <div className="relative size-20 overflow-hidden rounded-lg border border-border bg-muted">
                        {primaryImageSrc ? (
                          <Image
                            src={primaryImageSrc}
                            alt={item.Name || item.name || 'product'}
                            fill
                            sizes="80px"
                            className="object-cover"
                            {...getBlurPlaceholderProps(primaryImage?.blurDataURL)}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-foreground">{item.Name || item.name}</p>
                            <p className="mt-1 text-sm font-medium text-primary">{formatPriceLabel(item.discountedPrice != null ? item.discountedPrice : item.Price || item.price)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item)}
                            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-border bg-background">
                            <button
                              type="button"
                              onClick={() => {
                                updateQuantity(item, item.quantity - 1);
                              }}
                              className="inline-flex size-9 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="inline-flex min-w-10 items-center justify-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              className="inline-flex size-9 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                          <span className="hidden text-sm text-muted-foreground sm:inline-flex">Ready to ship</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </>
            ) : (
              <div className="surface-card flex min-h-[16rem] flex-col items-center justify-center rounded-xl px-6 py-12 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShoppingBag className="size-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">Start adding premium kitchenware and decor to build your order.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {cart.length ? (
          <SheetFooter className="gap-3 border-t border-border/70 bg-card px-5 pb-5 pt-4">
            <div className="surface-card rounded-xl p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">Rs. {subtotal.toLocaleString('en-PK')}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Truck className="size-4" />
                  Shipping
                </span>
                <span>Calculated at checkout</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span>Rs. {subtotal.toLocaleString('en-PK')}</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-11 w-full rounded-xl border-[color:color-mix(in_oklab,var(--color-primary)_16%,var(--color-border))] bg-[color:color-mix(in_oklab,var(--color-input)_92%,white)] text-foreground shadow-[0_1px_0_color-mix(in_oklab,var(--color-background)_65%,white)] transition-[border-color,background-color,box-shadow,color] duration-200 hover:bg-[color:color-mix(in_oklab,var(--color-muted)_74%,white)] hover:text-foreground"
              onClick={handleWhatsAppDirectCheckout}
            >
              <WhatsAppIcon className="size-5" />
              Order on WhatsApp
            </Button>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full">
              <Button className="h-11 w-full rounded-xl">
                Continue to Checkout
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
