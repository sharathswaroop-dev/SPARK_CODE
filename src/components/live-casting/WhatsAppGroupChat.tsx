'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Search,
  Video,
  Phone,
  Check,
  CheckCheck,
  FileCode,
  FileText,
  Lock,
  ChevronDown,
  ChevronLeft,
  X,
  Plus,
  Users,
  Image as ImageIcon,
  Sparkles,
  Info,
  BellOff,
  Clock,
  Trash2,
  LogOut,
  Download,
  Eye,
  MessageSquare,
  Loader2,
  Camera,
  Archive,
  Pin,
  Circle,
  Copy,
} from 'lucide-react';

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

interface GroupMemberInfo {
  id: string;
  role: 'LEADER' | 'MEMBER';
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface WhatsAppGroupChatProps {
  groupName: string;
  groupId: string;
  members: GroupMemberInfo[];
  messages: GroupMessageItem[];
  currentUserId: string;
  onSendMessage: (text: string) => Promise<void>;
  sendingMsg: boolean;
  onJoinLiveCall: () => void;
  isLiveActive?: boolean;
  onBackToList?: () => void;
}

const SAMPLE_EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '🚀', '💯', '✨', '👏', '🙌', '💡', '✅', '🙏', '👀', '😎'];

// Author colors for WhatsApp group bubbles
const AUTHOR_COLORS = [
  'text-emerald-400',
  'text-sky-400',
  'text-violet-400',
  'text-amber-400',
  'text-pink-400',
  'text-teal-400',
  'text-indigo-400',
  'text-orange-400',
];

function getAuthorColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AUTHOR_COLORS.length;
  return AUTHOR_COLORS[idx];
}

