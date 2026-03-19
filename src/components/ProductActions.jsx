'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Share2, Minus, Plus, Loader2 } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { toast } from 'sonner';

export default function ProductActions({ product }) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const handleAddToCart = async () => {
        setIsAdding(true);
        // Small delay to allow react to render the spinner
        await new Promise(resolve => setTimeout(resolve, 300));
        addToCart(product, quantity);
        setIsAdding(false);
    };

    const handleWhatsApp = () => {
        const name = product.Name || product.name || 'this product';
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const message = `Hi! I'm interested in *${name}*.\n${url}`;
        window.open(`https://wa.me/923052622043?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const title = product.Name || product.name || 'Check out this product!';
        
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch (err) {
                // User cancelled
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            } catch {
                toast.error('Failed to copy link.');
            }
        }
    };

    const isOutOfStock = product.StockStatus === "Out of Stock";

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">Quantity</span>
                <div className="inline-flex items-center overflow-hidden rounded-lg border border-border bg-background">
                    <button
                        onClick={decrement}
                        className="inline-flex size-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="size-4" />
                    </button>
                    <span className="inline-flex min-w-12 items-center justify-center text-sm font-semibold text-foreground">{quantity}</span>
                    <button
                        onClick={increment}
                        className="inline-flex size-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Increase quantity"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={handleAddToCart}
                    disabled={isAdding || isOutOfStock}
                    className="flex-1"
                    size="lg"
                >
                    {isAdding ? (
                        <Loader2 className="animate-spin" data-icon="inline-start" />
                    ) : (
                        <ShoppingCart data-icon="inline-start" />
                    )}
                    Add to Cart
                </Button>
                <Button
                    onClick={handleWhatsApp}
                    size="lg"
                    className="shrink-0 border-[#25D366] bg-[#25D366] text-white transition-colors duration-200 hover:bg-[#1ebe57]"
                >
                    <WhatsAppIcon className="size-5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                </Button>
                <Button
                    onClick={handleShare}
                    variant="outline"
                    className="shrink-0"
                    size="icon"
                >
                    <Share2 />
                </Button>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-2 border-t border-border bg-card/95 p-3 shadow-[0_-10px_40px_rgba(10,61,46,0.1)] md:hidden">
                <div className="inline-flex shrink-0 items-center overflow-hidden rounded-lg border border-border bg-background">
                    <button onClick={decrement} className="inline-flex size-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <Minus className="size-3.5" />
                    </button>
                    <span className="inline-flex min-w-8 items-center justify-center text-sm font-semibold text-foreground">{quantity}</span>
                    <button onClick={increment} className="inline-flex size-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <Plus className="size-3.5" />
                    </button>
                </div>
                <Button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex-1"
                >
                    {isAdding ? (
                        <Loader2 className="animate-spin" data-icon="inline-start" />
                    ) : (
                        <ShoppingCart data-icon="inline-start" />
                    )}
                    Add to Cart
                </Button>
                <Button
                    onClick={handleWhatsApp}
                    className="shrink-0 border-[#25D366] bg-[#25D366] text-white transition-colors duration-200 hover:bg-[#1ebe57]"
                >
                    <WhatsAppIcon className="size-5" />
                </Button>
            </div>
        </div>
    );
}

