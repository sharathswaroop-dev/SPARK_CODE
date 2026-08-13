'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SparkCode. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span>Real Code Execution</span>
          <span>INR Pricing Only</span>
          <span>Study Group Workspaces</span>
        </div>
      </div>
    </footer>
  );
}
