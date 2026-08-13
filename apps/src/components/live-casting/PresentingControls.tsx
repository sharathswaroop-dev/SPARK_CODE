'use client';

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  Radio,
  Square,
  ChevronDown,
  Volume2,
  Camera,
  Check,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { PresentationType } from '@/types/live-casting';

interface PresentingControlsProps {
  isPresenter: boolean;
  canEdit: boolean;
  presentationType?: PresentationType;
  presentationTitle?: string | null;
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onOpenPresentModal: () => void;
  onStopPresenting: () => void;
  onEnterFullscreen: () => void;
  isStarting?: boolean;
  isStopping?: boolean;
}

export default function PresentingControls({
  isPresenter,
  canEdit,
  presentationType = 'none',
  presentationTitle,
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
  onOpenPresentModal,
  onStopPresenting,
  onEnterFullscreen,
  isStarting = false,
  isStopping = false,
}: PresentingControlsProps) {
  const [showMicDevices, setShowMicDevices] = useState(false);
  const [showCamDevices, setShowCamDevices] = useState(false);
  const [selectedMic, setSelectedMic] = useState('Default - Microphone (Realtek(R) Audio)');
  const [selectedCam, setSelectedCam] = useState('Default - HD Web Camera');

  const micOptions = [
    'Default - Microphone (Realtek(R) Audio)',
    'Communications - Headset Microphone',
    'USB Audio Device / External Mic',
  ];

  const camOptions = [
    'Default - HD Web Camera',
    'Integrated Front Camera (1080p)',
    'OBS Virtual Camera',
  ];

  return (
    <div className="card p-4 space-y-3.5 border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Radio className={`w-3.5 h-3.5 ${isPresenter ? 'text-emerald-400 animate-pulse' : 'text-violet-400'}`} />
          Room Presentation
        </h3>
        {isPresenter && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            PRESENTING
          </span>
        )}
      </div>

      {/* Mic & Cam Controls with Device Selection Chevrons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Mic Control */}
        <div className="relative">
          <div className="flex items-center rounded-xl overflow-hidden border transition-all">
            <button
              type="button"
              onClick={onToggleMic}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 font-bold text-xs transition-all ${
                micOn
                  ? 'bg-slate-900 text-slate-200 hover:bg-slate-800 border-r border-slate-800'
                  : 'bg-rose-950/80 text-rose-300 hover:bg-rose-900 border-r border-rose-900/60'
              }`}
              title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-rose-400" />}
              <span className="truncate">{micOn ? 'Mic On' : 'Muted'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMicDevices(!showMicDevices);
                setShowCamDevices(false);
              }}
              className={`px-1.5 py-2 transition-colors flex items-center justify-center ${
                micOn ? 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'bg-rose-950/80 text-rose-400 hover:bg-rose-900'
              }`}
              title="Select Microphone Device"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mic Device Selector Dropdown */}
          {showMicDevices && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMicDevices(false)} />
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 p-1.5 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-800 mb-1">
                  <Volume2 className="w-3 h-3 text-violet-400" /> Select Microphone
                </div>
                {micOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedMic(opt);
                      setShowMicDevices(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedMic === opt ? 'bg-violet-950 text-violet-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {selectedMic === opt && <Check className="w-3 h-3 text-violet-400 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cam Control */}
        <div className="relative">
          <div className="flex items-center rounded-xl overflow-hidden border transition-all">
            <button
              type="button"
              onClick={onToggleCam}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 font-bold text-xs transition-all ${
                camOn
                  ? 'bg-slate-900 text-slate-200 hover:bg-slate-800 border-r border-slate-800'
                  : 'bg-rose-950/80 text-rose-300 hover:bg-rose-900 border-r border-rose-900/60'
              }`}
              title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {camOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-rose-400" />}
              <span className="truncate">{camOn ? 'Cam On' : 'Cam Off'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCamDevices(!showCamDevices);
                setShowMicDevices(false);
              }}
              className={`px-1.5 py-2 transition-colors flex items-center justify-center ${
                camOn ? 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'bg-rose-950/80 text-rose-400 hover:bg-rose-900'
              }`}
              title="Select Camera Device"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cam Device Selector Dropdown */}
          {showCamDevices && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowCamDevices(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 p-1.5 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-b border-slate-800 mb-1">
                  <Camera className="w-3 h-3 text-violet-400" /> Select Camera
                </div>
                {camOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedCam(opt);
                      setShowCamDevices(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedCam === opt ? 'bg-violet-950 text-violet-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {selectedCam === opt && <Check className="w-3 h-3 text-violet-400 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Actions: Present Button (triggers choices) & Fullscreen Mode */}
      <div className="space-y-2 pt-1">
        {isPresenter ? (
          <button
            type="button"
            onClick={onStopPresenting}
            disabled={isStopping}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 transition-all shadow-sm"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Presenting ({presentationTitle || 'Screen'})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenPresentModal}
            disabled={isStarting}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-md shadow-violet-600/20 transition-all"
          >
            <Monitor className="w-4 h-4" />
            <span>Present (Screen, Window, Code)</span>
          </button>
        )}

        {/* Enter Fullscreen */}
        <button
          type="button"
          onClick={onEnterFullscreen}
          className="w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5 text-violet-400" />
          Fullscreen Presentation Room
        </button>
      </div>
    </div>
  );
}
