'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { CLOUDINARY_IMAGE_PRESETS, optimizeCloudinaryUrl } from '@/lib/cloudinaryImage';
import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';

const HERO_AUTOPLAY_DELAY_MS = 5000;

function resolveViewport() {
  if (typeof window === 'undefined') return 'desktop';
  if (window.innerWidth < 768) return 'mobile';
  if (window.innerWidth < 1024) return 'tablet';
  return 'desktop';
}

function getActiveAsset(slide, viewport) {
  const desktopAsset = slide?.desktopImage || null;
  const tabletAsset = slide?.tabletImage || desktopAsset;
  const mobileAsset = slide?.mobileImage || desktopAsset;

  if (viewport === 'mobile') {
    return {
      src: optimizeCloudinaryUrl(
        mobileAsset?.url || slide?.mobileSrc || slide?.image || slide?.src || '',
        CLOUDINARY_IMAGE_PRESETS.heroOriginal
      ),
      blurDataURL: mobileAsset?.blurDataURL || desktopAsset?.blurDataURL || slide?.blurDataURL || '',
    };
  }

  if (viewport === 'tablet') {
    return {
      src: optimizeCloudinaryUrl(
        tabletAsset?.url || slide?.tabletSrc || slide?.pcSrc || slide?.image || slide?.src || '',
        CLOUDINARY_IMAGE_PRESETS.heroOriginal
      ),
      blurDataURL: tabletAsset?.blurDataURL || desktopAsset?.blurDataURL || slide?.blurDataURL || '',
    };
  }

  return {
    src: optimizeCloudinaryUrl(
      desktopAsset?.url || slide?.pcSrc || slide?.image || slide?.src || '',
      CLOUDINARY_IMAGE_PRESETS.heroOriginal
    ),
    blurDataURL: desktopAsset?.blurDataURL || slide?.blurDataURL || '',
  };
}

export default function HeroSlider({ slides = [] }) {
  const [viewport, setViewport] = useState('desktop');
  const [carouselApi, setCarouselApi] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const syncViewport = () => setViewport(resolveViewport());
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const resolvedSlides = useMemo(
    () =>
      slides
        .map((slide, index) => ({
          ...slide,
          asset: getActiveAsset(slide, viewport),
          alt: slide?.alt || `Slide ${index + 1}`,
        }))
        .filter((slide) => slide.asset?.src),
    [slides, viewport]
  );
  const isInteractive = resolvedSlides.length > 1;
  const carouselOptions = useMemo(
    () => ({
      active: isInteractive,
      align: 'start',
      focus: false,
      loop: isInteractive,
      slideChanges: false,
      slidesToScroll: 1,
      ssr: Array.from({ length: resolvedSlides.length }, () => 100),
    }),
    [isInteractive, resolvedSlides.length]
  );

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setCurrentIndex(carouselApi.selectedSnap());
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reinit', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reinit', onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || !isInteractive || !sectionRef.current) {
      return;
    }

    const sectionNode = sectionRef.current;
    let isMouseOver = false;
    let isPointerDown = false;
    let hasFocusWithin = false;
    let autoplayTimer;

    const clearAutoplay = () => {
      if (autoplayTimer) {
        window.clearTimeout(autoplayTimer);
        autoplayTimer = undefined;
      }
    };

    const scheduleAutoplay = () => {
      clearAutoplay();

      if (document.hidden || isMouseOver || isPointerDown || hasFocusWithin) {
        return;
      }

      autoplayTimer = window.setTimeout(() => {
        carouselApi.goToNext();
      }, HERO_AUTOPLAY_DELAY_MS);
    };

    const handlePointerDown = () => {
      isPointerDown = true;
      clearAutoplay();
    };

    const handlePointerUp = () => {
      isPointerDown = false;
      scheduleAutoplay();
    };

    const handleMouseEnter = () => {
      isMouseOver = true;
      clearAutoplay();
    };

    const handleMouseLeave = () => {
      isMouseOver = false;
      scheduleAutoplay();
    };

    const handleFocusIn = () => {
      hasFocusWithin = true;
      clearAutoplay();
    };

    const handleFocusOut = (event) => {
      if (sectionNode.contains(event.relatedTarget)) {
        return;
      }

      hasFocusWithin = false;
      scheduleAutoplay();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAutoplay();
        return;
      }

      scheduleAutoplay();
    };

    carouselApi.on('select', scheduleAutoplay);
    carouselApi.on('reinit', scheduleAutoplay);
    sectionNode.addEventListener('pointerdown', handlePointerDown);
    sectionNode.addEventListener('pointerup', handlePointerUp);
    sectionNode.addEventListener('pointercancel', handlePointerUp);
    sectionNode.addEventListener('mouseenter', handleMouseEnter);
    sectionNode.addEventListener('mouseleave', handleMouseLeave);
    sectionNode.addEventListener('focusin', handleFocusIn);
    sectionNode.addEventListener('focusout', handleFocusOut);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    scheduleAutoplay();

    return () => {
      carouselApi.off('select', scheduleAutoplay);
      carouselApi.off('reinit', scheduleAutoplay);
      sectionNode.removeEventListener('pointerdown', handlePointerDown);
      sectionNode.removeEventListener('pointerup', handlePointerUp);
      sectionNode.removeEventListener('pointercancel', handlePointerUp);
      sectionNode.removeEventListener('mouseenter', handleMouseEnter);
      sectionNode.removeEventListener('mouseleave', handleMouseLeave);
      sectionNode.removeEventListener('focusin', handleFocusIn);
      sectionNode.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearAutoplay();
    };
  }, [carouselApi, isInteractive]);

  if (resolvedSlides.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      data-testid="hero-main-slider"
      className="relative w-full overflow-hidden bg-black"
    >
      <div className="relative h-[54vh] min-h-[320px] w-full overflow-hidden bg-black md:h-[460px] lg:h-[560px]">
        <Carousel
          setApi={setCarouselApi}
          opts={carouselOptions}
          className="h-full w-full"
        >
          <CarouselContent viewportClassName="h-full" className="ml-0 h-full">
            {resolvedSlides.map((slide, index) => (
              <CarouselItem
                key={slide.id || `${slide.asset.src}-${viewport}-${index}`}
                className="h-full basis-full pl-0"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={slide.asset.src}
                    alt={slide.alt}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    className="object-cover"
                    {...getBlurPlaceholderProps(slide.asset.blurDataURL)}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.16))]" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {isInteractive ? (
          <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2">
            {resolvedSlides.map((slide, index) => (
              <button
                key={slide.id || `dot-${index}`}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-pressed={currentIndex === index}
                onClick={() => carouselApi?.goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'w-5 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
