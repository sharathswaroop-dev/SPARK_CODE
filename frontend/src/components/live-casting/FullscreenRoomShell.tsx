'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Minimize2,
  Maximize2,
  Clock,
  ChevronDown,
  Info,
  Copy,
  Check,
  X,
  UserPlus,
  Lock,
  Hand,
  Volume2,
  Pencil,
  Radio,
  Shield,
} from 'lucide-react';
import { RoomState, RoomChatMessage, PresentationType } from '@/types/live-casting';
import FloatingControlBar from './FloatingControlBar';
import SlideOverPanel from './SlideOverPanel';
import ParticipantsList from './ParticipantsList';
import RoomChat from './RoomChat';
import RoomInputPanel from './RoomInputPanel';
import PresentationStage from './PresentationStage';
import PresentModal from './PresentModal';
import { RemoteParticipantMedia } from '@/hooks/use-webrtc';

interface FullscreenRoomShellProps {
  roomState: RoomState;
  currentUserId: string;
  currentUserName?: string;
  currentUserEmail?: string;
  isPresenter: boolean;
  canEdit: boolean;
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onGrantEdit: (targetUserId: string) => void;
  onRevokeEdit: () => void;
  chatMessages: RoomChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  stdin: string;
  onStdinChange: (val: string) => void;
  onRunCode: () => void;
  onStartPresenting: (type: PresentationType, title?: string) => Promise<void>;
  onStopPresenting: () => void;
  onLeaveRoom: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  localScreenStream: MediaStream | null;
  localVideoStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;
  remoteStreams: Map<string, RemoteParticipantMedia>;
  isSpeakingLocally: boolean;
  children: React.ReactNode; // Monaco Editor / Workspace
}

interface FloatingReaction {
  id: string;
  emoji: string;
  leftPercent: number;
}

