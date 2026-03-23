'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CLOUDINARY_IMAGE_PRESETS, optimizeCloudinaryUrl } from '@/lib/cloudinaryImage';
import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';

const HERO_AUTOPLAY_DELAY_MS = 5000;
const HERO_SWIPE_THRESHOLD_PX = 40;

function getSlideAssets(slide) {
  const desktopAsset = slide?.desktopImage || null;
  const tabletAsset = slide?.tabletImage || desktopAsset;
  const mobileAsset = slide?.mobileImage || desktopAsset;

  return {
    desktop: {
      src: optimizeCloudinaryUrl(
        desktopAsset?.url || slide?.pcSrc || slide?.image || slide?.src || '',
        CLOUDINARY_IMAGE_PRESETS.heroOriginal
      ),
      blurDataURL: desktopAsset?.blurDataURL || slide?.blurDataURL || '',
    },
    tablet: {
      src: optimizeCloudinaryUrl(
        tabletAsset?.url || slide?.tabletSrc || slide?.pcSrc || slide?.image || slide?.src || '',
        CLOUDINARY_IMAGE_PRESETS.heroOriginal
      ),
      blurDataURL: tabletAsset?.blurDataURL || desktopAsset?.blurDataURL || slide?.blurDataURL || '',
    },
    mobile: {
      src: optimizeCloudinaryUrl(
        mobileAsset?.url || slide?.mobileSrc || slide?.image || slide?.src || '',
        CLOUDINARY_IMAGE_PRESETS.heroOriginal
      ),
      blurDataURL: mobileAsset?.blurDataURL || desktopAsset?.blurDataURL || slide?.blurDataURL || '',
    },
  };
}

function getDesktopAsset(slide) {
  return slide.assets.desktop.src
    ? slide.assets.desktop
    : slide.assets.tablet.src
      ? slide.assets.tablet
      : slide.assets.mobile;
}

function getTabletAsset(slide) {
  return slide.assets.tablet.src
    ? slide.assets.tablet
    : slide.assets.desktop.src
      ? slide.assets.desktop
      : slide.assets.mobile;
}

function getMobileAsset(slide) {
  return slide.assets.mobile.src
    ? slide.assets.mobile
    : slide.assets.tablet.src
      ? slide.assets.tablet
      : slide.assets.desktop;
}

export default function HeroSlider({ slides = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const resolvedSlides = slides
    .map((slide, index) => ({
      ...slide,
      assets: getSlideAssets(slide),
      alt: slide?.alt || `Slide ${index + 1}`,
    }))
    .filter((slide) => slide.assets.desktop.src || slide.assets.tablet.src || slide.assets.mobile.src);
  const safeActiveIndex =
    resolvedSlides.length > 0 ? activeIndex % resolvedSlides.length : 0;
  const previousIndex =
    resolvedSlides.length > 1
      ? (safeActiveIndex - 1 + resolvedSlides.length) % resolvedSlides.length
      : safeActiveIndex;
  const nextIndex =
    resolvedSlides.length > 1
      ? (safeActiveIndex + 1) % resolvedSlides.length
      : safeActiveIndex;

  function goToSlide(nextIndex) {
    if (resolvedSlides.length === 0) return;
    const normalizedIndex = ((nextIndex % resolvedSlides.length) + resolvedSlides.length) % resolvedSlides.length;
    setActiveIndex(normalizedIndex);
  }

  function goToNextSlide() {
    goToSlide(safeActiveIndex + 1);
  }

  function goToPrevSlide() {
    goToSlide(safeActiveIndex - 1);
  }

  function handleTouchStart(event) {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches?.[0];
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (!touch || startX == null || startY == null) return;

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) < HERO_SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      goToNextSlide();
      return;
    }

    goToPrevSlide();
  }

  useEffect(() => {
    if (resolvedSlides.length <= 1) {
      return;
    }

    const autoplayTimer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % resolvedSlides.length);
    }, HERO_AUTOPLAY_DELAY_MS);

    return () => window.clearTimeout(autoplayTimer);
  }, [resolvedSlides.length, safeActiveIndex]);

  if (resolvedSlides.length === 0) return null;

  return (
    <section
      data-testid="hero-main-slider"
      className="relative w-full overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[54vh] min-h-[320px] w-full overflow-hidden bg-black md:h-[460px] lg:h-[560px]">
        <div className="hero-crossfade-slider" aria-label="Featured promotions">
          {resolvedSlides.map((slide, index) => {
            const isActive = index === safeActiveIndex;
            const shouldRenderImage =
              index === safeActiveIndex || index === previousIndex || index === nextIndex;
            const desktopAsset = getDesktopAsset(slide);
            const tabletAsset = getTabletAsset(slide);
            const mobileAsset = getMobileAsset(slide);

            return (
              <div
                key={slide.id || `${desktopAsset.src || tabletAsset.src || mobileAsset.src}-${index}`}
                aria-hidden={!isActive}
                className={`hero-crossfade-slider__slide ${isActive ? 'is-active' : ''} ${
                  index === 0 ? 'is-initial-active' : ''
                }`}
              >
                {shouldRenderImage && mobileAsset?.src ? (
                  <div className="block h-full w-full md:hidden">
                    <Image
                      src={mobileAsset.src}
                      alt={slide.alt}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      fetchPriority={isActive ? 'high' : undefined}
                      className="object-cover"
                      {...getBlurPlaceholderProps(mobileAsset.blurDataURL)}
                    />
                  </div>
                ) : null}

                {shouldRenderImage && tabletAsset?.src ? (
                  <div className="hidden h-full w-full md:block lg:hidden">
                    <Image
                      src={tabletAsset.src}
                      alt={slide.alt}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      fetchPriority={isActive ? 'high' : undefined}
                      className="object-cover"
                      {...getBlurPlaceholderProps(tabletAsset.blurDataURL)}
                    />
                  </div>
                ) : null}

                {shouldRenderImage && desktopAsset?.src ? (
                  <div className="hidden h-full w-full lg:block">
                    <Image
                      src={desktopAsset.src}
                      alt={slide.alt}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      fetchPriority={isActive ? 'high' : undefined}
                      className="object-cover"
                      {...getBlurPlaceholderProps(desktopAsset.blurDataURL)}
                    />
                  </div>
                ) : null}

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.16))]" />
              </div>
            );
          })}
        </div>

        {resolvedSlides.length > 1 ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between px-4 md:flex lg:px-6">
            <button
              type="button"
              onClick={goToPrevSlide}
              className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={goToNextSlide}
              className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        ) : null}

        {resolvedSlides.length > 1 ? (
          <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2">
            {resolvedSlides.map((slide, index) => (
              <button
                key={slide.id || `dot-${index}`}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-pressed={safeActiveIndex === index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  safeActiveIndex === index ? 'w-5 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
