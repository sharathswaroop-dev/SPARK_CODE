'use client';

import React, { useState } from 'react';
import { Users, MoreVertical, Crown, Pencil, UserMinus, Sparkles, Shield, Eye } from 'lucide-react';
import { RoomParticipant } from '@/types/live-casting';
import { MicBadge, CamBadge, RoleBadge, AvatarInitials } from './PresenceBadge';

interface ParticipantsListProps {
  participants: RoomParticipant[];
  currentUserId: string;
  isPresenter: boolean;
  editorId: string | null;
  onGrantEdit: (targetUserId: string) => void;
  onRevokeEdit: () => void;
  compact?: boolean;
}

export default function ParticipantsList({
  participants,
  currentUserId,
  isPresenter,
  editorId,
  onGrantEdit,
  onRevokeEdit,
  compact = false,
}: ParticipantsListProps) {
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

  const toggleMenu = (userId: string) => {
    setOpenMenuUserId((prev) => (prev === userId ? null : userId));
  };

  // Sort participants: Presenter first, Editor second, current user next, then alphabetical
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.role === 'presenter') return -1;
    if (b.role === 'presenter') return 1;
    if (a.role === 'editor') return -1;
    if (b.role === 'editor') return 1;
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={`card p-4 border border-slate-800 bg-slate-950 text-slate-100 flex flex-col shadow-xl ${compact ? 'h-full' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-violet-400" />
          Participants ({participants.length})
        </h3>
        {editorId && (
          <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-sm">
            <Pencil className="w-2.5 h-2.5" /> Pair Driving
          </span>
        )}
      </div>

      {/* Participants List */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1 max-h-[320px]">
        {sortedParticipants.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs italic flex flex-col items-center gap-1.5">
            <Users className="w-6 h-6 text-slate-700" />
            <span>No participants active in session.</span>
          </div>
        ) : (
          sortedParticipants.map((p) => {
            const isMe = p.userId === currentUserId;
            const isThisEditor = p.userId === editorId;
            const isThisPresenter = p.role === 'presenter';
            const isMenuOpen = openMenuUserId === p.userId;

            return (
              <div
                key={p.userId}
                className={`p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-all border ${
                  isThisPresenter
                    ? 'bg-violet-950/30 border-violet-800/40 shadow-sm'
                    : isThisEditor
                    ? 'bg-amber-950/20 border-amber-800/40 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left info: Avatar, Name, Role */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <AvatarInitials name={p.name} image={p.image} size="sm" />
                    {isThisPresenter && (
                      <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-violet-600 text-white shadow">
                        <Crown className="w-2.5 h-2.5" />
                      </span>
                    )}
                    {isThisEditor && !isThisPresenter && (
                      <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-600 text-white shadow">
                        <Pencil className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-violet-400 font-semibold">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <RoleBadge role={p.role} />
                    </div>
                  </div>
                </div>

                {/* Right controls: Mic & Cam status, Presenter "..." Action Menu */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 shadow-inner">
                    <MicBadge on={p.micOn} />
                    <span className="w-px h-3 bg-slate-800" />
                    <CamBadge on={p.camOn} />
                  </div>

                  {/* Presenter "..." Action Menu for Edit Handoff */}
                  {isPresenter && !isThisPresenter && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => toggleMenu(p.userId)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Participant Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuUserId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 text-xs">
                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                              Permissions
                            </div>

                            {isThisEditor ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onRevokeEdit();
                                  setOpenMenuUserId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-300 hover:bg-rose-950/60 flex items-center gap-2 font-medium transition-colors"
                              >
                                <UserMinus className="w-3.5 h-3.5" /> Revoke Edit Access
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onGrantEdit(p.userId);
                                  setOpenMenuUserId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-amber-300 hover:bg-amber-950/60 flex items-center gap-2 font-medium transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5 text-amber-400" /> Give Edit Access (Drive)
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
