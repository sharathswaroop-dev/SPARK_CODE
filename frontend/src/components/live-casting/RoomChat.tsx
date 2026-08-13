'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Plus,
  Smile,
  CheckCheck,
  Code2,
  Sparkles,
  Lock,
} from 'lucide-react';
import { RoomChatMessage } from '@/types/live-casting';
import { AvatarInitials } from './PresenceBadge';

interface RoomChatProps {
  messages: RoomChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => Promise<void>;
  compact?: boolean;
}

const SENDER_COLORS = [
  'text-emerald-400',
  'text-sky-400',
  'text-purple-400',
  'text-amber-400',
  'text-pink-400',
  'text-teal-400',
  'text-indigo-400',
];

function getSenderColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SENDER_COLORS.length;
  return SENDER_COLORS[index];
}

const QUICK_SNIPPETS = [
  { label: 'Look at line 14', text: 'Check the condition at line 14 — might cause an index error.' },
  { label: 'Input format error', text: 'Please check the stdin input format (ensure correct line breaks).' },
  { label: 'Awesome logic!', text: 'Great solution! Time complexity looks optimal (O(N)).' },
  { label: 'Pass me edit access', text: 'Can you give me edit access? I can type out the helper function.' },
];

const EMOJIS = ['👍', '❤️', '🚀', '🔥', '👏', '🎉', '💡', '😂'];

export default function RoomChat({
  messages,
  currentUserId,
  onSendMessage,
  compact = false,
}: RoomChatProps) {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom <= 80) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText;
    setInputText('');
    setShowSnippets(false);
    setShowEmojis(false);
    setSending(true);
    try {
      await onSendMessage(text);
    } finally {
      setSending(false);
    }
  };

  const handleInsertSnippet = (snippetText: string) => {
    setInputText((prev) => (prev ? `${prev} ${snippetText}` : snippetText));
    setShowSnippets(false);
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => `${prev}${emoji}`);
  };

  return (
    <div
      className={`card border border-slate-800 bg-[#0d1418] text-slate-100 flex flex-col shadow-2xl overflow-hidden ${
        compact ? 'h-full' : 'h-[360px]'
      }`}
    >
      {/* WhatsApp-Style Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1f2c34] border-b border-slate-700/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-600/20 text-violet-300">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              Room Live Chat
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#005c4b] text-[#25d366] font-normal">
                active
              </span>
            </h3>
            <p className="text-[9px] text-slate-400 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-slate-500" /> Ephemeral session chat
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 bg-[#111b21] px-2 py-0.5 rounded-full border border-slate-700/40">
          {messages.length} msg
        </span>
      </div>

      {/* WhatsApp Message Feed (Doodle dark tone) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 select-text bg-[#0b141a] bg-opacity-95 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-1.5">
            <div className="p-3 rounded-full bg-[#1f2c34] text-slate-400 border border-slate-700/50">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-xs font-semibold text-slate-300">No session messages yet</p>
            <p className="text-[10px] text-slate-500 max-w-[200px]">
              Chat is scoped only to this live session. Send notes, debugging tips, or emojis!
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.userId === currentUserId;
            const time = new Date(m.ts).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const senderColor = getSenderColor(m.name);

            return (
              <div
                key={m.id}
                className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && <AvatarInitials name={m.name} image={m.image} size="xs" />}

                <div
                  className={`relative max-w-[85%] px-3 py-1.5 rounded-xl text-xs leading-relaxed shadow-md ${
                    isMe
                      ? 'bg-[#005c4b] text-slate-100 rounded-tr-none border border-[#007a64]/40'
                      : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/50'
                  }`}
                >
                  {/* Sender Name in distinct WhatsApp colorful style */}
                  {!isMe && (
                    <div className={`text-[10px] font-bold ${senderColor} mb-0.5 tracking-wide`}>
                      ~ {m.name}
                    </div>
                  )}

                  {/* Message content */}
                  <div className="break-words whitespace-pre-wrap text-[11.5px] pr-12 pb-1 text-slate-100 font-normal">
                    {m.text}
                  </div>

                  {/* Right-aligned subtle WhatsApp timestamp & status */}
                  <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[9px] text-slate-400/80 font-mono select-none">
                    <span>{time}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Snippets / Emojis drawer popovers */}
      {showSnippets && (
        <div className="bg-[#1f2c34] border-t border-slate-700 p-2 text-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Quick Code Snippets
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_SNIPPETS.map((snip) => (
              <button
                key={snip.label}
                type="button"
                onClick={() => handleInsertSnippet(snip.text)}
                className="text-left px-2 py-1.5 rounded bg-[#111b21] hover:bg-[#2a3942] text-slate-300 text-[10px] border border-slate-700/60 truncate transition-colors"
              >
                <span className="font-semibold text-violet-300">[{snip.label}]</span> {snip.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {showEmojis && (
        <div className="bg-[#1f2c34] border-t border-slate-700 px-3 py-1.5 flex items-center justify-between text-base">
          {EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => handleAddEmoji(em)}
              className="p-1 hover:scale-125 transition-transform"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* WhatsApp Input Row: "+" Attachment, "Smile" Emoji, Input, Send */}
      <form
        onSubmit={handleSubmit}
        className="px-2 py-2 bg-[#1f2c34] border-t border-slate-700/60 flex items-center gap-1.5 shrink-0"
      >
        {/* Quick Snippets Toggle "+" */}
        <button
          type="button"
          onClick={() => {
            setShowSnippets(!showSnippets);
            setShowEmojis(false);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            showSnippets ? 'bg-[#00a884] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#2a3942]'
          }`}
          title="Quick Code Snippets & Notes"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Emoji Toggle */}
        <button
          type="button"
          onClick={() => {
            setShowEmojis(!showEmojis);
            setShowSnippets(false);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            showEmojis ? 'bg-[#00a884] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#2a3942]'
          }`}
          title="Emoji reactions"
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message"
          className="flex-1 bg-[#2a3942] border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00a884] transition-colors"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="p-2 rounded-full bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 disabled:hover:bg-[#00a884] text-slate-900 font-bold transition-all shadow-md shrink-0 flex items-center justify-center"
          title="Send"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4 text-white fill-white" />
          )}
        </button>
      </form>
    </div>
  );
}
