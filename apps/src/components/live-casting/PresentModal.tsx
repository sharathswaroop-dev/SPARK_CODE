'use client';

import React from 'react';
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
  if (!isOpen) return null;

  const presentationOptions: {
    type: PresentationType;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    isNativeScreenShare: boolean;
  }[] = [
    {
      type: 'screen',
      title: 'Entire Screen',
      description: 'Share your entire desktop monitor (VS Code, terminal, browser, PDFs, etc.).',
      icon: <Monitor className="w-6 h-6 text-violet-400" />,
      badge: 'Native Screen Share',
      isNativeScreenShare: true,
    },
    {
      type: 'window',
      title: 'Application Window',
      description: 'Share a specific application window (e.g. IDE, Discord, Browser, Terminal).',
      icon: <AppWindow className="w-6 h-6 text-sky-400" />,
      badge: 'Native Window Share',
      isNativeScreenShare: true,
    },
    {
      type: 'browser-tab',
      title: 'Browser Tab',
      description: 'Share a single Chrome/browser tab with high frame-rate & tab audio.',
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      badge: 'Tab Audio & Video',
      isNativeScreenShare: true,
    },
    {
      type: 'sparkcode-workspace',
      title: 'SparkCode Workspace',
      description: 'Present the active coding problem, description, code editor, and stdin/output console.',
      icon: <Layout className="w-6 h-6 text-amber-400" />,
      badge: 'Interactive Workspace',
      isNativeScreenShare: false,
    },
    {
      type: 'code-editor',
      title: 'Code Editor Only',
      description: 'Stream Monaco code editor with real-time pair-programming & edit handoffs.',
      icon: <Code2 className="w-6 h-6 text-pink-400" />,
      badge: 'Live Code Stream',
      isNativeScreenShare: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg shadow-violet-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Choose What to Present
              </h2>
              <p className="text-xs text-slate-400">
                Select your presentation source for the room
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-6 space-y-3 max-h-[480px] overflow-y-auto">
          {presentationOptions.map((opt) => (
            <button
              key={opt.type}
              type="button"
              disabled={isStarting}
              onClick={() => {
                onSelectOption(opt.type, opt.title);
                onClose();
              }}
              className="w-full text-left p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-violet-500/50 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-violet-950/30 transition-all flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-start gap-3.5 min-w-0 pr-3">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 shrink-0 mt-0.5">
                  {opt.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                      {opt.title}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {opt.description}
                  </p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-800/60 text-slate-400 group-hover:bg-violet-600 group-hover:text-white shrink-0 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3.5 bg-slate-900/40 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebRTC Encrypted Peer-to-Peer Stream</span>
          </div>
          <span>Native browser picker handles selection</span>
        </div>
      </div>
    </div>
  );
}
