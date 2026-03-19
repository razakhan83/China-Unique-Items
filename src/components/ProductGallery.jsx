'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { ImageIcon } from 'lucide-react';
import { normalizeProductImage } from '@/lib/productImages';
import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';

export default function ProductGallery({ images }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaMainRef, emblaMainApi] = useEmblaCarousel({ loop: true });
    // Make thumbnails easy to interact with
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
        align: 'start'
    });

    const onThumbClick = useCallback(
        (index) => {
            if (!emblaMainApi || !emblaThumbsApi) return;
            emblaMainApi.scrollTo(index);
        },
        [emblaMainApi, emblaThumbsApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaMainApi || !emblaThumbsApi) return;
        setSelectedIndex(emblaMainApi.selectedScrollSnap());
        emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
    }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

    useEffect(() => {
        if (!emblaMainApi) return;
        onSelect();
        emblaMainApi.on('select', onSelect);
        emblaMainApi.on('reInit', onSelect);
    }, [emblaMainApi, onSelect]);

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

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="surface-card relative aspect-square overflow-hidden rounded-xl" ref={emblaMainRef}>
                <div className="flex h-full touch-pan-y">
                    {normalizedImages.map((image, index) => (
                        <div className="relative flex-[0_0_100%] min-w-0 h-full" key={index}>
                            <Image
                                src={image.url}
                                alt={`Product Image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105"
                                {...getBlurPlaceholderProps(image.blurDataURL)}
                                preload={index === 0}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Thumbnails */}
            {normalizedImages.length > 1 && (
                <div className="overflow-hidden" ref={emblaThumbsRef}>
                    <div className="flex gap-2">
                        {normalizedImages.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => onThumbClick(index)}
                                className={`relative aspect-square flex-[0_0_23.5%] min-w-0 cursor-pointer overflow-hidden rounded-lg border transition-all duration-300 ease-out ${
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
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
