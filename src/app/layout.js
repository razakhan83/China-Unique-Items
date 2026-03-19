import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getStoreCategories, getStoreSettings } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'China Unique Store',
    template: '%s | China Unique Store',
  },
  description: 'Premium kitchenware, home decor, and lifestyle products for modern Pakistani homes.',
  openGraph: {
    title: 'China Unique Store',
    description: 'Premium kitchenware, home decor, and lifestyle products for modern Pakistani homes.',
    type: 'website',
    url: siteUrl,
    siteName: 'China Unique Store',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { CartProvider } from "@/context/CartContext";
import AuthProvider from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function RootLayout({ children }) {
  const [categories, settings] = await Promise.all([getStoreCategories(), getStoreSettings()]);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <CartProvider>
          <AuthProvider>
            <TooltipProvider>
              <LayoutWrapper categories={categories} settings={settings}>{children}</LayoutWrapper>
            </TooltipProvider>
          </AuthProvider>
        </CartProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
