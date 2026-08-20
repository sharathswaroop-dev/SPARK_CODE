'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Video,
  Plus,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Calendar,
  Clock,
  Users,
  Shield,
  Radio,
  X,
  Keyboard,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ClipboardList,
  MessageSquare,
  CheckCircle,
  Flame,
  Code2,
} from 'lucide-react';

interface GroupSummary {
  id: string;
  name: string;
  description?: string;
  inviteCode?: string | null;
  role: 'LEADER' | 'MEMBER';
  memberCount: number;
  taskCount: number;
}

type SidebarSection = 'assignments' | 'live-casting' | 'chat';

export default function GroupsCollaborationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active left sidebar navigation: 1. Group Assignments | 2. Live Code Casting | 3. Group Chat
  const [activeSection, setActiveSection] = useState<SidebarSection>('live-casting');

  // 1. Join Room input state
  const [roomCodeOrLink, setRoomCodeOrLink] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // 2. New Menu dropdown state & New Room Modal state
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [startWithLiveCode, setStartWithLiveCode] = useState(true);
  const [enableVoiceVideo, setEnableVoiceVideo] = useState(true);
  const [creatingInstantRoom, setCreatingInstantRoom] = useState(false);
  const [createError, setCreateError] = useState('');

  // 3. Schedule Room Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  // 4. Safe meeting info modal
  const [showSafeInfoModal, setShowSafeInfoModal] = useState(false);

  // 5. Calendar day navigation state
  const today = useMemo(() => new Date(), []);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0); // 0 is today

  // Generate 7-day strip centered on offset
  const daysList = useMemo(() => {
    const days = [];
    const base = new Date(today);
    base.setDate(base.getDate() + selectedDayOffset);

    // generate 7 days around base (-3 to +3)
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const isSelected = i === 0;
      days.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayNum: d.getDate(),
        fullDateStr: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isSelected,
        offsetValue: selectedDayOffset + i,
      });
    }
    return days;
  }, [today, selectedDayOffset]);

  const activeDateFormatted = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + selectedDayOffset);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, [today, selectedDayOffset]);

  useEffect(() => {
    if (session?.user) {
      fetchGroups();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Handle Join a Room by Code or Full URL
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeOrLink.trim()) return;

    if (!session?.user) {
      router.push('/signin');
      return;
    }

    setJoinError('');
    setJoining(true);

    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCodeOrLink: roomCodeOrLink.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Room not found');
      }

      router.push(`/groups/${data.groupId}`);
    } catch (err: any) {
      setJoinError(err.message || 'Room not found. Please verify the room code or link.');
    } finally {
      setJoining(false);
    }
  };

  // 2. Handle Instant New Room Creation
  const handleCreateInstantRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!session?.user) {
      router.push('/signin');
      return;
    }

    setCreateError('');
    setCreatingInstantRoom(true);

    const userName = session.user.name || session.user.email?.split('@')[0] || 'Member';
    const roomTitle = newRoomName.trim() || `${userName}'s Live Room`;

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomTitle,
          description: startWithLiveCode
            ? 'Interactive pair programming & live code casting room'
            : 'Collaborative study & voice room',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create room');

      setShowNewRoomModal(false);
      router.push(`/groups/${data.groupId}`);
    } catch (err: any) {
      setCreateError(err.message || 'Could not start room.');
    } finally {
      setCreatingInstantRoom(false);
    }
  };

  // 3. Handle Schedule Room Creation
  const handleScheduleRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      router.push('/signin');
      return;
    }

    setScheduleError('');
    setScheduling(true);

    try {
      const combinedDescription = [
        scheduleDescription.trim(),
        scheduleDate ? `Scheduled for ${scheduleDate} ${scheduleTime}` : '',
      ]
        .filter(Boolean)
        .join(' — ');

      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scheduleName.trim() || 'Scheduled Coding Session',
          description: combinedDescription || 'Upcoming scheduled collaborative room',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule room');

      setShowScheduleModal(false);
      setScheduleName('');
      setScheduleDate('');
      setScheduleTime('');
      setScheduleDescription('');
      fetchGroups();
    } catch (err: any) {
      setScheduleError(err.message || 'Failed to schedule room.');
    } finally {
      setScheduling(false);
    }
  };

  const handleCopyInviteLink = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/groups/${groupId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(groupId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const userInitial = (session?.user?.name || session?.user?.email || 'U')[0].toUpperCase();

  // Navigation Items with equal visual hierarchy
  const sidebarNavItems = [
    { id: 'assignments' as SidebarSection, label: 'Group Assignments', icon: ClipboardList },
    { id: 'live-casting' as SidebarSection, label: 'Live Code Casting', icon: Video },
    { id: 'chat' as SidebarSection, label: 'Group Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-100 flex flex-col font-sans select-none">
      {/* ── TOP NAV BAR (Google Meet Style) ── */}
      <header className="h-14 sm:h-16 px-3 sm:px-6 border-b border-slate-800/80 bg-[#121318] flex items-center justify-between gap-2 sm:gap-4 z-40 sticky top-0">
        {/* Left: SparkCode Branding */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
            SparkCode <span className="text-violet-400 font-bold text-xs sm:text-sm hidden xs:inline">Meet</span>
          </span>
        </div>

        {/* Center: Join input + New Button */}
        <div className="flex-1 max-w-2xl flex items-center justify-center gap-2">
          {/* Join input pill */}
          <form
            onSubmit={handleJoinRoom}
            className="w-full flex items-center bg-[#1a1b22] border border-slate-700/70 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all shadow-inner"
          >
            <Keyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 mr-1.5 sm:mr-2 shrink-0" />
            <input
              type="text"
              value={roomCodeOrLink}
              onChange={(e) => {
                setRoomCodeOrLink(e.target.value);
                if (joinError) setJoinError('');
              }}
              placeholder="Enter a code or link"
              className="w-full bg-transparent text-[11px] sm:text-sm text-slate-200 placeholder-slate-500 outline-none font-medium"
            />
            <button
              type="submit"
              disabled={joining || !roomCodeOrLink.trim()}
              className="ml-1 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white disabled:opacity-30 transition-colors shrink-0"
            >
              {joining ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Join'}
            </button>
          </form>

          {/* New Room button with dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowNewDropdown((prev) => !prev)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs bg-[#34a853] hover:bg-[#2d9249] text-white shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">New</span>
            </button>

            {/* Dropdown Options */}
            {showNewDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNewDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 sm:w-56 bg-[#1f2027] border border-slate-700 rounded-2xl shadow-2xl z-50 p-1.5 text-xs animate-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewDropdown(false);
                      const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'My';
                      setNewRoomName(`${userName}'s Live Room`);
                      setShowNewRoomModal(true);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800/80 hover:text-white flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Radio className="w-4 h-4 text-violet-400" />
                    <span>Start an instant meeting</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewDropdown(false);
                      setShowScheduleModal(true);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800/80 hover:text-white flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Schedule for later</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: User Avatar (simplified on mobile) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSafeInfoModal(true)}
            className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex"
            title="Help & Security"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <Link
            href="/pricing"
            className="hidden md:inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow transition-colors"
          >
            Upgrade
          </Link>
          {session?.user ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#d81b60] text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {userInitial}
            </div>
          ) : (
            <Link
              href="/signin"
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* ── BODY: LEFT SIDEBAR + MAIN CONTENT VIEW ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT SIDEBAR: Desktop only ── */}
        <aside className="hidden sm:flex w-52 lg:w-56 border-r border-slate-800/80 bg-[#121318] flex-col py-6 px-3 gap-2 shrink-0">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 font-bold border border-violet-500/40 shadow-lg shadow-violet-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 transition-colors ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'bg-slate-800/80 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold tracking-tight leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* ── MOBILE BOTTOM TAB BAR ── */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121318] border-t border-slate-800 flex items-center justify-around px-2 py-2" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-violet-400' : 'text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-bold tracking-tight">{item.label.split(' ')[0]}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-violet-400" />}
              </button>
            );
          })}
        </nav>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 pb-20 sm:pb-8">
          {/* Join Error Banner if present */}
          {joinError && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold rounded-2xl flex items-center justify-between animate-in fade-in">
              <span>{joinError}</span>
              <button
                type="button"
                onClick={() => setJoinError('')}
                className="p-1 hover:bg-rose-900 rounded text-rose-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION 2: LIVE CODE CASTING (Current Google-Meet-style Home Page)
             ════════════════════════════════════════════════════════════════════════ */}
          {activeSection === 'live-casting' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* ── DATE STRIP & CALENDAR SELECTOR (Exact Screenshot Header) ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
                {/* Left: Day & Calendar icon */}
                <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-100">
                  <span>{activeDateFormatted}</span>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>

                {/* Right: 7-Day Selector Strip */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDayOffset((prev) => prev - 1)}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Previous day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 sm:gap-2">
                    {daysList.map((d) => (
                      <button
                        key={`${d.dayName}-${d.dayNum}`}
                        type="button"
                        onClick={() => setSelectedDayOffset(d.offsetValue)}
                        className={`flex flex-col items-center justify-center w-9 h-11 sm:w-11 sm:h-12 rounded-full transition-all text-xs ${
                          d.isSelected
                            ? 'bg-[#1a73e8] text-white font-extrabold shadow-md scale-105'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider">{d.dayName}</span>
                        <span className="text-xs sm:text-sm font-bold">{d.dayNum}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDayOffset((prev) => prev + 1)}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Next day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── SECURITY NOTIFICATION BANNER (Exact Screenshot Blue Pill) ── */}
              <div className="bg-[#1e2a38] border border-[#2b4159] rounded-full px-5 py-3 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1a73e8]/30 border border-[#1a73e8]/50 flex items-center justify-center text-[#8ab4f8] shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <span className="font-bold text-slate-100">Your meeting is safe — </span>
                    <span className="text-slate-300">
                      No one can join a meeting unless invited or admitted by the host
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSafeInfoModal(true)}
                  className="px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/60 transition-colors shrink-0 hidden sm:inline-flex"
                >
                  Learn more
                </button>
              </div>

              {/* ── EMPTY STATE ILLUSTRATION ── */}
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                {/* SVG Line Art Illustration */}
                <div className="w-64 h-36 relative flex items-center justify-center">
                  <svg
                    viewBox="0 0 240 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-md"
                  >
                    <path
                      d="M30 110C25 80 40 60 60 60C80 60 90 80 85 110H30Z"
                      fill="#f48fb1"
                      stroke="#1e2029"
                      strokeWidth="2.5"
                    />
                    <circle cx="150" cy="30" r="12" fill="#fbc02d" stroke="#1e2029" strokeWidth="2.5" />
                    <path
                      d="M85 75H125L120 110H90L85 75Z"
                      fill="#fbc02d"
                      stroke="#1e2029"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M123 80C132 80 135 95 120 98"
                      stroke="#1e2029"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M102 65C98 55 106 48 100 40"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="2 3"
                    />
                    <path
                      d="M130 55L145 110H135L125 65L130 55Z"
                      fill="#e2e8f0"
                      stroke="#1e2029"
                      strokeWidth="2.5"
                    />
                    <polygon points="128,45 125,58 135,58" fill="#fbc02d" stroke="#1e2029" strokeWidth="1.5" />
                    <rect
                      x="135"
                      y="60"
                      width="65"
                      height="50"
                      rx="8"
                      transform="rotate(-5 135 60)"
                      fill="#f8fafc"
                      stroke="#1e2029"
                      strokeWidth="2.5"
                    />
                    <rect x="150" y="76" width="18" height="13" rx="3" fill="#64748b" />
                    <polygon points="170,80 178,75 178,90 170,85" fill="#64748b" />
                    <line x1="20" y1="112" x2="220" y2="112" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    No meetings scheduled for today
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Schedule a meeting or enjoy the free time
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'My';
                    setNewRoomName(`${userName}'s Live Room`);
                    setShowNewRoomModal(true);
                  }}
                  className="px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm bg-transparent hover:bg-slate-800 text-[#34a853] border-2 border-[#34a853] flex items-center gap-2 shadow transition-all transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ New</span>
                </button>
              </div>

              {/* ── RECENT COLLABORATIVE ROOMS GRID ── */}
              <div className="pt-6 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-400" />
                    <span>Recent Live Code Casting Rooms ({groups.length})</span>
                  </h2>

                  <button
                    type="button"
                    onClick={() => {
                      const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'My';
                      setNewRoomName(`${userName}'s Room`);
                      setShowNewRoomModal(true);
                    }}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Room
                  </button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                    <span className="text-xs">Loading active rooms...</span>
                  </div>
                ) : groups.length === 0 ? (
                  <div className="bg-[#14151a] border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                    You have no active rooms yet. Click <strong>+ New</strong> to start an instant room.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => router.push(`/groups/${g.id}`)}
                        className="group bg-[#15161c] hover:bg-[#1a1b24] border border-slate-800 hover:border-violet-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3.5 transition-all shadow-md cursor-pointer"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-white truncate">
                              {g.name}
                            </h3>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                g.role === 'LEADER'
                                  ? 'bg-violet-950 text-violet-300 border border-violet-800'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {g.role === 'LEADER' ? 'HOST' : 'MEMBER'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {g.description || 'Live coding and collaborative WebRTC stage.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                          <button
                            type="button"
                            onClick={(e) => handleCopyInviteLink(g.id, e)}
                            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 font-semibold p-1 rounded hover:bg-slate-800 transition-colors"
                            title="Copy room link"
                          >
                            {copiedId === g.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-[10px]">Copied link</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px]">Copy link</span>
                              </>
                            )}
                          </button>

                          <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 group-hover:text-violet-300 group-hover:translate-x-0.5 transition-all">
                            Enter Stage <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION 1: GROUP ASSIGNMENTS
             ════════════════════════════════════════════════════════════════════════ */}
          {activeSection === 'assignments' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-violet-400" />
                    <span>Group Assignments &amp; Tasks</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Assigned problems, coding tasks, and team milestones across your groups.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'My';
                    setNewRoomName(`${userName}'s Study Group`);
                    setShowNewRoomModal(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1.5 shadow-md shadow-violet-900/30 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Group / Assign Tasks</span>
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                  <span className="text-xs">Loading group assignments...</span>
                </div>
              ) : groups.length === 0 ? (
                <div className="bg-[#14151a] border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                  <ClipboardList className="w-8 h-8 text-slate-500 mx-auto" />
                  <h3 className="text-sm font-bold text-white">No assignments found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Create or join a collaborative group room to assign coding challenges and track problem-solving milestones.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => router.push(`/groups/${g.id}`)}
                      className="bg-[#15161c] hover:bg-[#1a1b24] border border-slate-800 hover:border-violet-500/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-md cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-white">{g.name}</h3>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {g.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {g.taskCount} assigned tasks · {g.memberCount} group members
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 group-hover:text-violet-300">
                          Open Group Tasks <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION 3: GROUP CHAT
             ════════════════════════════════════════════════════════════════════════ */}
          {activeSection === 'chat' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <span>Group Chat Channels</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time discussions, shared code snippets, and group channels.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  <span className="text-xs">Loading chat channels...</span>
                </div>
              ) : groups.length === 0 ? (
                <div className="bg-[#14151a] border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                  <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
                  <h3 className="text-sm font-bold text-white">No active chats</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Join or create a group room to chat with members, share algorithm snippets, and collaborate.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => router.push(`/groups/${g.id}`)}
                      className="bg-[#15161c] hover:bg-[#1a1b24] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-bold text-sm text-white shadow shrink-0">
                          {g.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">{g.name}</h4>
                          <p className="text-xs text-slate-400 truncate">
                            {g.memberCount} members · End-to-end encrypted chat channel
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                          Open Chat <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL 1: CREATE NEW ROOM (INSTANT) ── */}
      {showNewRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none">
          <div className="bg-[#16171d] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Room</h3>
                  <p className="text-xs text-slate-400">Launch and start immediately</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRoomModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateInstantRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Room Name</label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. System Design & Coding Practice"
                  className="w-full bg-[#0d0e12] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={startWithLiveCode}
                    onChange={(e) => setStartWithLiveCode(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Start with Live Coding stage</span>
                </label>

                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVoiceVideo}
                    onChange={(e) => setEnableVoiceVideo(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Enable WebRTC Voice &amp; Video hub</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRoomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingInstantRoom}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#34a853] hover:bg-[#2d9249] text-white shadow-lg shadow-emerald-950/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {creatingInstantRoom ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Create Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SCHEDULE A ROOM (FOR LATER) ── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none">
          <div className="bg-[#16171d] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Schedule a Room</h3>
                  <p className="text-xs text-slate-400">Plan a collaborative session for later</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {scheduleError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl">
                {scheduleError}
              </div>
            )}

            <form onSubmit={handleScheduleRoom} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Room Title</label>
                <input
                  type="text"
                  required
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="e.g. Mock Technical Interview Practice"
                  className="w-full bg-[#0d0e12] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Description / Topic (optional)</label>
                <textarea
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  placeholder="Brief agenda or problems to solve..."
                  className="w-full bg-[#0d0e12] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none h-16 resize-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {scheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                  <span>Schedule Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: SECURITY & SAFE MEETING DETAILS ── */}
      {showSafeInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none">
          <div className="bg-[#16171d] border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>SparkCode Room Security</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSafeInfoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-slate-300">
              <p>
                SparkCode Live Collaboration uses peer-to-peer WebRTC mesh with DTLS-SRTP encryption for real-time audio, video, and screen cast streams.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>End-to-end peer encrypted streams.</li>
                <li>Host-controlled code handoff and driving privileges.</li>
                <li>Single-click link sharing with auto-joining.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowSafeInfoModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
