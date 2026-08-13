'use client';

import React, { use, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Editor from '@monaco-editor/react';
import { 
  Users, ChevronLeft, Calendar, Loader2, AlertCircle, Plus, 
  ClipboardList, CheckCircle, Flame, Eye, Video, VideoOff, 
  Play, Terminal, Mic, MicOff, MessageSquare, Send, Radio,
  Maximize2, Code2, Copy, Check
} from 'lucide-react';
import { RoomState, RoomChatMessage, PresentationType } from '@/types/live-casting';
import RoomInputPanel from '@/components/live-casting/RoomInputPanel';
import PresentingControls from '@/components/live-casting/PresentingControls';
import ParticipantsList from '@/components/live-casting/ParticipantsList';
import RoomChat from '@/components/live-casting/RoomChat';
import FullscreenRoomShell from '@/components/live-casting/FullscreenRoomShell';
import PresentationStage from '@/components/live-casting/PresentationStage';
import PresentModal from '@/components/live-casting/PresentModal';
import SparkCodeWorkspaceStage from '@/components/live-casting/SparkCodeWorkspaceStage';
import WhatsAppGroupChat from '@/components/live-casting/WhatsAppGroupChat';
import { useWebRTC } from '@/hooks/use-webrtc';

interface GroupDetails {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  members: {
    id: string;
    role: 'LEADER' | 'MEMBER';
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      tier: string;
    };
  }[];
  tasks: {
    id: string;
    title: string;
    problemId?: string | null;
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
    dueDate?: string | null;
    assignee?: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
  }[];
}

interface GroupMessageItem {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ProblemsMinList {
  id: string;
  slug: string;
  title: string;
}

export default function GroupWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [data, setData] = useState<{ group: GroupDetails; userRole: 'LEADER' | 'MEMBER' } | null>(null);
  const [problems, setProblems] = useState<ProblemsMinList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation tabs: 'tasks' | 'live' | 'chat'
  const [activeTab, setActiveTab] = useState<'tasks' | 'live' | 'chat'>('tasks');

  // Task creation fields
  const [title, setTitle] = useState('');
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Live Casting state variables
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [roomChatMessages, setRoomChatMessages] = useState<RoomChatMessage[]>([]);
  const [roomStdin, setRoomStdin] = useState('');
  const [presenterId, setPresenterId] = useState<string | null>(null);
  const [presenterName, setPresenterName] = useState<string | null>(null);
  const [liveLanguage, setLiveLanguage] = useState('python');
  const [liveCode, setLiveCode] = useState('');
  const [liveRunning, setLiveRunning] = useState(false);
  const [liveStdout, setLiveStdout] = useState('');
  const [liveStderr, setLiveStderr] = useState('');
  const [liveExitCode, setLiveExitCode] = useState<number | null>(null);
  const [liveError, setLiveError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [isStartingPresentation, setIsStartingPresentation] = useState(false);
  const [isStoppingPresentation, setIsStoppingPresentation] = useState(false);

  const [showWindowedPresentModal, setShowWindowedPresentModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // WebRTC Hook for real peer-to-peer Voice, Video & Screen Sharing
  const webrtc = useWebRTC({
    groupId: resolvedParams.id,
    currentUserId: session?.user?.id || '',
    participants: roomState?.participants || [],
    presenterId: roomState?.presenterId || null,
    onScreenShareEnded: () => {
      stopPresenting();
    },
  });

  // WebRTC Video/Audio Chat state for Header Quick Toggle
  const [videoActive, setVideoActive] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // In-group text chat state (Group Chat tab)
  const [messages, setMessages] = useState<GroupMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Refs for debouncing live code updates
  const codeRef = useRef(liveCode);
  const langRef = useRef(liveLanguage);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchGroupWorkspace();
    fetchProblemsList();
    fetchMessages();
  }, [resolvedParams.id]);

