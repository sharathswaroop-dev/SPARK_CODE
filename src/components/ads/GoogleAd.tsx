'use client';

import React, { useEffect, useRef } from 'react';

// Extend window definition for Google AdSense
declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface GoogleAdProps {
  /**
   * Google AdSense Ad Slot ID.
   * Replace the placeholder with your real ad unit slot ID from Google AdSense.
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
  slot = '1234567890', // Default placeholder slot ID
  format = 'auto',
  responsive = true,
  className = '',
  style,
  showLabel = true,
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Only attempt push once per mounted ins element, and avoid duplicate pushes in React StrictMode
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
      // Catch duplicate push or adblocker restrictions gracefully
      console.debug('[AdSense] Ad push suppressed or blocked:', err);
    }
  }, []);

  return (
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
  );
}

export default GoogleAd;
