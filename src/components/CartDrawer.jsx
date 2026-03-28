'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

import { useCartActions, useCartItems, useCartUi } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
const EXIT_ANIMATION_MS = 180;

export default function CartDrawer({ whatsappNumber = '', storeName = 'China Unique Store' }) {
  const { cart } = useCartItems();
  const { isCartOpen } = useCartUi();
  const { updateQuantity, removeFromCart, clearCart, setIsCartOpen } = useCartActions();
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [exitingItems, setExitingItems] = useState({});
  const removeTimersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(removeTimersRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.discountedPrice != null ? item.discountedPrice : formatPrice(item.Price || item.price);
    return total + itemPrice * item.quantity;
  }, 0);

  function continueShopping() {
    setIsCartOpen(false);
  }

  function scheduleRemove(item) {
    const itemId = item.id;
    if (!itemId || exitingItems[itemId]) return;

    setExitingItems((current) => ({ ...current, [itemId]: true }));
    removeTimersRef.current[itemId] = setTimeout(() => {
      removeFromCart(item);
      setExitingItems((current) => {
        const next = { ...current };
        delete next[itemId];
        return next;
      });
      delete removeTimersRef.current[itemId];
    }, EXIT_ANIMATION_MS);
  }

  function handleClearCart() {
    Object.values(removeTimersRef.current).forEach((timeoutId) => clearTimeout(timeoutId));
    removeTimersRef.current = {};
    setExitingItems({});
    clearCart();
    setIsClearDialogOpen(false);
  }

  function handleWhatsAppDirectCheckout() {
    if (!cart.length) return;
    const message = buildCartWhatsAppMessage({ items: cart, subtotal, storeName });
    const whatsappUrl = createWhatsAppUrl(whatsappNumber, message);
    if (!whatsappUrl) return;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent side="right" className="w-screen min-w-0 max-w-none gap-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_97%,white),color-mix(in_oklab,var(--color-muted)_38%,white))] p-0 sm:max-w-none md:w-[min(70vw,28rem)] md:min-w-[18rem] md:max-w-[28rem]">
        <SheetHeader className="border-b border-border/70 px-5 pb-3 pt-5">
          <SheetTitle className="[text-wrap:balance]">Your Cart</SheetTitle>
          <SheetDescription className="[text-wrap:pretty]">
            {cart.length ? `${cart.length} item${cart.length > 1 ? 's' : ''} ready for checkout.` : 'Add products to start your order.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-4 py-3 md:px-5 md:py-4">
          <div className="flex flex-col gap-2">
            {cart.length ? (
              <>
                <div className="flex items-center justify-between gap-3 px-1 py-0.5">
                  <p className="text-sm font-semibold text-foreground">Cart items</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-md px-2 text-xs font-medium text-muted-foreground transition-[transform,color,background-color] duration-150 hover:bg-muted hover:text-destructive active:scale-[0.96]"
                    onClick={() => setIsClearDialogOpen(true)}
                  >
                    Clear All
                  </Button>
                </div>
                {cart.map((item, index) => {
                  const primaryImage = getPrimaryProductImage(item);
                  const primaryImageSrc = primaryImage?.url
                    ? optimizeCloudinaryUrl(primaryImage.url, CLOUDINARY_IMAGE_PRESETS.cartItem)
                    : '';
                  const isExiting = Boolean(exitingItems[item.id]);

                  return (
                    <div
                      key={item.id || item.slug || item._id || item.Name || item.name || index}
                      className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${
                        isExiting ? 'pointer-events-none opacity-0 [grid-template-rows:0fr] mb-0' : 'opacity-100 [grid-template-rows:1fr] mb-0'
                      }`}
                    >
                      <div className="min-h-0">
                        <Card
                          className={`border-[color:color-mix(in_oklab,var(--color-border)_82%,white)] bg-[color:color-mix(in_oklab,var(--color-card)_92%,white)] shadow-[0_1px_0_color-mix(in_oklab,white_72%,transparent),0_20px_32px_-34px_color-mix(in_oklab,black_24%,transparent)] will-change-transform transition-[transform,opacity,background-color,border-color,box-shadow] duration-180 ease-out hover:bg-[color:color-mix(in_oklab,var(--color-card)_96%,white)] ${
                            isExiting ? 'translate-x-6 opacity-0' : 'translate-x-0 opacity-100'
                          }`}
                        >
                          <CardContent className="p-2">
                          <div className="flex gap-2">
                            <div className="relative size-[3.6rem] overflow-hidden rounded-[0.95rem] bg-muted shadow-[inset_0_0_0_1px_color-mix(in_oklab,black_6%,white),0_14px_24px_-22px_color-mix(in_oklab,black_32%,transparent)] md:size-16">
                              {primaryImageSrc ? (
                                <Image
                                  src={primaryImageSrc}
                                  alt={item.Name || item.name || 'product'}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                  {...getBlurPlaceholderProps(primaryImage?.blurDataURL)}
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="line-clamp-2 text-[0.9rem] font-semibold leading-[1.2rem] text-foreground [text-wrap:pretty]">{item.Name || item.name}</p>
                                  <p className="mt-0.5 text-sm font-medium text-primary tabular-nums">{formatPriceLabel(item.discountedPrice != null ? item.discountedPrice : item.Price || item.price)}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => scheduleRemove(item)}
                                  className="-mr-1 text-muted-foreground transition-[transform,color,background-color] duration-150 hover:text-destructive active:scale-[0.96]"
                                  aria-label="Remove item"
                                  disabled={isExiting}
                                >
                                  <Trash2 />
                                </Button>
                              </div>

                              <div className="mt-2 flex items-center justify-between">
                                <div className="inline-flex items-center rounded-full border border-border/80 bg-background/90 p-0.5 shadow-[inset_0_1px_0_color-mix(in_oklab,white_70%,transparent)]">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => {
                                      updateQuantity(item, item.quantity - 1);
                                    }}
                                    className="rounded-full text-muted-foreground hover:text-foreground active:scale-[0.96]"
                                    disabled={isExiting}
                                  >
                                    <Minus />
                                  </Button>
                                  <span className="inline-flex min-w-8 items-center justify-center px-2 text-sm font-semibold tabular-nums">{item.quantity}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => updateQuantity(item, item.quantity + 1)}
                                    className="rounded-full text-muted-foreground hover:text-foreground active:scale-[0.96]"
                                    disabled={isExiting}
                                  >
                                    <Plus />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <Empty className="surface-card min-h-[16rem] rounded-[1.35rem] px-6 py-12 shadow-[0_24px_44px_-38px_color-mix(in_oklab,var(--color-primary)_26%,transparent)]">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-16 rounded-[1.1rem] bg-primary/10 text-primary shadow-[0_16px_28px_-24px_color-mix(in_oklab,var(--color-primary)_42%,transparent)]">
                    <ShoppingBag className="size-7" />
                  </EmptyMedia>
                  <EmptyTitle className="text-lg font-semibold text-foreground [text-wrap:balance]">Your cart is empty</EmptyTitle>
                  <EmptyDescription className="max-w-xs [text-wrap:pretty]">
                    Start adding premium kitchenware and decor to build your order.
                  </EmptyDescription>
                </EmptyHeader>
                <div className="mt-6 flex justify-center">
                  <Link href="/products" onClick={continueShopping}>
                    <Button className="min-h-11 rounded-xl px-5 active:scale-[0.96]">Continue Shopping</Button>
                  </Link>
                </div>
              </Empty>
            )}
          </div>
        </ScrollArea>

        {cart.length ? (
          <SheetFooter className="gap-3 border-t border-border/70 bg-card/95 px-5 pb-5 pt-4">
            <div className="flex items-center justify-between rounded-[1.1rem] border border-border/70 bg-muted/30 px-4 py-3 shadow-[inset_0_1px_0_color-mix(in_oklab,white_72%,transparent)]">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subtotal</p>
                <p className="mt-1 text-sm text-muted-foreground [text-wrap:pretty]">Final charges appear at checkout.</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-foreground tabular-nums">
                  Rs. {subtotal.toLocaleString('en-PK')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl border-[color:color-mix(in_oklab,var(--color-primary)_16%,var(--color-border))] bg-[color:color-mix(in_oklab,var(--color-input)_92%,white)] text-foreground shadow-[0_1px_0_color-mix(in_oklab,var(--color-background)_65%,white)] transition-[transform,border-color,background-color,box-shadow,color] duration-200 hover:bg-[color:color-mix(in_oklab,var(--color-muted)_74%,white)] hover:text-foreground active:scale-[0.96]"
              onClick={handleWhatsAppDirectCheckout}
            >
              <WhatsAppIcon className="size-5" />
              Order on WhatsApp
            </Button>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full">
              <Button className="h-11 w-full rounded-xl active:scale-[0.96]">
                Checkout
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Link>
          </SheetFooter>
        ) : null}
      </SheetContent>
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove every item from your cart immediately. You can keep shopping and add them again anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Items</AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
