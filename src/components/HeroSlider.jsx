'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, EffectFade, Pagination } from 'swiper/modules';

import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';
import { SHARED_SWIPER_PROPS } from '@/components/swiper/swiperConfig';

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
      src: mobileAsset?.url || slide?.mobileSrc || slide?.image || slide?.src || '',
      blurDataURL: mobileAsset?.blurDataURL || desktopAsset?.blurDataURL || slide?.blurDataURL || '',
    };
  }

  if (viewport === 'tablet') {
    return {
      src: tabletAsset?.url || slide?.tabletSrc || slide?.pcSrc || slide?.image || slide?.src || '',
      blurDataURL: tabletAsset?.blurDataURL || desktopAsset?.blurDataURL || slide?.blurDataURL || '',
    };
  }

  return {
    src: desktopAsset?.url || slide?.pcSrc || slide?.image || slide?.src || '',
    blurDataURL: desktopAsset?.blurDataURL || slide?.blurDataURL || '',
  };
}

export default function HeroSlider({ slides = [] }) {
  const [viewport, setViewport] = useState('desktop');

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

  if (resolvedSlides.length === 0) return null;

  return (
    <section data-testid="hero-main-slider" className="relative w-full overflow-hidden bg-black">
      <div className="relative h-[54vh] min-h-[320px] w-full overflow-hidden bg-black md:h-[460px] lg:h-[560px]">
        <Swiper
          {...SHARED_SWIPER_PROPS}
          modules={[A11y, Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={900}
          loop={resolvedSlides.length > 1}
          autoplay={
            resolvedSlides.length > 1
              ? {
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          pagination={{
            clickable: true,
            bulletClass: 'hero-swiper-bullet',
            bulletActiveClass: 'hero-swiper-bullet-active',
          }}
          className="hero-swiper h-full w-full"
        >
          {resolvedSlides.map((slide, index) => (
            <SwiperSlide key={slide.id || `${slide.asset.src}-${viewport}-${index}`}>
              <div className="relative h-full w-full">
                {slide.asset.blurDataURL ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url("${slide.asset.blurDataURL}")`,
                      filter: 'blur(18px)',
                      transform: 'scale(1.08)',
                    }}
                  />
                ) : null}

                <Image
                  src={slide.asset.src}
                  alt={slide.alt}
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  className="hero-swiper-image object-cover"
                  {...getBlurPlaceholderProps(slide.asset.blurDataURL)}
                />

                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.16))]" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
