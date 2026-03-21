import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
