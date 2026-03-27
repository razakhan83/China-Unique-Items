'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { startTransition, useMemo, useState, useEffect } from 'react';
import { Loader2, MapPin, ShieldCheck, Wallet, CheckCircle2, Copy, Check, Lock, ChevronsUpDown } from 'lucide-react';

import { submitOrderAction, getLastOrderDetailsAction } from '@/app/actions';
import AuthModal from '@/components/AuthModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';
import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';
import { getPrimaryProductImage } from '@/lib/productImages';
import { PAKISTAN_CITIES } from '@/lib/cities';
import { trackInitiateCheckoutEvent, trackPurchaseEvent } from '@/lib/clientTracking';
import { cn } from '@/lib/utils';

const formatPrice = (raw) => Number(raw || 0);
const formatPriceLabel = (raw) => `Rs. ${formatPrice(raw).toLocaleString('en-PK')}`;

export default function CheckoutClient({ settings }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, clearCart } = useCart();
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    landmark: '',
    instructions: '',
  });
  const [cityOpen, setCityOpen] = useState(false);
  const [orderPopupShown, setOrderPopupShown] = useState(false);

  // Robust Auto-fill & Sync Logic
  useEffect(() => {
    let isMounted = true;
    
    const syncData = async (isInitial = false) => {
      if (status !== 'authenticated' || !session?.user) return;
      
      try {
        const [settingsRes, lastOrder] = await Promise.all([
          fetch('/api/user/settings').then(res => res.ok ? res.json() : null),
          getLastOrderDetailsAction()
        ]);

        if (!isMounted) return;

        setFormData((prev) => {
          return {
            ...prev,
            fullName: prev.fullName || settingsRes?.name || session.user.name || '',
            email: settingsRes?.email || session.user.email || prev.email,
            phone: prev.phone || settingsRes?.phone || lastOrder?.phone || '',
            city: prev.city || settingsRes?.city || lastOrder?.city || '',
            address: prev.address || settingsRes?.address || lastOrder?.address || '',
            landmark: prev.landmark || settingsRes?.landmark || lastOrder?.landmark || '',
          };
        });
        
        if (isInitial) setHasAutoFilled(true);
      } catch (error) {
        console.error('Auto-fill sync error:', error);
      }
    };

    if (status === 'authenticated' && !hasAutoFilled) {
      syncData(true);
    }

    // Real-time Sync on Window Focus
    window.addEventListener('focus', () => syncData());
    return () => {
      isMounted = false;
      window.removeEventListener('focus', () => syncData());
    };
  }, [status, session, hasAutoFilled]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderState, setOrderState] = useState({ orderId: '', whatsappUrl: '' });
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasTrackedCheckoutView, setHasTrackedCheckoutView] = useState(false);

  // Copy to clipboard function
  const copyToClipboard = () => {
    if (orderState.orderId) {
      navigator.clipboard.writeText(orderState.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleModalClose = () => {
    // Mark popup as shown for this order
    if (orderState.orderId) {
      sessionStorage.setItem(`order-popup-shown-${orderState.orderId}`, 'true');
      setOrderPopupShown(true);
    }
    router.push('/');
  };

  const handleViewOrders = () => {
    if (session) {
      router.push('/orders');
    } else {
      setShowAuthModal(true);
    }
  };

  const subtotal = useMemo(
    () => cart.reduce((total, item) => {
      const itemPrice = item.discountedPrice != null ? item.discountedPrice : formatPrice(item.Price || item.price);
      return total + itemPrice * item.quantity;
    }, 0),
    [cart],
  );

  const isKarachi = formData.city === 'Karachi';
  const shippingBase = isKarachi
    ? Number(settings.karachiDeliveryFee || 0)
    : Number(settings.outsideKarachiDeliveryFee || 0);
  const isFreeShipping = subtotal >= Number(settings.freeShippingThreshold || 0);
  const shipping = isFreeShipping ? 0 : shippingBase;
  const total = subtotal + shipping;

  useEffect(() => {
    if (hasTrackedCheckoutView || cart.length === 0) return;
    trackInitiateCheckoutEvent({ cart, total });
    setHasTrackedCheckoutView(true);
  }, [cart, hasTrackedCheckoutView, total]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: '' }));
    }
  }

  function validateForm() {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = 'Full Name is required.';
    if (!formData.phone.trim()) nextErrors.phone = 'Phone Number is required.';
    if (!formData.city.trim()) nextErrors.city = 'City is required.';
    if (!formData.address.trim()) nextErrors.address = 'Complete Address is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handlePlaceOrder(event) {
    event.preventDefault();
    if (!validateForm() || cart.length === 0) return;

    setSubmitting(true);
    startTransition(async () => {
      try {
        const result = await submitOrderAction({
          customerEmail: formData.email,
          customerName: formData.fullName,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          customerCity: formData.city,
          customerAddressOnly: formData.address,
          landmark: formData.landmark,
          notes: formData.instructions,
          // Phase 13: Always update profile with latest checkout details
          updateProfile: true,
          totalAmount: total,
          whatsappNumber: settings.whatsappNumber,
          items: cart.map((item) => ({
            productId: item.id || item._id || item.slug,
            name: item.Name || item.name,
            price: item.discountedPrice != null ? item.discountedPrice : item.Price || item.price,
            quantity: item.quantity,
            image: getPrimaryProductImage(item)?.url || '',
          })),
        });

        trackPurchaseEvent({ orderId: result.orderId, cart, total });
        setOrderState(result);
        clearCart();
      } catch (error) {
        setErrors((previous) => ({
          ...previous,
          submit: error.message || 'Unable to place the order right now.',
        }));
      } finally {
        setSubmitting(false);
      }
    });
  }

  if (cart.length === 0 && !orderState.orderId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Empty className="surface-card w-full max-w-md rounded-xl border border-border py-8 shadow-sm">
          <EmptyHeader>
            <EmptyTitle className="text-2xl font-bold text-foreground">Your cart is empty</EmptyTitle>
            <EmptyDescription>
              Add a few products before heading to checkout.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => router.push('/products')}>
              Continue Shopping
            </Button>
          </EmptyContent>
        </Empty>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16 pt-8">
      {/* Success Modal */}
      <Dialog open={!!orderState.orderId && !orderPopupShown} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="sm:max-w-md text-center p-8" hideClose>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-success/10 text-success">
            <CheckCircle2 className="size-10" />
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Thank You for Your Order!</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground pt-2">
              Your order will be delivered within 2 to 3 working days.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Order ID</span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg font-bold text-foreground font-mono">{orderState.orderId}</span>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="text-success" /> : <Copy />}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <Button size="lg" className="w-full font-semibold" onClick={handleViewOrders}>
                View My Orders
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={handleModalClose}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} callbackUrl="/orders" />

      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">Secure Checkout</h1>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="size-5 text-primary" />
                  Shipping Information
                </CardTitle>
                <CardDescription>
                  Enter your contact details and delivery address for this order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <FieldGroup>
                    <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="email" className="flex items-center gap-2">
                        Email Address
                        {session?.user && <Lock className="size-3 text-muted-foreground/60" title="Locked to your account" />}
                        </FieldLabel>
                        <Input 
                          id="email" 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          placeholder="you@example.com"
                          readOnly={!!session?.user}
                          className={session?.user ? "bg-muted/30 cursor-not-allowed" : ""}
                        />
                      </Field>
                      <Field data-invalid={errors.phone ? 'true' : undefined}>
                        <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
                        <Input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. 0300 1234567" aria-invalid={Boolean(errors.phone)} />
                        <FieldError>{errors.phone}</FieldError>
                      </Field>
                    </FieldGroup>

                    <Separator />

                    <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field data-invalid={errors.fullName ? 'true' : undefined}>
                        <FieldLabel htmlFor="fullName">Full Name *</FieldLabel>
                        <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} aria-invalid={Boolean(errors.fullName)} />
                        <FieldError>{errors.fullName}</FieldError>
                      </Field>
                      <Field data-invalid={errors.city ? 'true' : undefined}>
                        <FieldLabel htmlFor="city">City *</FieldLabel>
                      <Popover open={cityOpen} onOpenChange={setCityOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={cityOpen}
                            aria-invalid={Boolean(errors.city)}
                            className={cn(
                              "h-11 w-full justify-between rounded-xl border px-3.5 text-sm font-normal transition-[border-color,background-color,box-shadow,color] duration-200",
                              "border-[color:color-mix(in_oklab,var(--color-border)_82%,white)] bg-[color:color-mix(in_oklab,var(--color-input)_88%,white)] text-foreground",
                              "hover:border-[color:color-mix(in_oklab,var(--color-primary)_16%,var(--color-border))] hover:bg-[color:color-mix(in_oklab,var(--color-input)_94%,white)]",
                              "focus-visible:border-[color:color-mix(in_oklab,var(--color-primary)_34%,var(--color-border))] focus-visible:bg-[color:color-mix(in_oklab,var(--color-input)_96%,white)] focus-visible:ring-4 focus-visible:ring-[color:color-mix(in_oklab,var(--color-primary)_14%,transparent)] focus-visible:shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_18%,transparent),0_10px_24px_-18px_color-mix(in_oklab,var(--color-primary)_45%,transparent)]",
                              !formData.city && "text-muted-foreground",
                              errors.city && "border-destructive bg-[color:color-mix(in_oklab,var(--color-destructive)_6%,white)] ring-4 ring-[color:color-mix(in_oklab,var(--color-destructive)_16%,transparent)]"
                            )}
                          >
                            {formData.city || "Select City"}
                            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] rounded-xl border border-[color:color-mix(in_oklab,var(--color-border)_82%,white)] bg-[color:color-mix(in_oklab,var(--color-popover)_96%,white)] p-0"
                          align="start"
                          sideOffset={8}
                        >
                          <Command className="rounded-xl! bg-transparent p-2">
                            <CommandInput placeholder="Search city..." className="text-sm" />
                            <CommandList className="max-h-60 overflow-y-auto pt-2">
                              <CommandEmpty>No city found.</CommandEmpty>
                              <CommandGroup className="flex flex-col gap-1.5 p-1">
                                {PAKISTAN_CITIES.map((city) => (
                                  <CommandItem
                                    key={city}
                                    value={city}
                                    className="justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold tracking-[-0.01em] text-foreground transition-[background-color,color] duration-200 data-selected:bg-[color:color-mix(in_oklab,var(--color-muted)_58%,white)]"
                                    onSelect={(currentValue) => {
                                      const exactCity = PAKISTAN_CITIES.find(c => c.toLowerCase() === currentValue.toLowerCase()) || currentValue;
                                      handleChange({ target: { name: 'city', value: exactCity === formData.city ? "" : exactCity } });
                                      setCityOpen(false);
                                    }}
                                  >
                                    <span className="truncate leading-5">{city}</span>
                                    <span
                                      className={cn(
                                        "inline-flex size-5 items-center justify-center rounded-full border transition-[opacity,transform,background-color,border-color,color] duration-200",
                                        formData.city === city
                                          ? "border-[color:color-mix(in_oklab,var(--color-primary)_20%,white)] bg-primary/10 text-primary opacity-100 scale-100"
                                          : "border-transparent bg-transparent text-transparent opacity-0 scale-75"
                                      )}
                                    >
                                      <Check className="size-3.5" />
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                        <FieldError>{errors.city}</FieldError>
                      </Field>
                    </FieldGroup>
                    <FieldGroup>
                      <Field data-invalid={errors.address ? 'true' : undefined}>
                        <FieldLabel htmlFor="address">Complete Address (Street/Area) *</FieldLabel>
                      <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="House, Street, Sector/Area" aria-invalid={Boolean(errors.address)} />
                        <FieldError>{errors.address}</FieldError>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="landmark">Nearest Landmark</FieldLabel>
                      <Input id="landmark" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="e.g. Near ABC School" />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="instructions">Special Notes</FieldLabel>
                        <FieldContent>
                          <Textarea id="instructions" name="instructions" value={formData.instructions} onChange={handleChange} rows={3} />
                          <FieldDescription>
                            Optional delivery notes, landmarks, or timing preferences.
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </FieldGroup>

                  {errors.submit ? (
                    <Alert variant="destructive">
                      <AlertTitle>Unable to place order</AlertTitle>
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  ) : null}

                  <button type="submit" id="checkout-submit" className="hidden" />
                </form>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wallet className="size-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Wallet className="text-primary" />
                  <AlertTitle>Cash on Delivery</AlertTitle>
                  <AlertDescription>Pay with cash upon delivery.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="surface-panel sticky top-24 border-border/70">
              <CardHeader className="mb-2">
                <CardTitle className="flex items-center justify-between text-xl">
                <span>Order Summary</span>
                <span className="rounded-lg border border-border bg-background px-3 py-1 text-sm font-medium text-muted-foreground">
                  {cart.length} Items
                </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
              <div className="mb-6 max-h-[320px] space-y-4 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-4">
                    <div className="relative size-16 overflow-hidden rounded-lg border border-border bg-muted">
                      {getPrimaryProductImage(item)?.url ? (
                        <Image
                          src={getPrimaryProductImage(item).url}
                          alt={item.Name || item.name}
                          fill
                          className="object-cover"
                          {...getBlurPlaceholderProps(getPrimaryProductImage(item).blurDataURL)}
                        />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <h4 className="line-clamp-2 text-sm font-semibold text-foreground">{item.Name || item.name}</h4>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="text-sm font-semibold text-primary">{formatPriceLabel(item.discountedPrice != null ? item.discountedPrice : item.Price || item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">Rs. {subtotal.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping Estimate</span>
                  <span className="font-semibold text-foreground">
                    {isFreeShipping ? 'FREE' : `Rs. ${shipping.toLocaleString('en-PK')}`}
                  </span>
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="mb-8 flex items-center justify-between text-xl font-bold text-foreground">
                <span>Total</span>
                <span>Rs. {total.toLocaleString('en-PK')}</span>
              </div>

              <Button className="w-full" size="lg" onClick={() => document.getElementById('checkout-submit')?.click()} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
                {submitting ? 'Placing Order...' : 'Complete Order'}
              </Button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Securing your order with server-side confirmation
              </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
