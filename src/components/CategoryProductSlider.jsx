'use client';

import { useCallback, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
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
            <div className="home-section-item mb-6 flex items-center justify-between gap-4 px-4 md:items-end">
                <h2 className="min-w-0 flex-1 text-2xl font-bold tracking-tight text-primary [text-wrap:balance] md:text-3xl">
                    {HeaderIcon ? <HeaderIcon className="mr-2 inline-flex size-6 align-[-0.15em]" /> : null}
                    {categoryLabel}
                </h2>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        onClick={scrollPrev}
                        className="flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary shadow-[0_10px_30px_rgba(10,61,46,0.08)] transition-[transform,background-color,color,box-shadow] duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_14px_34px_rgba(10,61,46,0.14)] active:scale-[0.96]"
                        aria-label="Previous products"
                    >
                        <ChevronLeft className="size-5" />
                    </button>

                    <button
                        onClick={scrollNext}
                        className="flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary shadow-[0_10px_30px_rgba(10,61,46,0.08)] transition-[transform,background-color,color,box-shadow] duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_14px_34px_rgba(10,61,46,0.14)] active:scale-[0.96]"
                        aria-label="Next products"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                </div>
            </div>

            <div className="home-section-item mx-auto w-full px-4">
                <Swiper
                    {...SHARED_SWIPER_PROPS}
                    modules={[FreeMode]}
                    breakpoints={CATEGORY_PRODUCT_BREAKPOINTS}
                    freeMode
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    className="-my-4"
                >
                    {categoryProducts.map((p, idx) => (
                        <SwiperSlide
                            key={`${p.slug || p._id || p.id || 'item'}-${idx}`}
                            className="!h-auto py-4"
                        >
                            <div className="h-full min-w-0">
                                <ProductCard product={p} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {onViewAll && (
                <div className="home-section-item mt-6 flex justify-center px-4">
                    <Button
                        variant="ghost"
                        onClick={() => onViewAll(categoryId)}
                        className="h-10 rounded-lg border border-primary/15 bg-background/80 px-5 text-sm font-semibold text-primary shadow-[0_12px_30px_rgba(10,61,46,0.08)] transition-[transform,background-color,color,box-shadow] duration-300 md:backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:shadow-[0_16px_36px_rgba(10,61,46,0.14)] active:scale-[0.96] cursor-pointer"
                    >
                        View All
                        <ArrowRight className="ml-1 size-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
