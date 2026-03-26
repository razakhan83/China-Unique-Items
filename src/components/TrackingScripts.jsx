'use client';

import { Suspense, useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

function firePageView({ facebookPixelId, tiktokPixelId }) {
  if (facebookPixelId && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }

  if (tiktokPixelId && typeof window.ttq?.page === 'function') {
    window.ttq.page();
  }
}

function TrackingPageView({ enabled, facebookPixelId, tiktokPixelId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled) return;
    firePageView({ facebookPixelId, tiktokPixelId });
  }, [enabled, facebookPixelId, pathname, searchParams, tiktokPixelId]);

  return null;
}

export default function TrackingScripts({
  enabled,
  facebookPixelId,
  tiktokPixelId,
}) {
  if (!enabled) return null;

  return (
    <>
      {facebookPixelId ? (
        <Script id="facebook-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${facebookPixelId}');`}
        </Script>
      ) : null}

      {tiktokPixelId ? (
        <Script id="tiktok-pixel" strategy="lazyOnload">
          {`!function (w, d, t) {
  w.TiktokAnalyticsObject = t;
  var ttq = w[t] = w[t] || [];
  ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
  ttq.setAndDefer = function (target, method) {
    target[method] = function () {
      target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (var i = 0; i < ttq.methods.length; i++) {
    ttq.setAndDefer(ttq, ttq.methods[i]);
  }
  ttq.load = function (pixelId, options) {
    var url = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[pixelId] = [];
    ttq._i[pixelId]._u = url;
    ttq._t = ttq._t || {};
    ttq._t[pixelId] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[pixelId] = options || {};
    options = document.createElement("script");
    options.type = "text/javascript";
    options.async = true;
    options.src = url + "?sdkid=" + pixelId + "&lib=" + t;
    pixelId = document.getElementsByTagName("script")[0];
    pixelId.parentNode.insertBefore(options, pixelId);
  };
  ttq.load('${tiktokPixelId}');
}(window, document, 'ttq');`}
        </Script>
      ) : null}

      <Suspense fallback={null}>
        <TrackingPageView
          enabled={enabled}
          facebookPixelId={facebookPixelId}
          tiktokPixelId={tiktokPixelId}
        />
      </Suspense>
    </>
  );
}
