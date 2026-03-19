'use client';

import { useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { hasProductCategory } from '@/lib/productCategories';
import { ChevronLeft, ChevronRight, ArrowRight, Flame, Sparkles, Trophy, Tag } from 'lucide-react';
import { CATEGORY_PRODUCT_BREAKPOINTS, SHARED_SWIPER_PROPS } from '@/components/swiper/swiperConfig';

const ICON_MAP = {
    Flame: Flame,
    Sparkles: Sparkles,
    Trophy: Trophy,
    Tag: Tag,
};

export default function CategoryProductSlider({ categoryId, categoryLabel, products, onViewAll, skipFilter = false, iconName }) {
    const categoryProducts = skipFilter ? products : products.filter((product) => hasProductCategory(product, categoryId));

    const HeaderIcon = iconName ? ICON_MAP[iconName] : null;
    const swiperRef = useRef(null);

    const scrollPrev = useCallback(() => swiperRef.current?.slidePrev(), []);
    const scrollNext = useCallback(() => swiperRef.current?.slideNext(), []);

    if (categoryProducts.length === 0) return null;

    return (
        <div className="mx-auto mb-4 w-full">
            <div className="home-section-item mb-6 flex items-center justify-between px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
                    {HeaderIcon ? <HeaderIcon className="mr-2 inline-flex size-6 align-[-0.15em]" /> : null}
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

            <div className="home-section-item group/slider relative mx-auto w-full px-4">
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

                <Swiper
                    {...SHARED_SWIPER_PROPS}
                    breakpoints={CATEGORY_PRODUCT_BREAKPOINTS}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    className="-my-4"
                >
                    {categoryProducts.map((p, idx) => (
                        <SwiperSlide key={`${p.slug || p._id || p.id || 'item'}-${idx}`} className="!h-auto py-4">
                            <div className="h-full min-w-0">
                                <ProductCard product={p} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
