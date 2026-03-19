'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function AddToCartBtn({ product, className }) {
    const { addToCart } = useCart();
    return (
        <Button
            onClick={() => addToCart(product)}
            className={`w-full ${className || ''}`}
        >
            <ShoppingCart data-icon="inline-start" />
            Add to Cart
        </Button>
    );
}