  // Handle live watch, presence heartbeat & WebRTC signaling polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/groups/${resolvedParams.id}/presentation/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            micOn,
            camOn,
            isSpeaking: webrtc.isSpeakingLocally,
          }),
        });
        if (res.ok) {
          const val = await res.json();
          const state: RoomState = val.state;
          setRoomState(state);
          if (val.messages) setRoomChatMessages(val.messages);

          // Process incoming WebRTC signaling messages (offers, answers, candidates)
          if (val.signals && val.signals.length > 0) {
            webrtc.processSignals(val.signals);
          }

          setPresenterId(state.presenterId);
          setPresenterName(state.presenterName);

          const isUserPresenter = state.presenterId === session?.user?.id;
          const isUserEditor = state.editorId === session?.user?.id;
          const canUserEdit = isUserPresenter || isUserEditor;

          // Only sync buffer from remote if user is not the active editor
          if (!canUserEdit) {
            setLiveCode(state.code || '');
            if (state.language) setLiveLanguage(state.language);
            setRoomStdin(state.stdin || '');
          }
        }
      } catch (e) {
        console.error('Failed to poll presentation state', e);
      }

      // Poll group chat messages
      fetchMessagesSilently();
    }, 1200);

    return () => {
      clearInterval(interval);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [resolvedParams.id, session?.user?.id, micOn, camOn, webrtc]);

  const fetchGroupWorkspace = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}`);
      if (!res.ok) throw new Error('Failed to load group details.');
      const val = await res.json();
      setData(val);
    } catch (err: any) {
      setError(err.message || 'Error occurred loading group.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProblemsList = async () => {
    try {
      const res = await fetch('/api/problems');
      if (res.ok) {
        const d = await res.json();
        setProblems(d.problems || []);
      }
    } catch (e) {
      console.error('Failed to preload problems list');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/messages`);
      if (res.ok) {
        const d = await res.json();
        setMessages(d.messages || []);
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e) {
      console.error('Failed to load chat messages');
    }
  };

  const fetchMessagesSilently = async () => {
    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/messages`);
      if (res.ok) {
        const d = await res.json();
        setMessages(d.messages || []);
      }
    } catch (_) {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSendingMsg(true);

    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (e) {
      console.error('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSendDirectMessage = async (text: string) => {
    if (!text.trim()) return;
    setSendingMsg(true);

    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      });

      if (res.ok) {
        fetchMessagesSilently();
      }
    } catch (e) {
      console.error('Failed to send direct message', e);
    } finally {
      setSendingMsg(false);
    }
  };

  // Video/Audio Chat controls in top header
  const toggleVideo = async () => {
    if (videoActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setVideoActive(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = mediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
        setVideoActive(true);
      } catch (err: any) {
        alert('Could not access camera/microphone: ' + err.message);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const triggerSaveLiveCode = (codeValue: string, langValue: string) => {
    codeRef.current = codeValue;
    langRef.current = langValue;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/groups/${resolvedParams.id}/presentation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeRef.current, language: langRef.current }),
        });
      } catch (e) {
        console.error('Failed to save live code changes');
      }
    }, 600);
  };

  const handleStdinChange = (val: string) => {
    setRoomStdin(val);
    fetch(`/api/groups/${resolvedParams.id}/presentation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stdin: val }),
    }).catch(console.error);
  };

  const handleToggleMic = async () => {
    const next = !micOn;
    setMicOn(next);
    await webrtc.setMicEnabled(next);
  };

  const handleToggleCam = async () => {
    const next = !camOn;
    setCamOn(next);
    await webrtc.setCamEnabled(next);
  };

  const startPresenting = async (
    type: PresentationType = 'screen',
    title?: string
  ) => {
    setIsStartingPresentation(true);
    try {
      if (type === 'screen' || type === 'window' || type === 'browser-tab') {
        const stream = await webrtc.startScreenShare();
        if (!stream) {
          setIsStartingPresentation(false);
          return;
        }
      }

      const res = await fetch(`/api/groups/${resolvedParams.id}/presentation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentationType: type, presentationTitle: title }),
      });
      const val = await res.json();
      if (!res.ok) throw new Error(val.error || 'Failed to start presenting');

      setRoomState(val);
      setPresenterId(val.presenterId);
      setPresenterName(val.presenterName);
      if (val.code) setLiveCode(val.code);
      if (val.language) setLiveLanguage(val.language);
      if (val.stdin) setRoomStdin(val.stdin);
      setLiveError('');
    } catch (e: any) {
      setLiveError(e.message || 'Could not start presentation.');
    } finally {
      setIsStartingPresentation(false);
    }
  };

  const stopPresenting = async () => {
    setIsStoppingPresentation(true);
    try {
      webrtc.stopScreenShare();
      const res = await fetch(`/api/groups/${resolvedParams.id}/presentation/stop`, { method: 'POST' });
      if (res.ok) {
        setPresenterId(null);
        setPresenterName(null);
        setRoomState((prev) =>
          prev ? { ...prev, presenterId: null, presenterName: null, presentationType: 'none', editorId: null } : null
        );
        setLiveError('');
      }
    } catch (e) {
      console.error('Failed to stop live presentation', e);
    } finally {
      setIsStoppingPresentation(false);
    }
  };

  const handleGrantEdit = async (targetUserId: string) => {
    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/presentation/grant-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: targetUserId }),
      });
      const data = await res.json();
      if (res.ok && data.state) {
        setRoomState(data.state);
      }
    } catch (e) {
      console.error('Failed to grant edit access', e);
    }
  };

  const handleRevokeEdit = async () => {
    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/presentation/revoke-edit`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.state) {
        setRoomState(data.state);
      }
    } catch (e) {
      console.error('Failed to revoke edit access', e);
    }
  };

  const handleSendRoomChat = async (text: string) => {
    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/presentation/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setRoomChatMessages((prev) => [...prev, data.message]);
      }
    } catch (e) {
      console.error('Failed to send room chat message', e);
    }
  };

  const handleRunLiveCode = async () => {
    setLiveRunning(true);
    setLiveError('');

    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/presentation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: liveLanguage, code: liveCode, stdin: roomStdin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');

      if (data.output) {
        setLiveStdout(data.output.stdout || '');
        setLiveStderr(data.output.stderr || '');
        setLiveExitCode(data.output.exitCode);
        setRoomState((prev) => (prev ? { ...prev, lastRunOutput: data.output, isRunning: false } : null));
      }
    } catch (err: any) {
      setLiveError(err.message || 'Failed to run code.');
    } finally {
      setLiveRunning(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskError('');
    setCreatingTask(true);

    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          problemId: selectedProblemId || null,
          assignedTo: assignedTo || null,
          dueDate: dueDate || null,
        }),
      });

      const val = await res.json();
      if (!res.ok) throw new Error(val.error || 'Failed to create task');

      setTitle('');
      setSelectedProblemId('');
      setAssignedTo('');
      setDueDate('');
      fetchGroupWorkspace();
    } catch (err: any) {
      setTaskError(err.message || 'Failed to assign task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, currentStatus: string) => {
    setUpdatingTaskId(taskId);
    let nextStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE' = 'PENDING';
    if (currentStatus === 'PENDING') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'DONE';
    else nextStatus = 'PENDING';

    try {
      const res = await fetch(`/api/groups/${resolvedParams.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to update task');
      fetchGroupWorkspace();
    } catch (err: any) {
      alert(err.message || 'Error updating task.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs">Loading group workspace...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-extrabold text-slate-900">Workspace Access Denied</h2>
        <p className="text-xs text-slate-500 leading-relaxed">{error || 'Group not found'}</p>
        <Link href="/groups" className="btn-primary text-xs inline-flex">
          Back to Groups
        </Link>
      </div>
    );
  }

  const { group, userRole } = data;
  const isLeader = userRole === 'LEADER';
  const isUserPresenter = roomState ? roomState.presenterId === session?.user?.id : presenterId === session?.user?.id;
  const isUserEditor = roomState ? roomState.editorId === session?.user?.id : false;
  const canEdit = Boolean(isUserPresenter || isUserEditor);
  const someoneElsePresenting = Boolean(roomState?.presenterId && !isUserPresenter);

  // Task completion math
  const completedTasksCount = group.tasks.filter((t) => t.status === 'DONE').length;
  const taskProgressPct = group.tasks.length > 0 ? Math.round((completedTasksCount / group.tasks.length) * 100) : 0;

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
      activeTab === 'chat'
        ? 'flex flex-col h-[calc(100vh-64px)] py-3 gap-3 overflow-hidden'
        : 'py-6 space-y-6'
    }`}>
      {/* Top bar & back navigation */}
      <div className="flex items-center justify-between">
        <Link href="/groups" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to groups dashboard
        </Link>

        {/* Video/Audio & Join Live Call controls in top header */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`text-xs h-8 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              activeTab === 'live'
                ? 'bg-violet-600 text-white shadow-violet-900/30'
                : (roomState?.presenterId || (roomState?.participants?.length ?? 0) > 0)
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-900/40 animate-pulse'
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{(roomState?.presenterId || (roomState?.participants?.length ?? 0) > 0) ? '🔴 Join Live Stage' : 'Live Code Casting'}</span>
          </button>

          {videoActive && (
            <button
              onClick={toggleAudio}
              className={`btn-ghost p-1.5 rounded-lg text-xs flex items-center gap-1 font-bold ${
                audioMuted ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'
              }`}
            >
              {audioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={toggleVideo}
            className={`btn-secondary text-xs h-8 px-3 flex items-center gap-1.5 font-bold ${
              videoActive ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            {videoActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            {videoActive ? 'Leave Voice & Video' : 'Join Voice & Video'}
          </button>
        </div>
      </div>

      {/* Header Info — hidden in chat mode to maximise chat height */}
      {activeTab !== 'chat' && (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              {group.name}
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded uppercase">
                {userRole}
              </span>
            </h1>
            <p className="text-xs text-slate-500 max-w-xl">{group.description || 'No description set.'}</p>
          </div>

          {/* Group Invite Code & Copy Room Link */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-2 font-mono md:w-64 shrink-0 shadow-sm">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 font-sans">
              <span>Room Code</span>
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    const url = typeof window !== 'undefined' ? `${window.location.origin}/groups/${group.id}` : group.inviteCode;
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }
                }}
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-sans font-bold transition-colors"
                title="Copy full room invitation link"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied Link' : 'Copy Link'}</span>
              </button>
            </div>
            <div className="font-bold text-slate-900 break-all select-all text-xs">{group.inviteCode}</div>
          </div>
        </div>
      )}

      {/* Local Video Stream Preview — hidden in chat mode */}
      {videoActive && activeTab !== 'chat' && (
        <div className="card p-3 bg-slate-950 border border-slate-800 flex items-center gap-4">
          <div className="w-40 h-28 bg-slate-900 rounded-lg overflow-hidden relative border border-slate-800 shrink-0">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <span className="absolute bottom-1 left-1 bg-slate-950/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
              You (Live Video)
            </span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse" /> Voice & Video Active
            </h4>
            <p className="text-[11px] text-slate-400">
              Connected to room audio/video channel via WebRTC Mesh. Group members can hear and see you!
            </p>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px shrink-0">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-bold text-xs transition-colors ${
            activeTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Group Tasks ({group.tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-bold text-xs transition-colors ${
            activeTab === 'live' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" /> Live Code Casting
          {presenterId && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-4 py-2 border-b-2 font-bold text-xs transition-colors ${
            activeTab === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Group Chat ({messages.length})
        </button>
      </div>

      {/* TAB 1: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Active Live Session Banner */}
          {(roomState?.presenterId || (roomState?.participants?.length ?? 0) > 0) && (
            <div className="p-4 bg-gradient-to-r from-violet-950/90 via-[#18122B]/90 to-indigo-950/90 border border-violet-700/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl text-xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Live Code Casting is Active</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {roomState?.presenterName ? `${roomState.presenterName} is presenting` : `${roomState?.participants?.length || 1} online`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Join current voice, webcam &amp; Monaco live code workspace now.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('live')}
                className="px-4 py-2 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 shadow-lg shadow-violet-900/40 transition-all transform active:scale-95 shrink-0"
              >
                <Video className="w-4 h-4" /> Join Live Stage
              </button>
            </div>
          )}

          {/* Progress bar */}
          <div className="card p-4 space-y-2 border border-slate-200">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Task Completion Progress</span>
              <span>{completedTasksCount} / {group.tasks.length} Completed ({taskProgressPct}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${taskProgressPct}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              {group.tasks.length === 0 ? (
                <div className="card p-10 text-center text-slate-400 text-xs italic">
                  No tasks have been assigned to this group yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {group.tasks.map((task) => {
                    const assignedProblem = problems.find((p) => p.id === task.problemId);
                    const isUserAssignee = task.assignee?.id === session?.user?.id;
                    const canModifyStatus = isLeader || isUserAssignee;

                    return (
                      <div
                        key={task.id}
                        className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900">{task.title}</h3>
                            {assignedProblem && (
                              <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5">
                                <Link href={`/problems/${assignedProblem.slug}`} className="text-indigo-600 font-bold hover:underline">
                                  Problem: {assignedProblem.title}
                                </Link>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500">
                            {task.assignee ? (
                              <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                                Assigned to: <strong className="text-slate-700">{task.assignee.name || 'Member'}</strong>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unassigned</span>
                            )}

                            {task.dueDate && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <Calendar className="w-3.5 h-3.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleUpdateStatus(task.id, task.status)}
                          disabled={!canModifyStatus || updatingTaskId === task.id}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                            task.status === 'DONE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          } ${(!canModifyStatus || updatingTaskId === task.id) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {updatingTaskId === task.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : task.status === 'DONE' ? (
                            <CheckCircle className="w-3.5 h-3.5 fill-current" />
                          ) : task.status === 'IN_PROGRESS' ? (
                            <Flame className="w-3.5 h-3.5 fill-current" />
                          ) : null}
                          {task.status === 'DONE' ? 'DONE' : task.status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'PENDING'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right side form */}
            <div className="lg:col-span-4 space-y-6">
              {isLeader && (
                <div className="card p-5 space-y-4 border border-slate-200">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-slate-500" /> Assign New Task
                  </h2>

                  {taskError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold rounded-lg">
                      {taskError}
                    </div>
                  )}

                  <form onSubmit={handleCreateTask} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase">Task Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Solve Two Sum problem"
                        className="input text-xs h-9 py-0"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase">Link Problem (optional)</label>
                      <select
                        value={selectedProblemId}
                        onChange={(e) => setSelectedProblemId(e.target.value)}
                        className="input text-xs h-9 py-0"
                      >
                        <option value="">No Problem Linked</option>
                        {problems.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase">Assign to Member</label>
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="input text-xs h-9 py-0"
                      >
                        <option value="">Unassigned</option>
                        {group.members.map((m) => (
                          <option key={m.user.id} value={m.user.id}>
                            {m.user.name || m.user.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase">Due Date (optional)</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="input text-xs h-9 py-0"
                      />
                    </div>

                    <button type="submit" disabled={creatingTask} className="btn-primary w-full text-xs h-9 justify-center">
                      {creatingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Assign Task'}
                    </button>
                  </form>
                </div>
              )}

              {/* Members list */}
              <div className="card p-5 space-y-4 border border-slate-200">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" /> Group Members ({group.members.length})
                </h2>
                <div className="divide-y divide-slate-100">
                  {group.members.map((m) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-slate-900 truncate">{m.user.name || m.user.email}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE COLLABORATIVE PRESENTATION ROOM (Screenshot 1 Target Layout) */}
      {activeTab === 'live' && (
        <FullscreenRoomShell
          roomState={
            roomState || {
              roomId: `room_${resolvedParams.id}`,
              groupId: resolvedParams.id,
              presenterId: presenterId,
              presenterName: presenterName,
              presentationType: 'none',
              presentationTitle: null,
              editorId: null,
              editorName: null,
              participants: [],
              stdin: roomStdin,
              code: liveCode,
              language: liveLanguage,
              lastRunOutput:
                liveStdout || liveStderr || liveExitCode !== null
                  ? { stdout: liveStdout, stderr: liveStderr, exitCode: liveExitCode, executionTimeMs: null }
                  : null,
              isRunning: liveRunning,
              startedAt: null,
            }
          }
          currentUserId={session?.user?.id || ''}
          currentUserName={session?.user?.name || undefined}
          currentUserEmail={session?.user?.email || undefined}
          isPresenter={Boolean(isUserPresenter)}
          canEdit={canEdit}
          micOn={micOn}
          camOn={camOn}
          onToggleMic={handleToggleMic}
          onToggleCam={handleToggleCam}
          onGrantEdit={handleGrantEdit}
          onRevokeEdit={handleRevokeEdit}
          chatMessages={roomChatMessages}
          onSendMessage={handleSendRoomChat}
          stdin={roomStdin}
          onStdinChange={handleStdinChange}
          onRunCode={handleRunLiveCode}
          onStartPresenting={startPresenting}
          onStopPresenting={stopPresenting}
          onLeaveRoom={async () => {
            try {
              await fetch(`/api/groups/${resolvedParams.id}/presentation/leave`, { method: 'POST' });
            } catch (_) {}
            // Stop all local media tracks
            await webrtc.setMicEnabled(false);
            await webrtc.setCamEnabled(false);
            webrtc.stopScreenShare();
            setMicOn(false);
            setCamOn(false);
            // Stop presenting if this user is the presenter
            if (isUserPresenter) {
              await stopPresenting();
            }
            // Exit fullscreen if active
            if (isFullscreen) setIsFullscreen(false);
            // Navigate back to tasks tab
            setActiveTab('tasks');
          }}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          localScreenStream={webrtc.localScreenStream}
          localVideoStream={webrtc.localVideoStream}
          remoteScreenStream={webrtc.remoteScreenStream}
          remoteStreams={webrtc.remoteStreams}
          isSpeakingLocally={webrtc.isSpeakingLocally}
        >
          {roomState?.presentationType === 'sparkcode-workspace' ? (
            <SparkCodeWorkspaceStage
              problems={problems}
              canEdit={canEdit}
              liveCode={liveCode}
              liveLanguage={liveLanguage}
              onCodeChange={(val) => {
                setLiveCode(val);
                triggerSaveLiveCode(val, liveLanguage);
              }}
              onLanguageChange={(lang) => {
                setLiveLanguage(lang);
                triggerSaveLiveCode(liveCode, lang);
              }}
              stdin={roomStdin}
              onStdinChange={handleStdinChange}
              onRunCode={handleRunLiveCode}
              isRunning={liveRunning || Boolean(roomState?.isRunning)}
              lastRunOutput={
                roomState?.lastRunOutput ||
                (liveStdout || liveStderr || liveExitCode !== null
                  ? { stdout: liveStdout, stderr: liveStderr, exitCode: liveExitCode, executionTimeMs: null }
                  : null)
              }
            />
          ) : (
            <div className="card overflow-hidden bg-[#141518] border border-slate-800 flex flex-col h-full">
              <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Code2 className="w-4 h-4 text-pink-400" />
                  <span>Monaco Live Code Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={liveLanguage}
                    disabled={!canEdit}
                    onChange={(e) => {
                      setLiveLanguage(e.target.value);
                      triggerSaveLiveCode(liveCode, e.target.value);
                    }}
                    className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1 text-[11px] outline-none font-semibold"
                  >
                    <option value="python">Python 3.10</option>
                    <option value="javascript">JavaScript (Node 18)</option>
                    <option value="java">Java 15</option>
                    <option value="cpp">C++ (GCC 11 / C++17)</option>
                  </select>
                  {canEdit && (
                    <button
                      onClick={handleRunLiveCode}
                      disabled={liveRunning || Boolean(roomState?.isRunning)}
                      className="btn-primary py-1 px-3 text-[10px] h-7 flex items-center gap-1 bg-violet-600 hover:bg-violet-500 border border-violet-500 shadow-none font-bold"
                    >
                      {liveRunning || Boolean(roomState?.isRunning) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      Run Code
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 relative min-h-[300px]">
                <Editor
                  height="100%"
                  language={
                    liveLanguage === 'javascript'
                      ? 'javascript'
                      : liveLanguage === 'cpp'
                      ? 'cpp'
                      : liveLanguage
                  }
                  value={liveCode}
                  onChange={(val) => {
                    if (canEdit) {
                      setLiveCode(val || '');
                      triggerSaveLiveCode(val || '', liveLanguage);
                    }
                  }}
                  theme="vs-dark"
                  options={{
                    readOnly: !canEdit,
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace',
                    minimap: { enabled: false },
                    lineHeight: 20,
                    padding: { top: 10 },
                  }}
                />
              </div>
            </div>
          )}
        </FullscreenRoomShell>
      )}

      {/* TAB 3: WHATSAPP-LEVEL IN-GROUP CHAT */}
      {activeTab === 'chat' && (
        <div className="flex-1 min-h-0">
          <WhatsAppGroupChat
            groupName={group.name}
            groupId={group.id}
            members={group.members}
            messages={messages}
            currentUserId={session?.user?.id || ''}
            onSendMessage={handleSendDirectMessage}
            sendingMsg={sendingMsg}
            onJoinLiveCall={() => setActiveTab('live')}
            isLiveActive={Boolean(roomState?.presenterId || (roomState?.participants?.length ?? 0) > 0)}
          />
        </div>
      )}
    </div>
  );
}
