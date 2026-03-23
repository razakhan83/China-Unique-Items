'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { AtSign, ChevronRight, CreditCard, Globe2, MapPin, Store, Truck } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

function LayoutContent({ children, categories, settings }) {
    const year = new Date().getFullYear();

    return (
        <>
            <div className="flex min-h-screen flex-col bg-background">
                <Navbar categories={categories} />

                <main className="flex-grow">{children}</main>

                <footer className="mt-auto border-t border-border bg-primary pt-12 pb-6 text-primary-foreground">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div>
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-white/10">
                                        <Store className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{settings.storeName}</h3>
                                        <p className="text-sm text-primary-foreground/70">Curated kitchenware and home details</p>
                                    </div>
                                </div>
                                <p className="max-w-sm leading-relaxed text-primary-foreground/76">A premium destination for kitchenware, home decor, and lifestyle pieces chosen for everyday elegance.</p>
                                <div className="mt-5 flex gap-3">
                                    <a href="#" className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/14 hover:border-white/20 hover:text-white" aria-label="Facebook">
                                        <Globe2 className="size-4" />
                                    </a>
                                    <a href="#" className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/14 hover:border-white/20 hover:text-white" aria-label="Instagram">
                                        <AtSign className="size-4" />
                                    </a>
                                    <a href={`https://wa.me/${settings.whatsappNumber}`} className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/14 hover:border-white/20 hover:text-white" aria-label="WhatsApp">
                                        <WhatsAppIcon className="size-5" />
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">Quick Links</h3>
                                <ul className="flex flex-col gap-3 text-primary-foreground/78">
                                    {[
                                        { href: '/about-us', label: 'About Us' },
                                        { href: '/refund-policy', label: 'Refund Policy' },
                                        { href: '/privacy-policy', label: 'Privacy Policy' },
                                        { href: '/shipping-policy', label: 'Shipping Policy' },
                                    ].map((item) => (
                                        <li key={item.href}>
                                            <Link href={item.href} className="inline-flex items-center gap-2 transition-colors hover:text-primary-foreground">
                                                <ChevronRight className="size-4" />
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">Contact</h3>
                                <ul className="flex flex-col gap-4 text-primary-foreground/78">
                                    <li className="flex items-start gap-3">
                                        <WhatsAppIcon className="mt-1 size-4 shrink-0" />
                                        <div>
                                            <span className="block font-semibold text-primary-foreground">WhatsApp</span>
                                            <a href={`https://wa.me/${settings.whatsappNumber}`} className="transition-colors hover:text-primary-foreground">{settings.whatsappNumber}</a>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 size-4" />
                                        <div>
                                            <span className="block font-semibold text-primary-foreground">Location</span>
                                            <span>Karachi, Pakistan</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Truck className="mt-0.5 size-4" />
                                        <div>
                                            <span className="block font-semibold text-primary-foreground">Delivery</span>
                                            <span>Nationwide shipping and order support via WhatsApp</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-primary-foreground/60 md:flex-row">
                            <p>&copy; {year} China Unique Store. All rights reserved.</p>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                                    <CreditCard className="size-4" />
                                    Secure checkout
                                </span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            <FloatingWhatsApp whatsappNumber={settings.whatsappNumber} storeName={settings.storeName} />
            <CartDrawer />
        </>
    );
}

export default function LayoutWrapper(props) {
    return (
        <Suspense fallback={null}>
            <LayoutContent {...props} />
        </Suspense>
    );
}