export default function WhatsAppGroupChat({
  groupName,
  groupId,
  members,
  messages,
  currentUserId,
  onSendMessage,
  sendingMsg,
  onJoinLiveCall,
  isLiveActive = false,
  onBackToList,
}: WhatsAppGroupChatProps) {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState<'main' | 'live' | 'solutions'>('main');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'groups'>('all');
  
  // Mobile view state: 'list' | 'chat'
  const [mobileScreen, setMobileScreen] = useState<'list' | 'chat'>('chat');

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [show3DotMenu, setShow3DotMenu] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [showCodeAttachModal, setShowCodeAttachModal] = useState(false);
  const [attachCodeLang, setAttachCodeLang] = useState('python');
  const [attachCodeContent, setAttachCodeContent] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages arrive
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom <= 120) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mobileScreen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sendingMsg) return;
    const textToSend = inputText.trim();
    setInputText('');
    await onSendMessage(textToSend);
  };

  const handleSendCodeAttachment = async () => {
    if (!attachCodeContent.trim()) return;
    const formatted = `\`\`\`${attachCodeLang}\n${attachCodeContent.trim()}\n\`\`\``;
    setShowCodeAttachModal(false);
    setAttachCodeContent('');
    await onSendMessage(formatted);
  };

  const handleCopyCode = (code: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  // Filter messages by search query if any
  const filteredMessages = messages.filter((m) =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.user.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const membersNamesStr = members
    .map((m) => m.user.name || m.user.email.split('@')[0])
    .join(', ');

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="w-full h-full bg-[#0c1317] border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row select-none font-sans text-slate-100 relative">
      {/* ══════════════════════════════════════════════════════════════════════
          LEFT PANEL: CHATS LIST & WHATSAPP TABS (Visible on Desktop OR Mobile 'list')
         ══════════════════════════════════════════════════════════════════════ */}
      <div
        className={`w-full md:w-80 lg:w-96 bg-[#111b21] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0 ${
          mobileScreen === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Left Header - WhatsApp Android Style */}
        <div className="h-14 sm:h-16 px-4 bg-[#202c33] border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-bold text-sm text-white shadow">
              {groupName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base text-slate-100 tracking-tight">WhatsApp</div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-slate-300">
            <button
              type="button"
              onClick={onJoinLiveCall}
              className={`p-2 rounded-full hover:bg-slate-700/60 transition-colors ${
                isLiveActive ? 'text-emerald-400 animate-pulse' : 'text-slate-300'
              }`}
              title="Join Live Code Stage"
            >
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowGroupInfoModal(true)}
              className="p-2 rounded-full hover:bg-slate-700/60 transition-colors"
              title="Group Details"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar - "Ask Meta AI or Search" */}
        <div className="p-2.5 bg-[#111b21] border-b border-slate-800/80 space-y-2 shrink-0">
          <div className="flex items-center bg-[#202c33] rounded-full px-3.5 py-1.5 text-xs text-slate-300">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask Meta AI or Search"
              className="w-full bg-transparent outline-none placeholder-slate-400 text-xs font-normal text-slate-200"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="p-0.5 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills: [All], [Unread], [Favourites], [Groups], [+] */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 overflow-x-auto py-0.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full transition-colors shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-[#00a884]/20 text-[#00a884] font-bold border border-[#00a884]/40'
                  : 'bg-[#202c33] hover:bg-[#2a3942] text-slate-300'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-full transition-colors shrink-0 flex items-center gap-1 ${
                activeFilter === 'unread'
                  ? 'bg-[#00a884]/20 text-[#00a884] font-bold border border-[#00a884]/40'
                  : 'bg-[#202c33] hover:bg-[#2a3942] text-slate-300'
              }`}
            >
              <span>Unread</span>
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-extrabold flex items-center justify-center">
                3
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('groups')}
              className={`px-3 py-1 rounded-full transition-colors shrink-0 ${
                activeFilter === 'groups'
                  ? 'bg-[#00a884]/20 text-[#00a884] font-bold border border-[#00a884]/40'
                  : 'bg-[#202c33] hover:bg-[#2a3942] text-slate-300'
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Channels / Group Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30">
          {/* Primary Group Channel Item */}
          <div
            onClick={() => {
              setActiveChannel('main');
              setMobileScreen('chat');
            }}
            className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
              activeChannel === 'main' ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]/60'
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-base text-white shadow">
                {groupName.slice(0, 2).toUpperCase()}
              </div>
              {isLiveActive && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#111b21] animate-pulse" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{groupName}</h4>
                <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                  {lastMessage
                    ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '12:47 am'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <p className="truncate text-[11px] pr-2">
                  {lastMessage ? (
                    <>
                      <span className="text-slate-300 font-medium">~ {lastMessage.user.name || 'Member'}: </span>
                      {lastMessage.content}
                    </>
                  ) : (
                    '~ simraaiman: Pdf version'
                  )}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  {isLiveActive ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold">
                      LIVE
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-[#25d366] text-black font-extrabold text-[9px] flex items-center justify-center shadow">
                      2
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live Code Casting Stage Channel */}
          <div
            onClick={() => {
              setActiveChannel('live');
              onJoinLiveCall();
            }}
            className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
              activeChannel === 'live' ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]/60'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white shadow shrink-0">
              <Video className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 truncate">
                  Live Code Casting Stage
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold shrink-0">Join Stage</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                WebRTC real-time voice, webcam &amp; Monaco editor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT MAIN PANEL: WHATSAPP CHAT STREAM & INPUT
         ══════════════════════════════════════════════════════════════════════ */}
      <div
        className={`flex-1 flex flex-col bg-[#0b141a] min-w-0 min-h-0 relative ${
          mobileScreen === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Main WhatsApp Header */}
        <div className="h-14 sm:h-16 px-2.5 sm:px-4 bg-[#202c33] border-b border-slate-800/80 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer" onClick={() => setShowGroupInfoModal(true)}>
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onBackToList) onBackToList();
                else setMobileScreen('list');
              }}
              className="p-1 sm:hidden rounded-full hover:bg-slate-700 text-slate-300 shrink-0"
              title="Back to chats"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow shrink-0">
              {groupName.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{groupName}</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md">
                {membersNamesStr || 'Click for group details'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-slate-300">
            {/* Live Video Call Quick Join Button */}
            <button
              type="button"
              onClick={onJoinLiveCall}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-violet-900/30 transition-all transform active:scale-95 shrink-0"
              title="Join Voice & Video Stage"
            >
              <Video className="w-4 h-4" />
              <span className="hidden md:inline">Join Call</span>
            </button>

            <button
              type="button"
              onClick={onJoinLiveCall}
              className="p-2 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors hidden xs:inline-flex"
              title="Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowGroupInfoModal(true)}
              className="p-2 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Group info"
            >
              <Users className="w-4 h-4" />
            </button>

            {/* 3-Dot WhatsApp Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShow3DotMenu((prev) => !prev)}
                className="p-2 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Menu"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {show3DotMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShow3DotMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#233138] border border-slate-700 rounded-2xl shadow-2xl z-50 p-1.5 text-xs text-slate-200 animate-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShow3DotMenu(false);
                        setShowGroupInfoModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#182229] flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>Group info</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShow3DotMenu(false);
                        onJoinLiveCall();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#182229] flex items-center gap-2 text-violet-300 font-semibold"
                    >
                      <Video className="w-4 h-4 text-violet-400" />
                      <span>Live Code Casting</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShow3DotMenu(false);
                        setShowCodeAttachModal(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#182229] flex items-center gap-2"
                    >
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span>Share Code Snippet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShow3DotMenu(false)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#182229] flex items-center gap-2"
                    >
                      <BellOff className="w-4 h-4 text-slate-400" />
                      <span>Mute notifications</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── WHATSAPP WALLPAPER & CHAT STREAM ── */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-2.5 relative"
          style={{
            backgroundColor: '#0b141a',
            backgroundImage: `radial-gradient(#1a262f 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {/* WhatsApp End-to-End Encryption Notice Pill */}
          <div className="flex justify-center my-2">
            <div className="bg-[#182229] text-[#ffd279] text-[10px] sm:text-[11px] px-3.5 py-1.5 rounded-xl border border-slate-800/80 shadow flex items-center gap-1.5 max-w-sm text-center leading-relaxed">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Messages are end-to-end encrypted with SparkCode group security.</span>
            </div>
          </div>

          {/* Date Separator Pill */}
          <div className="flex justify-center my-2">
            <span className="bg-[#182229] text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-slate-800 shadow-sm">
              Today
            </span>
          </div>

          {/* Messages Stream */}
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16 sm:py-24 text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">No messages yet</p>
              <p className="text-[11px] text-slate-500">Send a message or share code snippet to get started!</p>
            </div>
          ) : (
            filteredMessages.map((m) => {
              const isMe = m.user.id === currentUserId;
              const isCodeBlock = m.content.startsWith('```') && m.content.endsWith('```');
              const cleanCode = isCodeBlock ? m.content.replace(/^```[a-z]*\n?/, '').replace(/```$/, '') : '';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group mb-1`}
                >
                  <div
                    className={`relative max-w-[85%] sm:max-w-lg rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 shadow-md text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                        : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                    }`}
                  >
                    {/* Author Name for incoming group messages */}
                    {!isMe && (
                      <div className={`text-[10px] sm:text-[11px] font-bold mb-0.5 ${getAuthorColor(m.user.id)}`}>
                        ~ {m.user.name || 'Member'}
                      </div>
                    )}

                    {/* Message Body: Code Block Attachment OR Regular text */}
                    {isCodeBlock ? (
                      <div className="space-y-1.5 my-1">
                        <div className="bg-[#111b21] rounded-xl p-2.5 sm:p-3 border border-slate-700/80 font-mono text-[11px] text-emerald-300 overflow-x-auto max-w-full">
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-sans pb-1 mb-1 border-b border-slate-800">
                            <span className="flex items-center gap-1 font-bold text-violet-300">
                              <FileCode className="w-3 h-3 text-violet-400" /> Code Snippet
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(cleanCode, m.id)}
                              className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                            >
                              {copiedMsgId === m.id ? (
                                <>
                                  <Check className="w-2.5 h-2.5 text-emerald-400" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5" /> Copy
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="whitespace-pre-wrap">{cleanCode}</pre>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    )}

                    {/* Message Timestamp & WhatsApp Double Checkmarks */}
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400/90 mt-0.5 select-none float-right ml-2.5">
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── EMOJI PICKER POPUP ── */}
        {showEmojiPicker && (
          <div className="p-2.5 bg-[#202c33] border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xl no-scrollbar">
            {SAMPLE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="p-1 hover:bg-slate-700 rounded-lg hover:scale-125 transition-all shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* ── ATTACHMENT POPUP MENU ── */}
        {showAttachMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
            <div className="absolute bottom-16 left-3 sm:left-4 bg-[#233138] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(false);
                  setShowCodeAttachModal(true);
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#182229] text-slate-200 flex items-center gap-2.5 font-medium"
              >
                <FileCode className="w-4 h-4 text-violet-400" />
                <span>Share Code Snippet</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(false);
                  onJoinLiveCall();
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#182229] text-slate-200 flex items-center gap-2.5 font-medium"
              >
                <Video className="w-4 h-4 text-emerald-400" />
                <span>Invite to Live Stage</span>
              </button>
            </div>
          </>
        )}

        {/* ── BOTTOM INPUT BAR (WhatsApp Mobile Style) ── */}
        <form
          onSubmit={handleSend}
          className="h-14 sm:h-16 px-2.5 sm:px-4 bg-[#202c33] border-t border-slate-800/80 flex items-center gap-2 shrink-0"
        >
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Emojis"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Plus / Attachment Button */}
          <button
            type="button"
            onClick={() => setShowAttachMenu((prev) => !prev)}
            className="p-2 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Attach code snippet or file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message Input Pill */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-[#2a3942] border-none rounded-full px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none"
          />

          {/* Send / Mic Action Button */}
          {inputText.trim() ? (
            <button
              type="submit"
              disabled={sendingMsg}
              className="p-2.5 sm:p-3 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white shadow-md transition-all transform active:scale-95 shrink-0"
              title="Send message"
            >
              {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSendMessage('🎙 Voice ping')}
              className="p-2.5 sm:p-3 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white shadow-md transition-all transform active:scale-95 shrink-0"
              title="Send quick voice ping"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* ── MODAL: GROUP INFO (WhatsApp Style) ── */}
      {showGroupInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
          <div className="bg-[#111b21] border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-white">Group Info</h3>
              <button
                type="button"
                onClick={() => setShowGroupInfoModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-xl sm:text-2xl text-white shadow-xl">
                {groupName.slice(0, 2).toUpperCase()}
              </div>
              <h2 className="text-base font-extrabold text-white">{groupName}</h2>
              <p className="text-xs text-slate-400">Group · {members.length} participants</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowGroupInfoModal(false);
                  onJoinLiveCall();
                }}
                className="p-2.5 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] text-violet-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4 text-violet-400" />
                <span>Join Live Stage</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(`${window.location.origin}/groups/${groupId}`);
                    alert('Room invite link copied!');
                  }
                }}
                className="p-2.5 rounded-2xl bg-[#202c33] hover:bg-[#2a3942] text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Copy Invite</span>
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {members.length} Participants
              </h4>
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-800/60">
                {members.map((m) => (
                  <div key={m.id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-[10px]">
                        {(m.user.name || m.user.email)[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-200">
                        {m.user.name || m.user.email} {m.user.id === currentUserId && '(You)'}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGroupInfoModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: SHARE CODE SNIPPET ATTACHMENT ── */}
      {showCodeAttachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
          <div className="bg-[#111b21] border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Attach Code Snippet</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCodeAttachModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Language</label>
              <select
                value={attachCodeLang}
                onChange={(e) => setAttachCodeLang(e.target.value)}
                className="w-full bg-[#202c33] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="sql">SQL</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Paste Code</label>
              <textarea
                rows={6}
                value={attachCodeContent}
                onChange={(e) => setAttachCodeContent(e.target.value)}
                placeholder="Paste algorithm or code snippet here..."
                className="w-full bg-[#202c33] border border-slate-700 rounded-xl p-3 font-mono text-xs text-emerald-300 placeholder-slate-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCodeAttachModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendCodeAttachment}
                disabled={!attachCodeContent.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00a884] hover:bg-[#008f6f] text-white shadow disabled:opacity-50"
              >
                Send Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
