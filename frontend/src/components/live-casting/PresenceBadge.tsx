'use client';

import React from 'react';
import { Mic, MicOff, Video, VideoOff, Crown, Pencil, Eye } from 'lucide-react';
import { ParticipantRole } from '@/types/live-casting';

export function MicBadge({ on }: { on: boolean }) {
  return (
    <span title={on ? 'Mic on' : 'Mic muted'} className="inline-flex items-center">
      {on ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-slate-500" />}
    </span>
  );
}

export function CamBadge({ on }: { on: boolean }) {
  return (
    <span title={on ? 'Camera on' : 'Camera off'} className="inline-flex items-center">
      {on ? <Video className="w-3 h-3 text-emerald-400" /> : <VideoOff className="w-3 h-3 text-slate-500" />}
    </span>
  );
}

export function RoleBadge({ role }: { role: ParticipantRole }) {
  if (role === 'presenter') {
    return (
      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-900/60 text-violet-300 border border-violet-700/50 uppercase tracking-wide">
        <Crown className="w-2.5 h-2.5" /> Presenter
      </span>
    );
  }
  if (role === 'editor') {
    return (
      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700/50 uppercase tracking-wide">
        <Pencil className="w-2.5 h-2.5" /> Editor
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wide">
      <Eye className="w-2.5 h-2.5" /> Viewer
    </span>
  );
}

export function AvatarInitials({ name, image, size = 'sm' }: { name: string; image?: string | null; size?: 'xs' | 'sm' | 'md' }) {
  const sizeClass = size === 'xs' ? 'w-5 h-5 text-[8px]' : size === 'md' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs';
  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border border-slate-700`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center font-bold text-white border border-slate-700 shrink-0`}>
      {initials || '?'}
    </div>
  );
}
