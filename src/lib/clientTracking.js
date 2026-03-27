'use client';

function getEventSourceUrl() {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

function postMetaEvent(payload) {
  if (typeof window === 'undefined') return;

  fetch('/api/tracking/meta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch((error) => {
    console.error('Meta CAPI request failed:', error);
  });
}

export function trackSearchEvent({ searchString }) {
  const term = String(searchString || '').trim();
  if (!term) return;

  const eventId = crypto.randomUUID();
  const customData = { search_string: term };

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Search', customData, { eventID: eventId });
  }

  postMetaEvent({
    eventName: 'Search',
    eventId,
    eventSourceUrl: getEventSourceUrl(),
    customData,
  });
}

export function trackInitiateCheckoutEvent({ cart = [], total = 0 }) {
  const contentIds = cart
    .map((item) => String(item?.id || item?._id || item?.slug || '').trim())
    .filter(Boolean);

  const eventId = crypto.randomUUID();
  const customData = {
    currency: 'PKR',
    value: Number(total || 0),
    content_type: 'product',
    content_ids: contentIds,
  };

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', customData, { eventID: eventId });
  }

  postMetaEvent({
    eventName: 'InitiateCheckout',
    eventId,
    eventSourceUrl: getEventSourceUrl(),
    customData,
  });
}

export function trackPurchaseEvent({ orderId, cart = [], total = 0 }) {
  const contentIds = cart
    .map((item) => String(item?.id || item?._id || item?.slug || '').trim())
    .filter(Boolean);

  const customData = {
    currency: 'PKR',
    value: Number(total || 0),
    content_type: 'product',
    content_ids: contentIds,
  };

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', customData, { eventID: orderId });
  }
}
