import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export const metadata: Metadata = {
  title: 'SparkCode — Collaborative Coding for Study Groups',
  description:
    'Real code execution, curated problem bank, and collaborative study groups for serious learners. Free to start, ₹200/₹700 per month for more.',
  other: {
    'google-adsense-account': 'ca-pub-7053894832120419',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google AdSense Site Verification Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-7053894832120419" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7053894832120419"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="h-full flex flex-col min-h-screen">
        <SessionProvider>
          <Header />
          <main className="flex-1 w-full pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
