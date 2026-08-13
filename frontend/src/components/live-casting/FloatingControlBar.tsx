'use client';

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageSquare,
  Terminal,
  Play,
  Square,
  PhoneOff,
  Loader2,
  ChevronUp,
  Smile,
  Hand,
  Subtitles,
  MoreVertical,
  Info,
  Shield,
  Check,
  Volume2,
  Camera,
  Monitor,
} from 'lucide-react';

interface FloatingControlBarProps {
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  isParticipantsOpen: boolean;
  onToggleParticipants: () => void;
  participantCount: number;
  isChatOpen: boolean;
  onToggleChat: () => void;
  chatCount: number;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  canEdit: boolean;
  isRunning: boolean;
  onRunCode: () => void;
  isPresenter: boolean;
  onStopOrLeave: () => void;
  isHandRaised: boolean;
  onToggleHandRaised: () => void;
  captionsEnabled: boolean;
  onToggleCaptions: () => void;
  onSendReaction: (emoji: string) => void;
  onToggleMeetingInfo: () => void;
  onOpenPermissionPrompt: () => void;
  onOpenPresentModal: () => void;
}

const REACTION_EMOJIS = ['💖', '👍', '🎉', '👏', '😂', '😮', '😢', '🔥'];

export default function FloatingControlBar({
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
  isParticipantsOpen,
  onToggleParticipants,
  participantCount,
  isChatOpen,
  onToggleChat,
  chatCount,
  isDrawerOpen,
  onToggleDrawer,
  canEdit,
  isRunning,
  onRunCode,
  isPresenter,
  onStopOrLeave,
  isHandRaised,
  onToggleHandRaised,
  captionsEnabled,
  onToggleCaptions,
  onSendReaction,
  onToggleMeetingInfo,
  onOpenPermissionPrompt,
  onOpenPresentModal,
}: FloatingControlBarProps) {
  const [showMicMenu, setShowMicMenu] = useState(false);
  const [showCamMenu, setShowCamMenu] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [selectedMic, setSelectedMic] = useState('Microphone (Realtek(R) Audio)');
  const [selectedCam, setSelectedCam] = useState('Integrated Camera (1080p)');

  const micList = [
    'Microphone (Realtek(R) Audio)',
    'Headset Microphone (Hands-Free AG Audio)',
    'Default - System Audio Capture',
  ];

  const camList = [
    'Integrated Camera (1080p)',
    'External HD USB Webcam',
    'OBS Virtual Camera',
  ];

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 select-none pointer-events-auto">
      {/* Left empty spacer for balance */}
      <div className="hidden md:flex items-center gap-2 min-w-[200px]" />

      {/* Center Meet/Discord Pill Control Bar */}
      <div className="flex items-center gap-2 bg-[#1e1e1e]/90 backdrop-blur-md px-3 py-2 rounded-full border border-slate-700/60 shadow-2xl">
        {/* 1. Mic Button with Chevron (Red when muted) */}
        <div className="relative flex items-center">
          <div
            className={`flex items-center rounded-full transition-all ${
              micOn
                ? 'bg-[#3c4043] text-white hover:bg-[#474b4f]'
                : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
            }`}
          >
            <button
              type="button"
              onClick={onToggleMic}
              className="p-3 rounded-l-full flex items-center justify-center transition-colors"
              title={micOn ? 'Turn off microphone' : 'Turn on microphone'}
            >
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMicMenu(!showMicMenu);
                setShowCamMenu(false);
                setShowReactionMenu(false);
                setShowMoreMenu(false);
              }}
              className="pr-2.5 pl-1 py-3 rounded-r-full hover:bg-black/20 text-slate-200 transition-colors"
              title="Microphone settings"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mic Device Menu */}
          {showMicMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMicMenu(false)} />
              <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#282a2d] border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-700/60 mb-1">
                  <Volume2 className="w-3 h-3 text-violet-400" /> Audio Input
                </div>
                {micList.map((mic) => (
                  <button
                    key={mic}
                    type="button"
                    onClick={() => {
                      setSelectedMic(mic);
                      setShowMicMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      selectedMic === mic ? 'bg-[#3c4043] text-white font-semibold' : 'text-slate-300 hover:bg-[#333538]'
                    }`}
                  >
                    <span className="truncate">{mic}</span>
                    {selectedMic === mic && <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setShowMicMenu(false);
                    onOpenPermissionPrompt();
                  }}
                  className="w-full mt-1.5 pt-1.5 border-t border-slate-700 text-[10px] text-violet-300 hover:text-violet-200 text-center font-medium"
                >
                  Test Audio & Permissions ↗
                </button>
              </div>
            </>
          )}
        </div>

        {/* 2. Cam Button with Chevron (Red/Slate when off) */}
        <div className="relative flex items-center">
          <div
            className={`flex items-center rounded-full transition-all ${
              camOn
                ? 'bg-[#3c4043] text-white hover:bg-[#474b4f]'
                : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
            }`}
          >
            <button
              type="button"
              onClick={onToggleCam}
              className="p-3 rounded-l-full flex items-center justify-center transition-colors"
              title={camOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCamMenu(!showCamMenu);
                setShowMicMenu(false);
                setShowReactionMenu(false);
                setShowMoreMenu(false);
              }}
              className="pr-2.5 pl-1 py-3 rounded-r-full hover:bg-black/20 text-slate-200 transition-colors"
              title="Camera settings"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cam Device Menu */}
          {showCamMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCamMenu(false)} />
              <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#282a2d] border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-700/60 mb-1">
                  <Camera className="w-3 h-3 text-violet-400" /> Video Camera
                </div>
                {camList.map((cam) => (
                  <button
                    key={cam}
                    type="button"
                    onClick={() => {
                      setSelectedCam(cam);
                      setShowCamMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      selectedCam === cam ? 'bg-[#3c4043] text-white font-semibold' : 'text-slate-300 hover:bg-[#333538]'
                    }`}
                  >
                    <span className="truncate">{cam}</span>
                    {selectedCam === cam && <Check className="w-3 h-3 text-emerald-400 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 3. Present Action Button (Opens modal with choices: Screen, Window, Tab, Workspace, Code) */}
        {!isPresenter ? (
          <button
            type="button"
            onClick={onOpenPresentModal}
            className="px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 transition-all"
            title="Present (Entire Screen, Window, Workspace, Code)"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Present</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopOrLeave}
            className="px-3.5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-900/30 transition-all"
            title="Stop Presenting"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Stop Share</span>
          </button>
        )}

        {/* Run Code Action Button (when can edit) */}
        {canEdit && (
          <button
            type="button"
            onClick={onRunCode}
            disabled={isRunning}
            className="px-3.5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all disabled:opacity-50"
            title="Run Code with stdin"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span className="hidden sm:inline">Run</span>
          </button>
        )}

        {/* 4. Emoji Reaction Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowReactionMenu(!showReactionMenu);
              setShowMicMenu(false);
              setShowCamMenu(false);
              setShowMoreMenu(false);
            }}
            className="p-3 rounded-full bg-[#3c4043] text-white hover:bg-[#474b4f] transition-all"
            title="Send a reaction"
          >
            <Smile className="w-4 h-4" />
          </button>

          {showReactionMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowReactionMenu(false)} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#282a2d] border border-slate-700 rounded-full shadow-2xl z-50 px-3 py-2 flex items-center gap-2 text-lg animate-in zoom-in-90 duration-150">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onSendReaction(emoji);
                      setShowReactionMenu(false);
                    }}
                    className="p-1 hover:scale-130 transition-transform active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 5. Captions ("CC") Toggle */}
        <button
          type="button"
          onClick={onToggleCaptions}
          className={`p-3 rounded-full transition-all ${
            captionsEnabled
              ? 'bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa]'
              : 'bg-[#3c4043] text-white hover:bg-[#474b4f]'
          }`}
          title={captionsEnabled ? 'Turn off captions' : 'Turn on captions (CC)'}
        >
          <Subtitles className="w-4 h-4" />
        </button>

        {/* 6. Raise Hand Button */}
        <button
          type="button"
          onClick={onToggleHandRaised}
          className={`p-3 rounded-full transition-all ${
            isHandRaised
              ? 'bg-[#fbc02d] text-[#202124] hover:bg-[#fdd835]'
              : 'bg-[#3c4043] text-white hover:bg-[#474b4f]'
          }`}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* 7. Input/Output Drawer Toggle */}
        <button
          type="button"
          onClick={onToggleDrawer}
          className={`p-3 rounded-full transition-all ${
            isDrawerOpen
              ? 'bg-violet-600 text-white shadow-md'
              : 'bg-[#3c4043] text-white hover:bg-[#474b4f]'
          }`}
          title={isDrawerOpen ? 'Close Stdin & Output Console' : 'Open Stdin & Output Console'}
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* 8. More Options ("⋯") */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowMoreMenu(!showMoreMenu);
              setShowMicMenu(false);
              setShowCamMenu(false);
              setShowReactionMenu(false);
            }}
            className="p-3 rounded-full bg-[#3c4043] text-white hover:bg-[#474b4f] transition-all"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
              <div className="absolute bottom-full right-0 mb-3 w-56 bg-[#282a2d] border border-slate-700 rounded-2xl shadow-2xl z-50 p-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onToggleMeetingInfo();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-[#3c4043] flex items-center gap-2 transition-colors"
                >
                  <Info className="w-4 h-4 text-slate-400" />
                  <span>Meeting details</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenPermissionPrompt();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-[#3c4043] flex items-center gap-2 transition-colors"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Permissions & Device settings</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 9. End Call / Leave Button (Red button) */}
        <button
          type="button"
          onClick={onStopOrLeave}
          className="p-3.5 rounded-full bg-[#ea4335] text-white hover:bg-[#d93025] shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center"
          title={isPresenter ? 'Stop Live Code Casting' : 'Leave Fullscreen Call'}
        >
          {isPresenter ? <Square className="w-4 h-4 fill-white" /> : <PhoneOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom-Right Cluster: Info, Participants, Chat, Security */}
      <div className="flex items-center gap-2 justify-end min-w-[200px]">
        {/* Info Icon Button */}
        <button
          type="button"
          onClick={onToggleMeetingInfo}
          className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Meeting details"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* Participants Toggle Icon */}
        <button
          type="button"
          onClick={onToggleParticipants}
          className={`relative p-2.5 rounded-full transition-colors ${
            isParticipantsOpen ? 'bg-violet-600/30 text-violet-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Participants"
        >
          <Users className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#1a73e8] text-white">
            {participantCount}
          </span>
        </button>

        {/* Room Chat Toggle Icon */}
        <button
          type="button"
          onClick={onToggleChat}
          className={`relative p-2.5 rounded-full transition-colors ${
            isChatOpen ? 'bg-violet-600/30 text-violet-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Chat with everyone"
        >
          <MessageSquare className="w-5 h-5" />
          {chatCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ea4335] text-white">
              {chatCount}
            </span>
          )}
        </button>

        {/* Security / Host Lock Controls */}
        <button
          type="button"
          onClick={onToggleMeetingInfo}
          className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Host safety & controls"
        >
          <Shield className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
