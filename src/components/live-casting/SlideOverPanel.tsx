'use client';

import React from 'react';
import { X } from 'lucide-react';

interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SlideOverPanel({
  isOpen,
  onClose,
  title,
  children,
}: SlideOverPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-slate-950/95 backdrop-blur-md border-l border-slate-800 shadow-2xl z-40 flex flex-col transition-all animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col">{children}</div>
    </div>
  );
}
