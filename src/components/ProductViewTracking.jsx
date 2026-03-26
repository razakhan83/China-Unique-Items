'use client';

import { useEffect } from 'react';

export default function ProductViewTracking({
  enabled,
  facebookPixelId,
  tiktokPixelId,
  productId,
  name,
  category,
  value,
}) {
  useEffect(() => {
    if (!enabled || !productId) return;

    const payload = {
      content_ids: [productId],
      content_name: name,
      content_category: category,
      content_type: 'product',
      value: Number(value || 0),
      currency: 'PKR',
    };

    if (facebookPixelId && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', payload);
    }

    if (tiktokPixelId && typeof window.ttq?.track === 'function') {
      window.ttq.track('ViewContent', payload);
    }
  }, [category, enabled, facebookPixelId, name, productId, tiktokPixelId, value]);

  return null;
}
