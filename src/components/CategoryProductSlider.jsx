'use client';

import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { hasProductCategory } from '@/lib/productCategories';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function CategoryProductSlider({ categoryId, categoryLabel, products, onViewAll, skipFilter = false }) {
    const categoryProducts = skipFilter ? products : products.filter((product) => hasProductCategory(product, categoryId));

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            slidesToScroll: 1,
            containScroll: 'trimSnaps',
            dragFree: false,
        }
    );

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (categoryProducts.length === 0) return null;

    return (
        <div className="mx-auto mb-4 w-full">
            <div className="mb-6 flex items-center justify-between px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
                    {categoryLabel}
                </h2>
                {onViewAll && (
                    <Button
                        variant="ghost"
                        onClick={() => onViewAll(categoryId)}
                        className="bg-primary/10 text-primary font-semibold hover:bg-primary/18 hover:text-primary text-sm cursor-pointer"
                    >
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>

            <div className="group/slider relative mx-auto w-full px-4">
                <button
                    onClick={scrollPrev}
                    className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground transition-all duration-300 md:left-0 md:-translate-x-1/2 md:opacity-0 md:group-hover/slider:translate-x-0 md:group-hover/slider:opacity-100 will-change-transform"
                    aria-label="Previous products"
                >
                    <ChevronLeft className="size-5" />
                </button>

                <button
                    onClick={scrollNext}
                    className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground transition-all duration-300 md:right-0 md:translate-x-1/2 md:opacity-0 md:group-hover/slider:translate-x-0 md:group-hover/slider:opacity-100 will-change-transform"
                    aria-label="Next products"
                >
                    <ChevronRight className="size-5" />
                </button>

                <div ref={emblaRef} className="overflow-hidden -my-4">
                    <div className="flex gap-4 py-4">
                        {categoryProducts.map((p, idx) => (
                            <div
                                key={`${p.slug || p._id || p.id || 'item'}-${idx}`}
                                className="min-w-0 flex-[0_0_calc(50%-0.5rem)] md:flex-[0_0_22vw] md:max-w-[280px]"
                            >
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
