'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { ImageIcon } from 'lucide-react';
import { normalizeProductImage } from '@/lib/productImages';
import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';
import { SHARED_SWIPER_PROPS } from '@/components/swiper/swiperConfig';

export default function ProductGallery({ images }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mainSwiper, setMainSwiper] = useState(null);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    if (!images || images.length === 0) {
        return (
            <div className="surface-card relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl text-muted-foreground">
                <ImageIcon className="size-16" />
            </div>
        );
    }

    const normalizedImages = images
        .map(normalizeProductImage)
        .filter(Boolean);

    const thumbnailSlidesPerView = Math.min(Math.max(normalizedImages.length, 2), 4);

    const handleThumbnailClick = (index) => {
        if (!mainSwiper || mainSwiper.destroyed) return;
        if (typeof mainSwiper.slideToLoop === 'function') {
            mainSwiper.slideToLoop(index);
        } else {
            mainSwiper.slideTo(index);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="surface-card relative aspect-square overflow-hidden rounded-xl">
                <Swiper
                    {...SHARED_SWIPER_PROPS}
                    onSwiper={setMainSwiper}
                    loop={normalizedImages.length > 1}
                    onSlideChange={(swiper) => {
                        const nextIndex = swiper.realIndex;
                        setSelectedIndex(nextIndex);
                        if (thumbsSwiper && !thumbsSwiper.destroyed) {
                            thumbsSwiper.slideTo(nextIndex);
                        }
                    }}
                    className="h-full touch-pan-y"
                >
                    {normalizedImages.map((image, index) => (
                        <SwiperSlide key={index} className="!h-full">
                            <div className="relative h-full min-h-0 w-full">
                            <Image
                                src={image.url}
                                alt={`Product Image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105"
                                {...getBlurPlaceholderProps(image.blurDataURL)}
                                preload={index === 0}
                            />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {normalizedImages.length > 1 && (
                <Swiper
                    {...SHARED_SWIPER_PROPS}
                    modules={[FreeMode]}
                    slidesPerView={thumbnailSlidesPerView}
                    spaceBetween={12}
                    freeMode
                    watchSlidesProgress
                    onSwiper={setThumbsSwiper}
                    className="w-full overflow-hidden"
                >
                    {normalizedImages.map((image, index) => (
                        <SwiperSlide key={index}>
                            <button
                                type="button"
                                onClick={() => handleThumbnailClick(index)}
                                aria-label={`Show product image ${index + 1}`}
                                aria-pressed={index === selectedIndex}
                                className={`relative block aspect-square w-full min-w-0 cursor-pointer overflow-hidden rounded-lg border transition-all duration-300 ease-out ${
                                    index === selectedIndex ? 'border-primary shadow-sm opacity-100' : 'border-border opacity-60 hover:scale-[1.02] hover:opacity-100'
                                }`}
                            >
                                <div className="absolute inset-0 bg-gray-100"></div>
                                <Image
                                    src={image.url}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    {...getBlurPlaceholderProps(image.blurDataURL)}
                                />
                            </button>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    );
}
