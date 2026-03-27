'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageViewEvent } from '@/lib/clientTracking';

function firePageView({ tiktokPixelId }) {
  if (tiktokPixelId && typeof window.ttq?.page === 'function') {
    window.ttq.page();
  }

  trackPageViewEvent();
}

function TrackingPageViewInner({ enabled, facebookPixelId, tiktokPixelId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled || !facebookPixelId) return;
    firePageView({ tiktokPixelId });
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
