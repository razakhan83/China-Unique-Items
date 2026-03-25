'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, Truck, ArrowRight } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
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
import { buildCartWhatsAppMessage, createWhatsAppUrl } from '@/lib/whatsapp';

const formatPrice = (raw) => {
  const clean = String(raw).replace(/[^\d.]/g, '');
  return clean ? Number(clean) : 0;
};

const formatPriceLabel = (raw) => `Rs. ${formatPrice(raw).toLocaleString('en-PK')}`;

export default function CartDrawer({ whatsappNumber = '', storeName = 'China Unique Store' }) {
  const { cart, updateQuantity, removeFromCart, isCartOpen, setIsCartOpen } = useCart();
  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.discountedPrice != null ? item.discountedPrice : formatPrice(item.Price || item.price);
    return total + itemPrice * item.quantity;
  }, 0);

  function handleWhatsAppDirectCheckout() {
    if (!cart.length) return;
    const message = buildCartWhatsAppMessage({ items: cart, subtotal, storeName });
    const whatsappUrl = createWhatsAppUrl(whatsappNumber, message);
    if (!whatsappUrl) return;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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
                  <Card
                    key={item.id || item.slug || item._id || item.Name || item.name || index}
                    className="transition-[background-color,border-color] duration-200 hover:bg-[color:color-mix(in_oklab,var(--color-card)_96%,white)]"
                  >
                    <CardContent className="p-3">
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeFromCart(item)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <Trash2 />
                          </Button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-border bg-background">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                updateQuantity(item, item.quantity - 1);
                              }}
                              className="rounded-r-none text-muted-foreground hover:text-foreground"
                            >
                              <Minus />
                            </Button>
                            <span className="inline-flex min-w-10 items-center justify-center text-sm font-semibold">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              className="rounded-l-none text-muted-foreground hover:text-foreground"
                            >
                              <Plus />
                            </Button>
                          </div>
                          <span className="hidden text-sm text-muted-foreground sm:inline-flex">Ready to ship</span>
                        </div>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </>
            ) : (
              <Empty className="surface-card min-h-[16rem] rounded-xl px-6 py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-16 rounded-xl bg-primary/10 text-primary">
                    <ShoppingBag className="size-7" />
                  </EmptyMedia>
                  <EmptyTitle className="text-lg font-semibold text-foreground">Your cart is empty</EmptyTitle>
                  <EmptyDescription className="max-w-xs">
                    Start adding premium kitchenware and decor to build your order.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
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
