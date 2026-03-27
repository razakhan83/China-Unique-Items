import Script from 'next/script';
import TrackingPageView from '@/components/TrackingPageView';

export default function TrackingScripts({
  enabled,
  facebookPixelId,
  tiktokPixelId,
}) {
  if (!enabled) return null;

  return (
    <>
      {facebookPixelId ? (
        <>
          <Script
            id="facebook-pixel-loader"
            src="https://connect.facebook.net/en_US/fbevents.js"
            strategy="afterInteractive"
          />
          <Script id="facebook-pixel-init" strategy="afterInteractive">
            {`window.fbq=window.fbq||function(){(window.fbq.q=window.fbq.q||[]).push(arguments)};window._fbq=window._fbq||window.fbq;window.fbq.push=window.fbq;window.fbq.loaded=true;window.fbq.version='2.0';window.fbq.queue=window.fbq.queue||[];window.fbq('init', '${facebookPixelId}');window.fbq('track', 'PageView');`}
          </Script>
        </>
      ) : null}

      {tiktokPixelId ? (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(target,method){target[method]=function(){target.push([method].concat(Array.prototype.slice.call(arguments,0)));};};for(var i=0;i<ttq.methods.length;i++){ttq.setAndDefer(ttq,ttq.methods[i]);}ttq.load=function(pixelId,options){var url="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[pixelId]=[];ttq._i[pixelId]._u=url;ttq._t=ttq._t||{};ttq._t[pixelId]=+new Date();ttq._o=ttq._o||{};ttq._o[pixelId]=options||{};options=document.createElement("script");options.type="text/javascript";options.async=true;options.src=url+"?sdkid="+pixelId+"&lib="+t;pixelId=document.getElementsByTagName("script")[0];pixelId.parentNode.insertBefore(options,pixelId);};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');`}
        </Script>
      ) : null}

      <TrackingPageView
        enabled={enabled}
        facebookPixelId={facebookPixelId}
        tiktokPixelId={tiktokPixelId}
      />
    </>
  );
}
