'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <p className="text-xs text-slate-500 text-center sm:text-left">
          &copy; {new Date().getFullYear()} SparkCode Inc. All rights reserved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-400 font-medium">
          <span>Real-Time Code Judge</span>
          <span className="hidden sm:inline">Competitive Battle Arena</span>
          <span>INR Fair Pricing</span>
          <span className="hidden sm:inline">Study Group WebRTC</span>
        </div>
      </div>
    </footer>
  );
}
