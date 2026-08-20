'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Swords,
  Users,
  Shield,
  Loader2,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Flame,
  Radio
} from 'lucide-react';

interface MatchmakingModalProps {
  isOpen: boolean;
  mode: '1v1' | '3v3' | 'team';
  difficulty: 'All' | 'Easy' | 'Medium' | 'Hard';
  onClose: () => void;
}

export function MatchmakingModal({
  isOpen,
  mode,
  difficulty,
  onClose,
}: MatchmakingModalProps) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [mmrWindow, setMmrWindow] = useState(100);
  const [currentMmr, setCurrentMmr] = useState(1200);
  const [matchFound, setMatchFound] = useState(false);
  const [matchedRoomId, setMatchedRoomId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState('');

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and join queue
  useEffect(() => {
    if (!isOpen) return;

    setSeconds(0);
    setMatchFound(false);
    setMatchedRoomId(null);
    setCountdown(3);
    setError('');

    // 1. Join queue
    const joinQueue = async () => {
      try {
        const res = await fetch('/api/battles/matchmaking/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, difficulty }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to join matchmaking queue');
          return;
        }
        if (data.mmr) setCurrentMmr(data.mmr);
        if (data.status === 'MATCHED' && data.matchedRoomId) {
          triggerMatchFound(data.matchedRoomId);
        }
      } catch (e: any) {
        setError(e.message || 'Connection error');
      }
    };

    joinQueue();

    // 2. Start search elapsed timer
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // 3. Poll status every 2 seconds
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/battles/matchmaking/status');
        if (res.ok) {
          const data = await res.json();
          if (data.mmrWindow) setMmrWindow(data.mmrWindow);
          if (data.currentMmr) setCurrentMmr(data.currentMmr);
          if (data.status === 'MATCHED' && data.matchedRoomId) {
            triggerMatchFound(data.matchedRoomId);
          }
        }
      } catch {}
    }, 2000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, mode, difficulty]);

  // Match found countdown handler
  const triggerMatchFound = (roomId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setMatchFound(true);
    setMatchedRoomId(roomId);

    let count = 3;
    const countInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countInterval);
        router.push(`/battles/${roomId}`);
      }
    }, 1000);
  };

  const handleCancel = async () => {
    try {
      await fetch('/api/battles/matchmaking/cancel', { method: 'POST' });
    } catch {}
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  if (!isOpen) return null;

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-indigo-500/30 p-6 text-white shadow-2xl text-center">
        
        {/* Glow orb */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              <Radio className="w-3 h-3 text-indigo-400 animate-pulse" /> Ranked Queue
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              ⭐ {currentMmr} MMR
            </span>
          </div>

          {!matchFound && (
            <button
              onClick={handleCancel}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cancel Matchmaking"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="py-8 relative z-10 space-y-6">
          {!matchFound ? (
            /* SEARCHING RADAR STATE */
            <>
              {/* Radar Sonar Pulse */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-36 h-36 rounded-full border border-indigo-500/30 flex items-center justify-center relative">
                  {/* Expanding rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/40 animate-ping opacity-75" />
                  <div className="w-24 h-24 rounded-full border border-indigo-400/50 flex items-center justify-center bg-indigo-900/30">
                    <Swords className="w-10 h-10 text-indigo-400 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Title & Mode */}
              <div className="space-y-1">
                <h2 className="text-xl font-black tracking-wide text-white uppercase">
                  {mode === '1v1' ? '1v1 Quick Match' : '3v3 Squad War'}
                </h2>
                <p className="text-xs text-indigo-300 font-medium">
                  Searching for worthy rivals...
                </p>
              </div>

              {/* Timer & MMR Window Info */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-around">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Elapsed Time</div>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                    {formatTimer(seconds)}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Search Window</div>
                  <div className="text-xs font-black font-mono text-amber-400 mt-1">
                    ±{mmrWindow} MMR
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-xs transition border border-slate-700 shadow-md"
              >
                Cancel Search
              </button>
            </>
          ) : (
            /* MATCH FOUND! CELEBRATION STATE */
            <div className="space-y-6 py-2 animate-in zoom-in-90 duration-300">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  ⚡ Rival Found!
                </span>
                <h2 className="text-2xl font-black text-white mt-2">MATCH READY</h2>
              </div>

              {/* Matchup Banner */}
              <div className="grid grid-cols-3 items-center gap-2 p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
                <div className="space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 border border-indigo-400 flex items-center justify-center mx-auto text-sm font-black shadow-lg shadow-indigo-600/30">
                    YOU
                  </div>
                  <div className="text-[11px] font-bold text-slate-300 truncate">Your Squad</div>
                  <div className="text-[9px] font-bold text-amber-400">Team Red</div>
                </div>

                <div className="text-center font-black text-xl text-amber-400 italic">
                  VS
                </div>

                <div className="space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 border border-blue-400 flex items-center justify-center mx-auto text-sm font-black shadow-lg shadow-blue-600/30">
                    RIVAL
                  </div>
                  <div className="text-[11px] font-bold text-slate-300 truncate">Challengers</div>
                  <div className="text-[9px] font-bold text-blue-400">Team Blue</div>
                </div>
              </div>

              {/* Big Countdown */}
              <div className="space-y-1">
                <div className="text-3xl font-black text-emerald-400 font-mono animate-bounce">
                  {countdown > 0 ? countdown : 'GO!'}
                </div>
                <p className="text-[11px] text-slate-400">Entering Battle Stadium...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
