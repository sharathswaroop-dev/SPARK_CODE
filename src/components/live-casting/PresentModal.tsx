'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  AppWindow,
  Globe,
  Layout,
  Code2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { PresentationType } from '@/types/live-casting';

interface PresentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (type: PresentationType, title?: string) => void;
  isStarting?: boolean;
}

export default function PresentModal({
  isOpen,
  onClose,
  onSelectOption,
  isStarting = false,
}: PresentModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [hasDisplayMedia, setHasDisplayMedia] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobileCheck =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
      setIsMobile(mobileCheck);
      const displayMediaSupported = Boolean(
        navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function'
      );
      setHasDisplayMedia(displayMediaSupported);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const presentationOptions: {
    type: PresentationType;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    isNativeScreenShare: boolean;
    recommendedOnMobile?: boolean;
  }[] = [
    {
      type: 'sparkcode-workspace',
      title: 'SparkCode Workspace',
      description: 'Interactive coding problem, live code editor, testcases & terminal output. Works natively on mobile & desktop!',
      icon: <Layout className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />,
      badge: 'Interactive & Mobile Ready',
      isNativeScreenShare: false,
      recommendedOnMobile: true,
    },
    {
      type: 'code-editor',
      title: 'Monaco Live Code Editor',
      description: 'Stream Monaco code editor with real-time pair-programming, multi-language support & edit handoffs.',
      icon: <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />,
      badge: 'Live Code Stream',
      isNativeScreenShare: false,
      recommendedOnMobile: true,
    },
    {
      type: 'screen',
      title: 'Entire Screen',
      description: 'Share your entire desktop monitor (VS Code, terminal, browser, PDFs, etc.).',
      icon: <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />,
      badge: 'Desktop Screen Share',
      isNativeScreenShare: true,
    },
    {
      type: 'window',
      title: 'Application Window',
      description: 'Share a specific application window (e.g. IDE, Discord, Browser, Terminal).',
      icon: <AppWindow className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />,
      badge: 'Native Window Share',
      isNativeScreenShare: true,
    },
    {
      type: 'browser-tab',
      title: 'Browser Tab',
      description: 'Share a single Chrome/browser tab with high frame-rate & tab audio.',
      icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />,
      badge: 'Tab Audio & Video',
      isNativeScreenShare: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#12141a] border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#161822]">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg shadow-violet-600/30">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                Choose What to Present
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isMobile ? 'Mobile & Interactive presentation options' : 'Select your presentation source for the room'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Info Tip if on phone */}
        {isMobile && (
          <div className="mx-4 sm:mx-6 mt-3.5 p-3 rounded-2xl bg-violet-950/40 border border-violet-800/50 flex items-start gap-2.5 text-xs text-violet-200">
            <Smartphone className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Mobile Tip:</strong> Use <strong>SparkCode Workspace</strong> or <strong>Live Code Editor</strong> to broadcast interactive pair-programming directly from your phone!
            </p>
          </div>
        )}

        {/* Options List */}
        <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3 overflow-y-auto flex-1">
          {presentationOptions.map((opt) => {
            const isRestrictedOnMobile = opt.isNativeScreenShare && isMobile && !hasDisplayMedia;

            return (
              <button
                key={opt.type}
                type="button"
                disabled={isStarting}
                onClick={() => {
                  if (isRestrictedOnMobile) {
                    alert(
                      'Direct desktop screen capture is not supported on this mobile browser. Launching SparkCode Workspace presentation instead!'
                    );
                    onSelectOption('sparkcode-workspace', 'SparkCode Workspace');
                  } else {
                    onSelectOption(opt.type, opt.title);
                  }
                  onClose();
                }}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between group disabled:opacity-50 ${
                  opt.recommendedOnMobile && isMobile
                    ? 'bg-gradient-to-r from-violet-950/40 to-slate-900/90 border-violet-500/50 hover:border-violet-400 shadow-md shadow-violet-950/30'
                    : 'bg-[#181a24]/90 border-slate-800/90 hover:border-violet-500/50 hover:bg-[#1f2230]'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 pr-2">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 shrink-0 mt-0.5">
                    {opt.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                        {opt.title}
                      </span>
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          opt.recommendedOnMobile && isMobile
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-800/60 text-slate-400 group-hover:bg-violet-600 group-hover:text-white shrink-0 transition-all ml-1">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="px-4 sm:px-6 py-3 bg-[#161822] border-t border-slate-800/60 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>WebRTC Peer-to-Peer Encryption</span>
          </div>
          <span className="text-slate-500">SparkCode Live v2.0</span>
        </div>
      </div>
    </div>
  );
}
