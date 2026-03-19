'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const [viewport, setViewport] = useState('desktop');
  const [imageLoaded, setImageLoaded] = useState(false);

  const activeSlide = slides[selectedIndex] || null;
  const activeAsset = getActiveAsset(activeSlide, viewport);
  const previousSlide = previousIndex === null ? null : slides[previousIndex] || null;
  const previousAsset = getActiveAsset(previousSlide, viewport);

  useEffect(() => {
    const syncViewport = () => setViewport(resolveViewport());

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedIndex((prev) => {
        setPreviousIndex(prev);
        return (prev + 1) % slides.length;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [slides, selectedIndex]);

  useEffect(() => {
    if (previousIndex === null) return undefined;
    const timer = window.setTimeout(() => setPreviousIndex(null), 1100);
    return () => window.clearTimeout(timer);
  }, [previousIndex, selectedIndex, viewport]);

  useEffect(() => {
    setImageLoaded(false);
  }, [selectedIndex, viewport, activeAsset.src]);

  const scrollTo = useCallback((index) => {
    if (index === selectedIndex) return;
    setPreviousIndex(selectedIndex);
    setSelectedIndex(index);
  }, [selectedIndex]);

  if (!slides || slides.length === 0 || !activeAsset.src) return null;

  return (
    <section
      data-testid="hero-main-slider"
      className="relative w-full overflow-hidden bg-black"
    >
      <div className="relative h-[54vh] min-h-[320px] w-full overflow-hidden bg-black md:h-[460px] lg:h-[560px]">
        {previousAsset.src ? (
          <div className="absolute inset-0 animate-fadeOutHero">
            <Image
              src={previousAsset.src}
              alt={previousSlide?.alt || `Slide ${previousIndex + 1}`}
              fill
              sizes="100vw"
              className="object-cover"
              {...getBlurPlaceholderProps(previousAsset.blurDataURL)}
            />
          </div>
        ) : null}

        <div
          key={`${selectedIndex}-${viewport}-${activeAsset.src}`}
          className={`absolute inset-0 ${previousAsset.src ? 'animate-fadeInHero' : ''}`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-out"
            style={{
              backgroundImage: `url("${activeAsset.blurDataURL}")`,
              opacity: imageLoaded ? 0 : 1,
              filter: 'blur(18px)',
              transform: 'scale(1.08)',
            }}
          />
          <Image
            src={activeAsset.src}
            alt={activeSlide?.alt || `Slide ${selectedIndex + 1}`}
            fill
            sizes="100vw"
            priority={selectedIndex === 0}
            className={`object-cover transition-opacity duration-500 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            {...getBlurPlaceholderProps(activeAsset.blurDataURL)}
          />
        </div>

      </div>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              selectedIndex === index
                ? 'h-2 w-5 bg-white shadow-[0_8px_20px_rgba(255,255,255,0.22)]'
                : 'h-2 w-2 bg-white/45 hover:bg-white/65'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