export default function FullscreenRoomShell({
  roomState,
  currentUserId,
  currentUserName,
  currentUserEmail,
  isPresenter,
  canEdit,
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
  onGrantEdit,
  onRevokeEdit,
  chatMessages,
  onSendMessage,
  stdin,
  onStdinChange,
  onRunCode,
  onStartPresenting,
  onStopPresenting,
  onLeaveRoom,
  isFullscreen,
  onToggleFullscreen,
  localScreenStream,
  localVideoStream,
  remoteScreenStream,
  remoteStreams,
  isSpeakingLocally,
  children,
}: FullscreenRoomShellProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Panels & drawers visibility
  const [activeSlideOver, setActiveSlideOver] = useState<'participants' | 'chat' | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPresentModal, setShowPresentModal] = useState(false);
  const [showMeetingInfoModal, setShowMeetingInfoModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Feature states
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [activeReactions, setActiveReactions] = useState<FloatingReaction[]>([]);

  // Current formatted time (e.g. 01:14 AM)
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Room display slug & meeting link
  const rawRoomId = roomState?.roomId || 'room_sparkcode';
  const roomSlug = rawRoomId.replace('room_', '').slice(0, 11) || 'spark-cast';
  const meetingUrl = typeof window !== 'undefined' ? `${window.location.origin}/groups/${roomState?.groupId || ''}` : '';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for ESC to exit fullscreen if active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        onToggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onToggleFullscreen]);

  // Handle browser Fullscreen API synchronization
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        onToggleFullscreen();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, onToggleFullscreen]);

  // Handle reaction emoji spawn
  const handleSendReaction = (emoji: string) => {
    const reactionId = `react_${Date.now()}_${Math.random()}`;
    const leftPercent = 35 + Math.random() * 30;
    setActiveReactions((prev) => [...prev, { id: reactionId, emoji, leftPercent }]);

    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 2800);
  };

  const handleCopyMeetingLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(meetingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const userInitial = (currentUserName || currentUserEmail || 'SparkUser')[0].toUpperCase();
  const participantCount = roomState?.participants?.length || 1;

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#121212] text-slate-100 flex flex-col overflow-hidden font-sans select-none'
          : 'relative w-full h-[760px] min-h-[620px] bg-[#121212] text-slate-100 flex flex-col rounded-2xl md:rounded-3xl border border-slate-800/80 overflow-hidden font-sans select-none shadow-2xl'
      }
    >
      {/* ── TOP ROOM BAR (Screenshot 1 Target Layout) ── */}
      <div className="w-full h-14 px-6 flex items-center justify-between border-b border-slate-800/60 bg-[#18191c]/90 backdrop-blur-md z-30 shrink-0">
        {/* Left: Time | Room ID | Info | Stage Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span>{currentTimeStr || '01:14 AM'}</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-xs text-slate-300 font-bold">{roomSlug}</span>
            <button
              type="button"
              onClick={() => setShowMeetingInfoModal(true)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Meeting details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
              {roomState?.presentationType && roomState.presentationType !== 'none'
                ? isPresenter
                  ? `PRESENTING: ${roomState.presentationTitle || 'STAGE'}`
                  : `WATCHING: ${roomState.presenterName || 'PRESENTER'}`
                : 'COLLABORATIVE VOICE & VIDEO STAGE'}
            </span>
          </div>
        </div>

        {/* Right: Driving Badge, Avatar Count & Fullscreen Toggle */}
        <div className="flex items-center gap-3">
          {roomState?.editorName && (
            <div className="hidden md:flex text-xs px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 font-medium items-center gap-1.5 shadow">
              <Pencil className="w-3 h-3 text-amber-400" />
              <span>{roomState.editorName} driving</span>
            </div>
          )}

          {/* Participant Count Avatar Badge */}
          <div className="flex items-center gap-1.5 bg-[#202124] px-2.5 py-1 rounded-full border border-slate-700/80 shadow">
            <div className="w-6 h-6 rounded-full bg-[#d81b60] text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {userInitial}
            </div>
            <span className="text-xs font-bold text-slate-200">{participantCount}</span>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold border border-slate-700 text-slate-200 hover:text-white transition-all shadow"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hand Raised Banner Notification */}
      {isHandRaised && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#fbc02d] text-[#202124] px-4 py-1.5 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Hand className="w-4 h-4 fill-current" />
          <span>You raised your hand</span>
          <button
            type="button"
            onClick={() => setIsHandRaised(false)}
            className="ml-2 hover:bg-black/10 rounded p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── MAIN STAGE AREA ── */}
      <div className="flex-1 relative w-full h-full p-4 overflow-hidden flex flex-col pb-20">
        <PresentationStage
          roomState={
            roomState || {
              roomId: `room_${rawRoomId}`,
              groupId: rawRoomId,
              presenterId: null,
              presenterName: null,
              presentationType: 'none',
              presentationTitle: null,
              editorId: null,
              editorName: null,
              participants: [],
              stdin: stdin,
              code: '',
              language: 'python',
              lastRunOutput: null,
              isRunning: false,
              startedAt: null,
            }
          }
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          isPresenter={isPresenter}
          canEdit={canEdit}
          localScreenStream={localScreenStream}
          localVideoStream={localVideoStream}
          remoteScreenStream={remoteScreenStream}
          remoteStreams={remoteStreams}
          isSpeakingLocally={isSpeakingLocally}
          micOn={micOn}
          camOn={camOn}
          onOpenPresentModal={() => setShowPresentModal(true)}
          onStopPresenting={onStopPresenting}
          onEnterFullscreen={onToggleFullscreen}
          isFullscreen={isFullscreen}
        >
          {children}
        </PresentationStage>

        {/* Right Slide-over Panels (Participants / Room Chat) */}
        <SlideOverPanel
          isOpen={activeSlideOver === 'participants'}
          onClose={() => setActiveSlideOver(null)}
          title={`Participants (${participantCount})`}
        >
          <ParticipantsList
            participants={roomState?.participants || []}
            currentUserId={currentUserId}
            isPresenter={isPresenter}
            editorId={roomState?.editorId || null}
            onGrantEdit={onGrantEdit}
            onRevokeEdit={onRevokeEdit}
            compact
          />
        </SlideOverPanel>

        <SlideOverPanel
          isOpen={activeSlideOver === 'chat'}
          onClose={() => setActiveSlideOver(null)}
          title="Room Live Chat"
        >
          <RoomChat
            messages={chatMessages}
            currentUserId={currentUserId}
            onSendMessage={onSendMessage}
            compact
          />
        </SlideOverPanel>
      </div>

      {/* Floating Animated Reaction Emojis */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {activeReactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.leftPercent}%` }}
            className="absolute bottom-24 text-4xl animate-bounce transition-all duration-1000 transform -translate-y-96 opacity-0"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Captions Subtitle Bar */}
      {captionsEnabled && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md text-white px-6 py-2 rounded-xl text-sm font-medium border border-slate-700 shadow-2xl max-w-xl text-center">
          <span className="text-violet-300 font-bold">{roomState?.presenterName || 'Presenter'}: </span>
          <span>&ldquo;Welcome everyone to the collaborative session.&rdquo;</span>
        </div>
      )}

      {/* Collapsible Bottom Drawer for Stdin / Output */}
      {isDrawerOpen && (
        <div className="absolute bottom-20 left-6 right-6 z-40 max-w-4xl mx-auto shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-t-xl border border-slate-800 text-xs font-bold text-slate-300">
            <span>Standard Input (stdin) &amp; Output Console</span>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <RoomInputPanel
            stdin={stdin}
            onStdinChange={onStdinChange}
            canEdit={canEdit}
            output={roomState?.lastRunOutput || null}
            isRunning={Boolean(roomState?.isRunning)}
            compact
          />
        </div>
      )}

      {/* Presentation Choice Modal */}
      <PresentModal
        isOpen={showPresentModal}
        onClose={() => setShowPresentModal(false)}
        onSelectOption={(type, title) => onStartPresenting(type, title)}
      />

      {/* Meeting Details Modal */}
      {showMeetingInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#202124] text-white border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Room Details</h3>
              <button
                type="button"
                onClick={() => setShowMeetingInfoModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyMeetingLink}
              className="w-full py-2.5 px-4 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow"
            >
              <UserPlus className="w-4 h-4" />
              <span>Copy invite link</span>
            </button>

            <div className="flex items-center justify-between bg-[#2d2e30] px-3.5 py-2.5 rounded-xl border border-slate-700">
              <span className="text-xs font-mono text-slate-300 truncate mr-2">{meetingUrl}</span>
              <button
                type="button"
                onClick={handleCopyMeetingLink}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Joined as <span className="font-semibold text-slate-300">{currentUserEmail || 'user@sparkcode.com'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Permissions / Audio Settings Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#202124] text-white border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" /> Host Controls &amp; Permissions
              </h3>
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-[#2d2e30] border border-slate-700 space-y-1">
                <div className="font-bold text-slate-200">WebRTC Encrypted Peer Mesh</div>
                <p className="text-[11px] text-slate-400">
                  Audio, video, and screenshare signals are end-to-end encrypted directly between participants.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#2d2e30] border border-slate-700 space-y-1">
                <div className="font-bold text-slate-200">Code Handoff Driving</div>
                <p className="text-[11px] text-slate-400">
                  The presenter can delegate driving rights to any participant from the Participants list.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPermissionModal(false)}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── FLOATING BOTTOM CONTROL BAR (Screenshot 1 Pill Design) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 transition-all duration-300">
        <FloatingControlBar
          micOn={micOn}
          camOn={camOn}
          onToggleMic={onToggleMic}
          onToggleCam={onToggleCam}
          isParticipantsOpen={activeSlideOver === 'participants'}
          onToggleParticipants={() =>
            setActiveSlideOver((prev) => (prev === 'participants' ? null : 'participants'))
          }
          participantCount={participantCount}
          isChatOpen={activeSlideOver === 'chat'}
          onToggleChat={() =>
            setActiveSlideOver((prev) => (prev === 'chat' ? null : 'chat'))
          }
          chatCount={chatMessages.length}
          isDrawerOpen={isDrawerOpen}
          onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
          canEdit={canEdit}
          isRunning={Boolean(roomState?.isRunning)}
          onRunCode={onRunCode}
          isPresenter={isPresenter}
          onStopOrLeave={() => {
            if (isPresenter) {
              onStopPresenting();
              onLeaveRoom();
            } else {
              onLeaveRoom();
            }
          }}
          isHandRaised={isHandRaised}
          onToggleHandRaised={() => setIsHandRaised((prev) => !prev)}
          captionsEnabled={captionsEnabled}
          onToggleCaptions={() => setCaptionsEnabled((prev) => !prev)}
          onSendReaction={handleSendReaction}
          onToggleMeetingInfo={() => setShowMeetingInfoModal(true)}
          onOpenPermissionPrompt={() => setShowPermissionModal(true)}
          onOpenPresentModal={() => setShowPresentModal(true)}
        />
      </div>
    </div>
  );
}
