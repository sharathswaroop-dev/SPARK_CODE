'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

// Extend window definition for Google AdSense
declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

/**
 * List of route prefixes strictly prohibited from showing Google Ads.
 * Google AdSense policy "Google-served ads on screens without publisher-content" forbids ads on:
 * 1. Authentication forms (/signin, /signup)
 * 2. Under construction / placeholder pages (/contests)
 * 3. Interactive utilities/tools without substantial editorial text (/playground, /battles, /groups)
 * 4. Account profiles / dashboards (/profile)
 * 5. Transaction / commercial tables (/pricing)
 * 6. Thin subroutes (/problems/explore, /problems/library, /problems/study-plans, /problems/quest)
 */
const DISALLOWED_ROUTE_PREFIXES = [
  '/signin',
  '/signup',
  '/contests',
  '/playground',
  '/battles',
  '/groups',
  '/profile',
  '/pricing',
  '/discussion',
  '/admin',
  '/api',
  '/problems/explore',
  '/problems/library',
  '/problems/study-plans',
  '/problems/quest',
];

interface GoogleAdProps {
  /**
   * Google AdSense Ad Slot ID.
   * Replace with your real ad unit slot ID from the AdSense dashboard.
   */
  slot?: string;
  /**
   * Ad layout format ('auto', 'fluid', 'rectangle', 'horizontal', etc.)
   */
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  /**
   * Whether to enable full-width responsive ads.
   */
  responsive?: boolean;
  /**
   * Additional Tailwind CSS classes for the ad container.
   */
  className?: string;
  /**
   * Optional custom inline styles.
   */
  style?: React.CSSProperties;
  /**
   * Optional label shown above the ad unit.
   */
  showLabel?: boolean;
}

export function GoogleAd({
  slot = '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
  style,
  showLabel = true,
}: GoogleAdProps) {
  const pathname = usePathname();
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  // Policy Guard: strictly deny ads on screens without substantial publisher content
  const isDisallowed = pathname ? DISALLOWED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) : false;

  useEffect(() => {
    if (isDisallowed) return;
    if (pushedRef.current) return;

    try {
      if (typeof window !== 'undefined') {
        const adElement = adRef.current;
        // Verify the element has not already been populated by AdSense
        if (adElement && !adElement.getAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
        }
      }
    } catch (err) {
      console.debug('[AdSense] Ad push suppressed or blocked:', err);
    }
  }, [isDisallowed, pathname]);

  // If on a disallowed/thin/auth/tool screen, render nothing to protect AdSense compliance
  if (isDisallowed) {
    return null;
  }

  return (
    <>
      {/* On-demand AdSense script: only injected on verified publisher content screens */}
      <Script
        id="adsbygoogle-init"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7053894832120419"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <div className={`w-full my-4 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        {showLabel && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5 select-none">
            Advertisement
          </span>
        )}
        <div className="w-full max-w-full overflow-hidden flex justify-center rounded-xl bg-slate-100/50 border border-slate-200/60 p-2 min-h-[90px] text-center">
          <ins
            ref={adRef}
            className="adsbygoogle block w-full max-w-full"
            style={{ display: 'block', minWidth: '280px', ...style }}
            data-ad-client="ca-pub-7053894832120419"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? 'true' : 'false'}
          />
        </div>
      </div>
    </>
  );
}

export default GoogleAd;
