'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Search, Lock, ChevronRight, Loader2, BookOpen, Compass,
  CalendarDays, Library, LayoutList, Zap, Star, CheckCircle2,
  X, ExternalLink, TrendingUp, Building2, Flame, Sparkles,
  Check, Filter, ArrowUpDown, Code, Layers
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProblemRow {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tier: string;
  acceptanceRate: number;
  isLocked: boolean;
  requiredTier: string;
}

interface ProblemListResponse {
  problems: ProblemRow[];
  total: number;
  page: number;
  pages: number;
}

// ─── Topic chips data ─────────────────────────────────────────────────────────

const TOPIC_CHIPS = [
  'All Topics',
  'Array', 'String', 'Hash Table', 'Dynamic Programming',
  'Binary Search', 'Two Pointers', 'Tree', 'Graph', 'Matrix',
  'Stack', 'Heap (Priority Queue)', 'Linked List', 'Greedy',
  'Recursion', 'Backtracking', 'Bit Manipulation', 'Sliding Window',
  'Sorting', 'Trie', 'Prefix Sum', 'Divide and Conquer',
];

// ─── Trending Companies ───────────────────────────────────────────────────────

const TRENDING_COMPANIES = [
  { name: 'Amazon', count: '2.0k', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20' },
  { name: 'Google', count: '2.3k', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20' },
  { name: 'Microsoft', count: '1.4k', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20 hover:bg-indigo-500/20' },
  { name: 'Meta', count: '1.4k', color: 'bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/20' },
  { name: 'Apple', count: '890', color: 'bg-slate-500/10 text-slate-700 border-slate-500/20 hover:bg-slate-500/20' },
  { name: 'Adobe', count: '650', color: 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20' },
];

// ─── Upgrade Modal ─────────────────────────────────────────────────────────────

function UpgradeModal({ requiredTier, problemTitle, onClose }: {
  requiredTier: string; problemTitle: string; onClose: () => void;
}) {
  const isMid = requiredTier === 'mid';
  const tierLabel = isMid ? 'Mid' : 'Pro';
  const tierPrice = isMid ? '₹200' : '₹700';
  const features = isMid
    ? ['Unlock all Medium difficulty problems', 'Curated Study Plans & Topic Quests', 'Priority Code Execution Runner']
    : ['Unlock all Medium & Hard problems', 'Official Live Contest Participation', 'Detailed Execution Memory Profiling'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
        <button onClick={onClose} className="p-2 absolute top-4 right-4 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-lg font-extrabold text-slate-900">{tierLabel} Tier Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-800">{problemTitle}</span> is a{' '}
            {isMid ? 'Medium' : 'Hard'} problem — available to{' '}
            <span className="font-bold text-amber-700">{tierLabel}</span> subscribers.
          </p>
        </div>
        <ul className="space-y-2.5 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-2xl font-extrabold text-slate-900">{tierPrice}</span>
            <span className="text-xs text-slate-400 font-medium"> / month</span>
          </div>
          <Link
            href="/pricing"
            className="btn-primary w-full justify-center text-xs h-10 shadow-md shadow-indigo-600/20"
          >
            Upgrade to {tierLabel} Tier
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Navigation ────────────────────────────────────────────────────────

function SidebarNav() {
  const items = [
    { href: '/problems', label: 'All Problems', icon: LayoutList, active: true },
    { href: '/problems/library', label: 'Library', icon: Library },
    { href: '/problems/quest', label: 'Daily Quest', icon: CalendarDays },
    { href: '/problems/explore', label: 'Explore', icon: Compass },
    { href: '/problems/study-plans', label: 'Study Plans', icon: BookOpen },
  ];
  return (
    <nav className="w-48 shrink-0 hidden lg:block space-y-1 pt-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              item.active
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Calendar Widget ──────────────────────────────────────────────────────────

function CalendarWidget() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS = ['S','M','T','W','T','F','S'];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="card p-4 space-y-3.5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Daily Quest</span>
          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-bold border border-amber-200">
            🔥 3 Streak
          </span>
        </h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {MONTHS[month]} {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-extrabold text-slate-400 py-0.5">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`text-center text-[11px] py-1 rounded-lg font-mono transition-colors ${
              !d ? '' : d === today
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-extrabold shadow-sm'
                : d < today
                ? 'text-slate-400 font-medium'
                : 'text-slate-700 hover:bg-slate-100 cursor-pointer font-semibold'
            }`}
          >
            {d ?? ''}
          </div>
        ))}
      </div>
      <Link href="/problems/quest" className="btn-primary w-full justify-center text-xs h-9 gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-600/20 font-bold">
        Solve Today's Quest
      </Link>
    </div>
  );
}

// ─── Trending Companies ────────────────────────────────────────────────────────

function TrendingCompaniesWidget({ onSelectCompany, selectedCompany }: { onSelectCompany?: (name: string) => void; selectedCompany?: string }) {
  return (
    <div className="card p-4 space-y-3 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-indigo-500" />
          <span>Top Companies</span>
        </h3>
        {selectedCompany && (
          <button onClick={() => onSelectCompany?.('')} className="text-[10px] text-rose-500 font-bold hover:underline">
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TRENDING_COMPANIES.map((c) => {
          const isSel = selectedCompany === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onSelectCompany?.(isSel ? '' : c.name)}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold border rounded-xl px-2.5 py-1 transition-all cursor-pointer ${
                isSel
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : `${c.color}`
              }`}
            >
              <span>{c.name}</span>
              <span className={`text-[10px] ${isSel ? 'text-indigo-200' : 'opacity-70'}`}>{c.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Problem Table Row ─────────────────────────────────────────────────────────

function ProblemTableRow({ prob, idx, onClick }: {
  prob: ProblemRow; idx: number; onClick: (p: ProblemRow) => void;
}) {
  const isEasy = prob.difficulty === 'Easy';
  const isMedium = prob.difficulty === 'Medium';
  const isHard = prob.difficulty === 'Hard';

  const diffBadge = isEasy ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Easy
    </span>
  ) : isMedium ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Medium
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Hard
    </span>
  );

  const tierLabel = prob.tier === 'free' ? 'FREE' : prob.tier === 'mid' ? 'MID' : 'PRO';
  const tierClass = prob.tier === 'free'
    ? 'bg-slate-100 text-slate-600 border-slate-200'
    : prob.tier === 'mid'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-purple-50 text-purple-700 border-purple-200';

  if (prob.isLocked) {
    return (
      <div
        role="button"
        onClick={() => onClick(prob)}
        className="grid gap-3 px-4 py-3.5 items-center cursor-pointer hover:bg-amber-50/50 transition-colors group border-b border-slate-100 last:border-0"
        style={{ gridTemplateColumns: '2.5rem 1fr auto auto auto' }}
      >
        <span className="text-[11px] text-slate-400 font-mono font-medium">{idx}</span>
        <div className="flex items-center gap-2.5 min-w-0">
          <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover:text-amber-600" />
          <span className="text-xs font-bold text-slate-600 truncate group-hover:text-slate-900">{prob.title}</span>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0 hidden sm:inline">{prob.category}</span>
        </div>
        <div>{diffBadge}</div>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${tierClass}`}>{tierLabel}</span>
          <Lock className="w-3 h-3 text-amber-500" />
        </div>
        <div className="w-20 text-right">
          <span className="text-[11px] text-slate-400 font-mono font-medium">
            {prob.acceptanceRate > 0 ? `${prob.acceptanceRate.toFixed(1)}%` : '—'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/problems/${prob.slug}`}
      className="grid gap-3 px-4 py-3.5 items-center hover:bg-indigo-50/40 transition-colors group border-b border-slate-100 last:border-0"
      style={{ gridTemplateColumns: '2.5rem 1fr auto auto auto' }}
    >
      <span className="text-[11px] text-slate-400 font-mono font-medium">{idx}</span>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xs font-bold text-slate-850 group-hover:text-indigo-600 transition-colors truncate">{prob.title}</span>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0 hidden sm:inline">{prob.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 shrink-0 transition-all group-hover:translate-x-0.5" />
      </div>
      <div>{diffBadge}</div>
      <div>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${tierClass}`}>{tierLabel}</span>
      </div>
      <div className="w-20 text-right">
        <span className="text-[11px] text-slate-500 font-mono font-semibold">
          {prob.acceptanceRate > 0 ? `${prob.acceptanceRate.toFixed(1)}%` : '—'}
        </span>
      </div>
    </Link>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProblemsPage() {
  const { data: session } = useSession();
  const userTier = ((session?.user) as any)?.tier ?? 'free';

  const [problems, setProblems] = useState<ProblemRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [upgradeModal, setUpgradeModal] = useState<{ problem: ProblemRow } | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProblems = useCallback(async (opts: {
    p?: number; s?: string; d?: string; tag?: string;
  } = {}) => {
    setLoading(true);
    const p = opts.p ?? page;
    const s = opts.s !== undefined ? opts.s : search;
    const d = opts.d !== undefined ? opts.d : difficulty;
    const tag = opts.tag !== undefined ? opts.tag : activeTag;
    const params = new URLSearchParams({ page: String(p), limit: '50' });
    if (s) params.set('search', s);
    if (d) params.set('difficulty', d);
    if (tag && tag !== 'All Topics') params.set('category', tag);
    try {
      const res = await fetch(`/api/problems?${params.toString()}`);
      const data: ProblemListResponse = await res.json();
      setProblems(data.problems ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch {
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, difficulty, activeTag]);

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchProblems({ p: 1, s: val });
    }, 300);
  };

  const handleDifficulty = (val: string) => {
    setDifficulty(val);
    setPage(1);
    fetchProblems({ p: 1, d: val });
  };

  const handleTag = (tag: string) => {
    const next = activeTag === tag ? '' : tag;
    setActiveTag(next);
    setPage(1);
    fetchProblems({ p: 1, tag: next });
  };

  const handlePage = (newPage: number) => {
    setPage(newPage);
    fetchProblems({ p: newPage });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ── TOP STATS & STRIVER BANNER ──────────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Striver's SDE Sheet 455 Master Catalog
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Curated Data Structures &amp; Algorithms
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Solve, analyze, and master standard interview problems with multi-language code execution.
          </p>
        </div>

        {/* Quick Difficulty Stats Pills */}
        <div className="flex items-center gap-3 shrink-0 z-10">
          <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
            <span className="text-base font-extrabold text-emerald-400">145</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Easy</p>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
            <span className="text-base font-extrabold text-amber-400">225</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Medium</p>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
            <span className="text-base font-extrabold text-rose-400">85</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Hard</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Sidebar */}
        <SidebarNav />

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Topics & Tags Chips */}
          <div className="card p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Categories &amp; Topic Tags</span>
              </h2>
              {activeTag && activeTag !== 'All Topics' && (
                <button
                  onClick={() => handleTag('')}
                  className="text-[10px] text-rose-500 font-bold flex items-center gap-1 hover:text-rose-600 hover:underline cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear Tag
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TOPIC_CHIPS.map((tag) => {
                const isSelected = activeTag === tag || (!activeTag && tag === 'All Topics');
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTag(tag === 'All Topics' ? '' : tag)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
                        : 'bg-white text-slate-600 border-slate-200/90 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search, Difficulty Filter & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-indigo-600" />
                <span>Problem Catalog</span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {total} problems
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="problems-search"
                  type="text"
                  placeholder="Search problem title..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input pl-8 text-xs h-9 py-0 w-48 sm:w-56 bg-white"
                />
                {search && (
                  <button onClick={() => handleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Difficulty Dropdown */}
              <select
                id="difficulty-filter"
                value={difficulty}
                onChange={(e) => handleDifficulty(e.target.value)}
                className="input text-xs h-9 py-0 w-36 bg-white font-semibold cursor-pointer"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>

              {(search || difficulty || activeTag) && (
                <button
                  onClick={() => {
                    setSearch(''); setDifficulty(''); setActiveTag(''); setPage(1);
                    fetchProblems({ p: 1, s: '', d: '', tag: '' });
                  }}
                  className="btn-ghost text-xs h-9 text-rose-600 hover:bg-rose-50 flex items-center gap-1 font-bold"
                >
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Problems Table Card */}
          <div className="card overflow-hidden border border-slate-200/90 shadow-sm bg-white">
            {/* Header row */}
            <div
              className="grid gap-3 px-4 py-3 bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400"
              style={{ gridTemplateColumns: '2.5rem 1fr auto auto auto' }}
            >
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span>Access</span>
              <span className="text-right">Acceptance</span>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs font-semibold">Loading problems...</span>
              </div>
            )}

            {!loading && problems.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <p className="text-slate-600 text-sm font-bold">No problems match your filters</p>
                <p className="text-slate-400 text-xs">Try selecting a different topic tag or clearing your search.</p>
              </div>
            )}

            {!loading && problems.length > 0 && (
              <div className="divide-y divide-slate-100">
                {problems.map((prob, idx) => (
                  <ProblemTableRow
                    key={prob.id}
                    prob={prob}
                    idx={(page - 1) * 50 + idx + 1}
                    onClick={(p) => { if (p.isLocked) setUpgradeModal({ problem: p }); }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-500">
                Page {page} of {pages} · <strong className="text-slate-800">{total}</strong> problems
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePage(page - 1)}
                  disabled={page <= 1}
                  className="btn-secondary text-xs py-1 px-3 h-8 disabled:opacity-40 font-bold"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => handlePage(pg)}
                      className={`text-xs py-1 px-3 h-8 rounded-xl border font-bold transition-all ${
                        pg === page
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePage(page + 1)}
                  disabled={page >= pages}
                  className="btn-secondary text-xs py-1 px-3 h-8 disabled:opacity-40 font-bold"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-72 shrink-0 hidden xl:flex flex-col gap-4">
          {/* User tier banner */}
          {session?.user && (
            <div className="card p-4 border border-slate-200/80 shadow-xs space-y-2">
              {userTier === 'free' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">Free Tier</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">Standard</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Easy problems &amp; Study Groups are 100% free forever.
                  </p>
                  <Link href="/pricing" className="btn-primary w-full justify-center text-xs h-9 font-bold shadow-md shadow-indigo-600/20">
                    Unlock Medium &amp; Hard
                  </Link>
                </div>
              )}
              {userTier === 'mid' && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Mid Plan Active
                  </p>
                  <p className="text-[11px] text-slate-500">Easy &amp; Medium problems fully unlocked.</p>
                </div>
              )}
              {userTier === 'pro' && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-purple-500 text-purple-500" /> Pro Plan Active
                  </p>
                  <p className="text-[11px] text-slate-500">All 455 problems and live contests unlocked.</p>
                </div>
              )}
            </div>
          )}

          <CalendarWidget />
          <TrendingCompaniesWidget onSelectCompany={(comp) => handleSearch(comp)} selectedCompany={search} />
        </div>
      </div>

      {/* Upgrade Modal */}
      {upgradeModal && (
        <UpgradeModal
          requiredTier={upgradeModal.problem.requiredTier}
          problemTitle={upgradeModal.problem.title}
          onClose={() => setUpgradeModal(null)}
        />
      )}
    </div>
  );
}
