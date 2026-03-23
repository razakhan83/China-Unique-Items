import { Suspense } from 'react';

import HomeClientWrapper from '@/components/HomeClientWrapper';
import HomeCategories from '@/components/HomeCategories';
import HomePageSkeleton from '@/components/HomePageSkeleton';
import { getHomeSections } from '@/lib/data';

export default function Home() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const { categories, coverPhotos, sections } = await getHomeSections();
  const activeHeroSlides = coverPhotos.map((item, index) => ({
    desktopImage: item.desktopImage,
    tabletImage: item.tabletImage,
    mobileImage: item.mobileImage,
    alt: item.alt || `Store cover ${index + 1}`,
  }));

  return (
    <>
      <HomeClientWrapper
        heroSlides={activeHeroSlides}
        categories={categories.filter((category) => category.id !== 'special-offers')}
      />
      <HomeCategories sections={sections} />
    </>
  );
}
