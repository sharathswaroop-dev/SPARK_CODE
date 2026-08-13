'use client';

import React, { useRef, useEffect } from 'react';
import {
  Monitor,
  AppWindow,
  Globe,
  Radio,
  Square,
  Play,
  Loader2,
  Volume2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  Minimize2,
  Sparkles,
  Crown,
  Pencil,
  Code2,
} from 'lucide-react';
import { RoomState, PresentationType, RoomParticipant, ParticipantRole } from '@/types/live-casting';
import { AvatarInitials, RoleBadge } from './PresenceBadge';
import { RemoteParticipantMedia } from '@/hooks/use-webrtc';

interface PresentationStageProps {
  roomState: RoomState;
  currentUserId: string;
  currentUserName?: string;
  isPresenter: boolean;
  canEdit: boolean;
  localScreenStream: MediaStream | null;
  localVideoStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;
  remoteStreams: Map<string, RemoteParticipantMedia>;
  isSpeakingLocally: boolean;
  micOn: boolean;
  camOn: boolean;
  onOpenPresentModal: () => void;
  onStopPresenting: () => void;
  onEnterFullscreen: () => void;
  isFullscreen?: boolean;
  children?: React.ReactNode; // Monaco / Workspace components
}

export default function PresentationStage({
  roomState,
  currentUserId,
  currentUserName,
  isPresenter,
  canEdit,
  localScreenStream,
  localVideoStream,
  remoteScreenStream,
  remoteStreams,
  isSpeakingLocally,
  micOn,
  camOn,
  onOpenPresentModal,
  onStopPresenting,
  onEnterFullscreen,
  isFullscreen = false,
  children,
}: PresentationStageProps) {
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);

  const presentationType = roomState?.presentationType || 'none';
  const isScreenSharing =
    presentationType === 'screen' ||
    presentationType === 'window' ||
    presentationType === 'browser-tab';

  const presenterMedia = roomState?.presenterId ? remoteStreams?.get(roomState.presenterId) : null;

  // Determine active screen share stream (prioritizes screenStream then presenter's videoStream)
  const activeScreenStream = isPresenter
    ? localScreenStream
    : remoteScreenStream || presenterMedia?.screenStream || presenterMedia?.videoStream || null;

  // Attach active screen stream to screen video element
  useEffect(() => {
    if (screenVideoRef.current) {
      if (activeScreenStream) {
        screenVideoRef.current.srcObject = activeScreenStream;
      } else {
        screenVideoRef.current.srcObject = null;
      }
    }
  }, [activeScreenStream, isScreenSharing]);

  // Determine active presenter camera stream for PIP (only if distinct from active main presentation)
  const presenterCamStream = isPresenter
    ? localVideoStream
    : presenterMedia?.videoStream && presenterMedia.videoStream !== activeScreenStream
    ? presenterMedia.videoStream
    : null;

  // Attach presenter camera stream to PIP video element
  useEffect(() => {
    if (pipVideoRef.current) {
      if (presenterCamStream) {
        pipVideoRef.current.srcObject = presenterCamStream;
      } else {
        pipVideoRef.current.srcObject = null;
      }
    }
  }, [presenterCamStream]);

  const getPresentationIcon = (type: PresentationType) => {
    switch (type) {
      case 'screen':
        return <Monitor className="w-4 h-4 text-violet-400" />;
      case 'window':
        return <AppWindow className="w-4 h-4 text-sky-400" />;
      case 'browser-tab':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'sparkcode-workspace':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'code-editor':
        return <Code2 className="w-4 h-4 text-pink-400" />;
      default:
        return <Radio className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPresentationLabel = (type: PresentationType, title?: string | null) => {
    if (title) return title;
    switch (type) {
      case 'screen':
        return 'Entire Screen';
      case 'window':
        return 'Application Window';
      case 'browser-tab':
        return 'Browser Tab';
      case 'sparkcode-workspace':
        return 'SparkCode Workspace';
      case 'code-editor':
        return 'Code Editor';
      default:
        return 'Voice & Video Room';
    }
  };

  // 1. SCREEN SHARE PRESENTATION VIEW (Entire Screen, Window, Tab)
  if (isScreenSharing) {
    return (
      <div className="relative w-full h-full min-h-[460px] bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col shadow-2xl">
        {/* Top Presentation Info Banner */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="p-1 rounded-lg bg-slate-800">
              {getPresentationIcon(presentationType)}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                {isPresenter ? 'You are sharing' : `${roomState?.presenterName || 'Presenter'} is sharing`}{' '}
                <span className="text-violet-400 font-extrabold">
                  {getPresentationLabel(presentationType, roomState?.presentationTitle)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPresenter ? (
              <button
                type="button"
                onClick={onStopPresenting}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 flex items-center gap-1.5 transition-colors"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Sharing</span>
              </button>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                LIVE STREAM
              </span>
            )}

            {!isFullscreen && (
              <button
                type="button"
                onClick={onEnterFullscreen}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Fullscreen presentation"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Video Canvas for Screen Stream */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {activeScreenStream ? (
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              muted={isPresenter}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">
                Receiving screen stream from presenter...
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                WebRTC media stream connection establishing via peer-to-peer mesh.
              </p>
            </div>
          )}

          {/* Floating Camera Picture-in-Picture (PIP) Tile — only shown when camera video is actively streaming */}
          {presenterCamStream && (
            <div className="absolute bottom-4 right-4 z-30 w-44 h-32 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700/80 shadow-2xl flex flex-col group">
              <video
                ref={pipVideoRef}
                autoPlay
                playsInline
                muted={isPresenter}
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Presenter Name Tag & Audio indicator */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-sm flex items-center justify-between text-[10px] text-slate-200">
                <span className="font-semibold truncate">
                  {roomState?.presenterName || 'Presenter'}
                </span>
                <div className="flex items-center gap-1">
                  {micOn ? (
                    <Mic className="w-2.5 h-2.5 text-emerald-400" />
                  ) : (
                    <MicOff className="w-2.5 h-2.5 text-rose-400" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Presenter Screen Tip Banner */}
          {isPresenter && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-slate-950/90 border border-violet-500/50 text-[11px] text-slate-200 shadow-xl backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>You are presenting your screen. Switch to your IDE / application window to show your work.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. CODE EDITOR & SPARKCODE WORKSPACE PRESENTATION VIEW
  if (presentationType === 'code-editor' || presentationType === 'sparkcode-workspace') {
    return (
      <div className="relative w-full h-full min-h-[460px] flex flex-col gap-2">
        {/* Top Presentation Info Banner */}
        <div className="px-4 py-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
            <div className="p-1 rounded-lg bg-slate-800">
              {getPresentationIcon(presentationType)}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                {isPresenter ? 'You are presenting' : `${roomState?.presenterName || 'Presenter'} is presenting`}{' '}
                <span className="text-violet-400 font-extrabold">
                  {getPresentationLabel(presentationType, roomState?.presentationTitle)}
                </span>
                {roomState?.editorName && (
                  <span className="text-amber-400 text-xs font-normal">
                    (✍️ {roomState.editorName} driving)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPresenter && (
              <button
                type="button"
                onClick={onStopPresenting}
                className="px-3 py-1 rounded-xl font-bold text-xs bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 flex items-center gap-1.5 transition-colors"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Presenting</span>
              </button>
            )}

            {!isFullscreen && (
              <button
                type="button"
                onClick={onEnterFullscreen}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Fullscreen presentation"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Embedded Children (Monaco Editor & Stdin/Output Console or Workspace) */}
        <div className="flex-1 w-full relative min-h-0 overflow-hidden">{children}</div>
      </div>
    );
  }

  // Fallback participants list if empty
  const participantsList: RoomParticipant[] =
    roomState?.participants && roomState.participants.length > 0
      ? roomState.participants
      : [
          {
            userId: currentUserId,
            name: currentUserName || 'Presenter',
            role: (isPresenter ? 'presenter' : 'viewer') as ParticipantRole,
            micOn,
            camOn,
            joinedAt: new Date().toISOString(),
            lastSeen: Date.now(),
          },
        ];

  // 3. VOICE & VIDEO STAGE GRID (When no active presentation is running - Screenshot 1 Target Design)
  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#0c0d10] rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between shadow-2xl overflow-hidden">
      {/* ── TOP ROOM HEADER (Screenshot 1 Target Layout) ── */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Collaborative Room Stage
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                VOICE ACTIVE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              WebRTC encrypted real-time audio, video &amp; presentation hub
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPresentModal}
          className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/20 flex items-center gap-2 transition-all"
        >
          <Monitor className="w-4 h-4" />
          <span>Present</span>
        </button>
      </div>

      {/* ── MAIN PARTICIPANT GRID (Screenshot 1 Visual Structure) ── */}
      <div className="flex-1 flex items-center justify-start overflow-y-auto p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          {participantsList.map((p) => {
            const isMe = p.userId === currentUserId;
            const isSpeaking = isMe ? isSpeakingLocally : p.isSpeaking;
            const participantMedia = isMe ? null : remoteStreams?.get(p.userId);
            const hasVideo = isMe ? camOn && localVideoStream : participantMedia?.videoStream;

            return (
              <div
                key={p.userId}
                className={`relative aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[#181920] to-[#0f1015] border-2 transition-all duration-200 flex flex-col items-center justify-center shadow-xl ${
                  isSpeaking
                    ? 'border-emerald-500 ring-4 ring-emerald-500/30 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {hasVideo ? (
                  <video
                    autoPlay
                    playsInline
                    muted={isMe}
                    ref={(el) => {
                      if (el) {
                        if (isMe && localVideoStream) el.srcObject = localVideoStream;
                        else if (participantMedia?.videoStream) el.srcObject = participantMedia.videoStream;
                      }
                    }}
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="relative">
                      <AvatarInitials name={p.name} image={p.image} size="md" />
                      {isSpeaking && (
                        <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {p.name} {isMe && <span className="text-violet-400 font-normal">(You)</span>}
                    </span>
                  </div>
                )}

                {/* Bottom Metadata Bar */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[10px] text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <RoleBadge role={p.role} />
                    <span className="font-semibold truncate max-w-[120px]">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(isMe ? micOn : p.micOn) ? (
                      <Mic className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <MicOff className="w-3 h-3 text-rose-400" />
                    )}
                    {(isMe ? camOn : p.camOn) ? (
                      <Video className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <VideoOff className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM INFORMATION BAR (Screenshot 1 Target Layout) ── */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Click &ldquo;Present&rdquo; to share Entire Screen, Application Window, or Code Editor.</span>
        </div>

        <button
          type="button"
          onClick={onEnterFullscreen}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-xs transition-colors"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-violet-400" /> Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-violet-400" /> Fullscreen View
            </>
          )}
        </button>
      </div>
    </div>
  );
}
