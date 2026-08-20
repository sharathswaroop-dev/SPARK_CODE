'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomParticipant, WebRTCSignalMessage } from '@/types/live-casting';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

interface UseWebRTCOptions {
  groupId: string;
  currentUserId: string;
  participants: RoomParticipant[];
  presenterId: string | null;
  onScreenShareEnded?: () => void;
}

export interface RemoteParticipantMedia {
  audioStream?: MediaStream;
  videoStream?: MediaStream;
  screenStream?: MediaStream;
}

export function useWebRTC({
  groupId,
  currentUserId,
  participants,
  presenterId,
  onScreenShareEnded,
}: UseWebRTCOptions) {
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(null);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, RemoteParticipantMedia>>(new Map());
  const [remoteScreenStream, setRemoteScreenStream] = useState<MediaStream | null>(null);
  const [isSpeakingLocally, setIsSpeakingLocally] = useState(false);

  // References
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const negotiatedPeersRef = useRef<Set<string>>(new Set());

  const localAudioTrackRef = useRef<MediaStreamTrack | null>(null);
  const localVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const localScreenTrackRef = useRef<MediaStreamTrack | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speakingCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persistent audio elements for remote audio playback
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Send WebRTC signal helper
  const sendSignal = useCallback(
    async (toUserId: string, signal: WebRTCSignalMessage['signal']) => {
      if (!toUserId || toUserId === currentUserId) return;
      try {
        await fetch(`/api/groups/${groupId}/presentation/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toUserId, signal }),
        });
      } catch (err) {
        console.error('Failed to send WebRTC signal:', err);
      }
    },
    [groupId, currentUserId]
  );

  // Speaking detection on local microphone with background keep-alive
  const setupSpeakingDetection = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      // Keep-alive silent node to prevent browser from freezing audio rendering in background
      try {
        const osc = audioCtx.createOscillator();
        const silentGain = audioCtx.createGain();
        silentGain.gain.value = 0.00001; // virtually inaudible keep-alive signal
        osc.connect(silentGain);
        silentGain.connect(audioCtx.destination);
        osc.start();
      } catch {
        // Non-critical fallback
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      if (speakingCheckIntervalRef.current) clearInterval(speakingCheckIntervalRef.current);

      speakingCheckIntervalRef.current = setInterval(() => {
        // Auto-resume if suspended when switching windows
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const average = sum / buffer.length;
        const speaking = average > 14;
        setIsSpeakingLocally(speaking);
      }, 150);
    } catch {
      // AudioContext initialization fallback
    }
  }, []);

  const cleanupSpeakingDetection = useCallback(() => {
    if (speakingCheckIntervalRef.current) {
      clearInterval(speakingCheckIntervalRef.current);
      speakingCheckIntervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsSpeakingLocally(false);
  }, []);

  // Attach active local tracks to a peer connection
  const attachLocalTracksToPeer = useCallback((pc: RTCPeerConnection) => {
    const senders = pc.getSenders();
    const existingTrackIds = senders.map((s) => s.track?.id).filter(Boolean);

    if (localAudioTrackRef.current && !existingTrackIds.includes(localAudioTrackRef.current.id)) {
      pc.addTrack(localAudioTrackRef.current, new MediaStream([localAudioTrackRef.current]));
    }
    if (localVideoTrackRef.current && !existingTrackIds.includes(localVideoTrackRef.current.id)) {
      pc.addTrack(localVideoTrackRef.current, new MediaStream([localVideoTrackRef.current]));
    }
    if (localScreenTrackRef.current && !existingTrackIds.includes(localScreenTrackRef.current.id)) {
      pc.addTrack(localScreenTrackRef.current, new MediaStream([localScreenTrackRef.current]));
    }
  }, []);

  // Play remote audio through dedicated HTMLAudioElement
  const playRemoteAudio = useCallback((remoteUserId: string, stream: MediaStream) => {
    try {
      let audioEl = remoteAudioElementsRef.current.get(remoteUserId);
      if (!audioEl) {
        audioEl = new Audio();
        audioEl.autoplay = true;
        audioEl.setAttribute('playsinline', '');
        remoteAudioElementsRef.current.set(remoteUserId, audioEl);
      }
      audioEl.srcObject = stream;
      audioEl.play().catch((e) => {
        console.warn('Audio auto-play waiting for user interaction:', e);
      });
    } catch (e) {
      console.warn('Remote audio playback error:', e);
    }
  }, []);

  const presenterIdRef = useRef(presenterId);
  useEffect(() => {
    presenterIdRef.current = presenterId;
    if (presenterId) {
      setRemoteStreams((prev) => {
        const presenterMedia = prev.get(presenterId);
        if (presenterMedia) {
          if (presenterMedia.screenStream) {
            setRemoteScreenStream(presenterMedia.screenStream);
          } else if (presenterMedia.videoStream) {
            setRemoteScreenStream(presenterMedia.videoStream);
          }
        }
        return prev;
      });
    }
  }, [presenterId]);

  // Create or get RTCPeerConnection for a peer
  const getOrCreatePeerConnection = useCallback(
    (remoteUserId: string): RTCPeerConnection => {
      let pc = peerConnectionsRef.current.get(remoteUserId);
      if (pc && pc.connectionState !== 'closed') {
        return pc;
      }

      pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current.set(remoteUserId, pc);

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal(remoteUserId, {
            type: 'candidate',
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // Handle incoming Remote Tracks
      pc.ontrack = (event) => {
        const [incomingStream] = event.streams;
        const track = event.track;
        const stream = incomingStream || new MediaStream([track]);

        setRemoteStreams((prev) => {
          const next = new Map(prev);
          const currentMedia = next.get(remoteUserId) || {};

          if (track.kind === 'audio') {
            currentMedia.audioStream = stream;
            playRemoteAudio(remoteUserId, stream);
          } else if (track.kind === 'video') {
            const isScreen =
              track.label.toLowerCase().includes('screen') ||
              track.label.toLowerCase().includes('display') ||
              track.label.toLowerCase().includes('window') ||
              track.label.toLowerCase().includes('tab') ||
              remoteUserId === presenterIdRef.current;

            if (isScreen) {
              currentMedia.screenStream = stream;
              setRemoteScreenStream(stream);
            } else {
              currentMedia.videoStream = stream;
            }
          }

          next.set(remoteUserId, currentMedia);
          return next;
        });
      };

      // Attach existing local tracks
      attachLocalTracksToPeer(pc);

      return pc;
    },
    [sendSignal, attachLocalTracksToPeer, playRemoteAudio]
  );

  // Send Offer to a peer
  const initiateOffer = useCallback(
    async (remoteUserId: string) => {
      const pc = getOrCreatePeerConnection(remoteUserId);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal(remoteUserId, {
          type: 'offer',
          sdp: offer.sdp,
        });
        negotiatedPeersRef.current.add(remoteUserId);
      } catch (err) {
        console.warn('Error initiating offer to', remoteUserId, err);
      }
    },
    [getOrCreatePeerConnection, sendSignal]
  );

  // Auto-recover audio and resume AudioContext on window focus/tab visibility change
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      // Ensure all remote audio elements keep playing across app/window switches
      remoteAudioElementsRef.current.forEach((audioEl) => {
        if (audioEl.paused && audioEl.srcObject) {
          audioEl.play().catch(() => {});
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('blur', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('blur', handleVisibilityOrFocus);
    };
  }, []);

  // Toggle Microphone
  const setMicEnabled = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      try {
        if (enabled) {
          if (!localAudioTrackRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
            const track = stream.getAudioTracks()[0];
            localAudioTrackRef.current = track;
            setLocalAudioStream(stream);
            setupSpeakingDetection(stream);

            // Add track to all active peer connections & renegotiate
            peerConnectionsRef.current.forEach((pc, remoteUserId) => {
              pc.addTrack(track, stream);
              initiateOffer(remoteUserId);
            });
          } else {
            localAudioTrackRef.current.enabled = true;
          }
          return true;
        } else {
          if (localAudioTrackRef.current) {
            localAudioTrackRef.current.enabled = false;
          }
          setIsSpeakingLocally(false);
          return false;
        }
      } catch (err) {
        console.warn('Microphone access denied or unavailable:', err);
        return false;
      }
    },
    [setupSpeakingDetection, initiateOffer]
  );

  // Toggle Camera
  const setCamEnabled = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      try {
        if (enabled) {
          if (!localVideoTrackRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            const track = stream.getVideoTracks()[0];
            localVideoTrackRef.current = track;
            setLocalVideoStream(stream);

            // Add track to all active peer connections & renegotiate
            peerConnectionsRef.current.forEach((pc, remoteUserId) => {
              pc.addTrack(track, stream);
              initiateOffer(remoteUserId);
            });
          } else {
            localVideoTrackRef.current.enabled = true;
          }
          return true;
        } else {
          if (localVideoTrackRef.current) {
            localVideoTrackRef.current.enabled = false;
            localVideoTrackRef.current.stop();
            localVideoTrackRef.current = null;
            setLocalVideoStream(null);
          }
          return false;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        return false;
      }
    },
    [initiateOffer]
  );

  // Start Screen Sharing
  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        } as MediaTrackConstraints,
        audio: true,
      });

      const track = stream.getVideoTracks()[0];
      localScreenTrackRef.current = track;
      setLocalScreenStream(stream);

      track.onended = () => {
        stopScreenShare();
        if (onScreenShareEnded) {
          onScreenShareEnded();
        }
      };

      // Add screen track to all peer connections and initiate offer
      peerConnectionsRef.current.forEach((pc, remoteUserId) => {
        pc.addTrack(track, stream);
        initiateOffer(remoteUserId);
      });

      return stream;
    } catch (err) {
      console.warn('Screen share cancelled or rejected:', err);
      return null;
    }
  }, [initiateOffer, onScreenShareEnded]);

  // Stop Screen Sharing
  const stopScreenShare = useCallback(() => {
    if (localScreenTrackRef.current) {
      localScreenTrackRef.current.stop();
      localScreenTrackRef.current = null;
    }
    setLocalScreenStream(null);

    peerConnectionsRef.current.forEach((pc) => {
      const senders = pc.getSenders();
      senders.forEach((sender) => {
        if (sender.track && sender.track.kind === 'video' && sender.track !== localVideoTrackRef.current) {
          pc.removeTrack(sender);
        }
      });
    });
  }, []);

  // Process incoming WebRTC signals
  const processSignals = useCallback(
    async (signals: WebRTCSignalMessage[]) => {
      for (const msg of signals) {
        if (msg.toUserId !== currentUserId) continue;
        const pc = getOrCreatePeerConnection(msg.fromUserId);

        try {
          if (msg.signal.type === 'offer' && msg.signal.sdp) {
            await pc.setRemoteDescription(
              new RTCSessionDescription({ type: 'offer', sdp: msg.signal.sdp })
            );

            // Drain queued ICE candidates
            const queued = pendingIceCandidatesRef.current.get(msg.fromUserId) || [];
            for (const cand of queued) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
            pendingIceCandidatesRef.current.set(msg.fromUserId, []);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal(msg.fromUserId, {
              type: 'answer',
              sdp: answer.sdp,
            });
          } else if (msg.signal.type === 'answer' && msg.signal.sdp) {
            await pc.setRemoteDescription(
              new RTCSessionDescription({ type: 'answer', sdp: msg.signal.sdp })
            );

            // Drain queued ICE candidates
            const queued = pendingIceCandidatesRef.current.get(msg.fromUserId) || [];
            for (const cand of queued) {
              await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
            }
            pendingIceCandidatesRef.current.set(msg.fromUserId, []);
          } else if (msg.signal.type === 'candidate' && msg.signal.candidate) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.signal.candidate)).catch(() => {});
            } else {
              // Queue candidate until remote description is set
              const list = pendingIceCandidatesRef.current.get(msg.fromUserId) || [];
              list.push(msg.signal.candidate);
              pendingIceCandidatesRef.current.set(msg.fromUserId, list);
            }
          }
        } catch (err) {
          console.warn('Error handling WebRTC signal from', msg.fromUserId, err);
        }
      }
    },
    [currentUserId, getOrCreatePeerConnection, sendSignal]
  );

  // Connect to peers as participants join (guarded against spam offers)
  useEffect(() => {
    participants.forEach((p) => {
      if (!p.userId || p.userId === currentUserId) return;

      getOrCreatePeerConnection(p.userId);
      const isAlreadyNegotiated = negotiatedPeersRef.current.has(p.userId);

      // Presenter or deterministic lower userId initiates offer once
      const shouldOffer = currentUserId === presenterId || currentUserId < p.userId;
      if (shouldOffer && !isAlreadyNegotiated) {
        initiateOffer(p.userId);
      }
    });
  }, [participants, currentUserId, presenterId, getOrCreatePeerConnection, initiateOffer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSpeakingDetection();
      if (localAudioTrackRef.current) localAudioTrackRef.current.stop();
      if (localVideoTrackRef.current) localVideoTrackRef.current.stop();
      if (localScreenTrackRef.current) localScreenTrackRef.current.stop();

      remoteAudioElementsRef.current.forEach((el) => {
        el.srcObject = null;
        el.remove();
      });
      remoteAudioElementsRef.current.clear();

      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      negotiatedPeersRef.current.clear();
      pendingIceCandidatesRef.current.clear();
    };
  }, [cleanupSpeakingDetection]);

  return {
    localAudioStream,
    localVideoStream,
    localScreenStream,
    remoteStreams,
    remoteScreenStream,
    isSpeakingLocally,
    setMicEnabled,
    setCamEnabled,
    startScreenShare,
    stopScreenShare,
    processSignals,
  };
}
