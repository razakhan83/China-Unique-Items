'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function firePageView({ facebookPixelId, tiktokPixelId }) {
  if (facebookPixelId && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }

  if (tiktokPixelId && typeof window.ttq?.page === 'function') {
    window.ttq.page();
  }
}

function TrackingPageViewInner({ enabled, facebookPixelId, tiktokPixelId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedInitialPageView = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    if (!hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      return;
    }

    firePageView({ facebookPixelId, tiktokPixelId });
  }, [enabled, facebookPixelId, pathname, searchParams, tiktokPixelId]);

  return null;
}

export default function TrackingPageView(props) {
  return (
    <Suspense fallback={null}>
      <TrackingPageViewInner {...props} />
    </Suspense>
  );
}
