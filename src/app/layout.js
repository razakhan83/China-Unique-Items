import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getStoreSettings } from "@/lib/data";
import TrackingScripts from "@/components/TrackingScripts";
import { Toaster } from "@/components/ui/sonner";
import { getStoreConfig, getStoreThemeStyle } from "@/lib/store-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const store = getStoreConfig();

export const metadata = {
  metadataBase: new URL(store.siteUrl),
  title: {
    default: store.name,
    template: `%s | ${store.name}`,
  },
  description: store.description,
  openGraph: {
    title: store.name,
    description: store.description,
    type: 'website',
    url: store.siteUrl,
    siteName: store.name,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const settings = await getStoreSettings();

  return (
    <html lang="en" suppressHydrationWarning={true} style={getStoreThemeStyle()}>
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <TrackingScripts
          enabled={settings.trackingEnabled === true}
          facebookPixelId={settings.facebookPixelId}
          tiktokPixelId={settings.tiktokPixelId}
        />
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
