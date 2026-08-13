'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Search, Lock, ChevronRight, Loader2, BookOpen, Compass,
  CalendarDays, Library, LayoutList, Zap, Star, CheckCircle2,
  X, ExternalLink, TrendingUp, Building2,
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
  'Array', 'String', 'Hash Table', 'Math', 'Dynamic Programming',
  'Sorting', 'Greedy', 'Depth-First Search', 'Binary Search', 'Database',
  'Bit Manipulation', 'Matrix', 'Tree', 'Prefix Sum', 'Breadth-First Search',
  'Two Pointers', 'Heap (Priority Queue)', 'Binary Tree', 'Stack',
  'Sliding Window', 'Graph', 'Linked List', 'Segment Tree', 'Recursion',
  'Backtracking', 'Divide and Conquer', 'Queue', 'Trie', 'Monotonic Stack',
  'Combinatorics', 'Number Theory', 'Geometry', 'Simulation',
];

// ─── Trending Companies ───────────────────────────────────────────────────────

const TRENDING_COMPANIES = [
  { name: 'Amazon', count: 2045, color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { name: 'Google', count: 2341, color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { name: 'Microsoft', count: 1384, color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { name: 'Meta', count: 1402, color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { name: 'Apple', count: 896, color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { name: 'Adobe', count: 654, color: 'bg-red-50 text-red-700 border-red-200' },
];

// ─── Upgrade Modal ─────────────────────────────────────────────────────────────

function UpgradeModal({ requiredTier, problemTitle, onClose }: {
  requiredTier: string; problemTitle: string; onClose: () => void;
}) {
  const isMid = requiredTier === 'mid';
  const tierLabel = isMid ? 'Mid' : 'Pro';
  const tierPrice = isMid ? '\u20b9200' : '\u20b9700';
  const features = isMid
    ? ['Unlock all Medium difficulty problems', 'Curated Study Plans & Topic Quests', 'Priority Code Execution Runner']
    : ['Unlock all Medium & Hard problems', 'Official Live Contest Participation', 'Detailed Execution Memory Profiling'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-600" />
          </div>
        </div>
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-lg font-extrabold text-slate-900">{tierLabel} Tier Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">{problemTitle}</span> is a{' '}
            {isMid ? 'Medium' : 'Hard'} problem — available to{' '}
            <span className="font-bold text-amber-700">{tierLabel}</span> subscribers.
          </p>
        </div>
        <ul className="space-y-2 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-2xl font-extrabold text-slate-900">{tierPrice}</span>
            <span className="text-xs text-slate-400 font-medium ml-1">/ month</span>
          </div>
          <Link href="/pricing" className="btn-primary w-full justify-center text-xs h-10 flex items-center gap-1.5" onClick={onClose}>
            View Pricing Plans <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button onClick={onClose} className="btn-ghost w-full justify-center text-xs text-slate-400">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarNav() {
  const items = [
    { href: '/problems', label: 'All Problems', icon: LayoutList },
    { href: '/problems/library', label: 'Library', icon: Library },
    { href: '/problems/quest', label: 'Daily Quest', icon: CalendarDays },
    { href: '/problems/explore', label: 'Explore', icon: Compass },
    { href: '/problems/study-plans', label: 'Study Plans', icon: BookOpen },
  ];
  return (
    <nav className="w-44 shrink-0 hidden lg:block space-y-0.5 pt-1">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              i === 0
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {item.label}
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
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-slate-900 section-header">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
          Daily Quest
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
          {MONTHS[month]} {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold text-slate-400 py-0.5">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`text-center text-[10px] py-1 rounded-lg font-mono ${
              !d ? '' : d === today
                ? 'bg-indigo-600 text-white font-extrabold'
                : d < today
                ? 'text-slate-300'
                : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            {d ?? ''}
          </div>
        ))}
      </div>
      <Link href="/problems/quest" className="btn-primary w-full justify-center text-xs h-8 gap-1.5">
        Solve Daily Quest
      </Link>
    </div>
  );
}

// ─── Trending Companies ────────────────────────────────────────────────────────

function TrendingCompaniesWidget({ onSelectCompany, selectedCompany }: { onSelectCompany?: (name: string) => void; selectedCompany?: string }) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="section-header">
          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
          Trending Companies
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
              onClick={() => onSelectCompany?.(isSel ? '' : c.name)}
              className={`inline-flex items-center gap-1 text-[10px] font-bold border rounded-lg px-2 py-1 transition-all cursor-pointer ${
                isSel
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : `${c.color} hover:brightness-95`
              }`}
            >
              {c.name}
              <span className={`text-[9px] ${isSel ? 'opacity-90 text-white' : 'opacity-60'}`}>{c.count}</span>
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
  const diffClass = prob.difficulty === 'Easy' ? 'badge-easy' : prob.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';
  const tierLabel = prob.tier === 'free' ? 'FREE' : prob.tier === 'mid' ? 'MID' : 'PRO';
  const tierClass = prob.tier === 'free' ? 'tier-free' : prob.tier === 'mid' ? 'tier-mid' : 'tier-pro';

  if (prob.isLocked) {
    return (
      <div
        role="button"
        onClick={() => onClick(prob)}
        className="grid gap-3 px-4 py-3 items-center cursor-pointer hover:bg-amber-50/60 transition-colors group"
        style={{ gridTemplateColumns: '2.5rem 1fr auto auto auto' }}
      >
        <span className="text-[10px] text-slate-400 font-mono">{idx}</span>
        <div className="flex items-center gap-2 min-w-0">
          <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover:text-amber-600" />
          <span className="text-xs font-semibold text-slate-500 truncate group-hover:text-slate-700">{prob.title}</span>
          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline">{prob.category}</span>
        </div>
        <span className={diffClass}>{prob.difficulty}</span>
        <div className="flex items-center gap-1">
          <span className={tierClass}>{tierLabel}</span>
          <Lock className="w-3 h-3 text-amber-500" />
        </div>
        <span className="text-[10px] text-slate-400 text-right font-mono">
          {prob.acceptanceRate > 0 ? `${prob.acceptanceRate.toFixed(1)}%` : '—'}
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/problems/${prob.slug}`}
      className="grid gap-3 px-4 py-3 items-center hover:bg-slate-50 transition-colors group"
      style={{ gridTemplateColumns: '2.5rem 1fr auto auto auto' }}
    >
      <span className="text-[10px] text-slate-400 font-mono">{idx}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{prob.title}</span>
        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline">{prob.category}</span>
        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
      </div>
      <span className={diffClass}>{prob.difficulty}</span>
      <span className={tierClass}>{tierLabel}</span>
      <span className="text-[10px] text-slate-400 text-right font-mono">
        {prob.acceptanceRate > 0 ? `${prob.acceptanceRate.toFixed(1)}%` : '—'}
      </span>
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
    if (tag) params.set('category', tag);
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
    }, 350);
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6">

        {/* Left Sidebar */}
        <SidebarNav />

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Topic Chips */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-header">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                Topics & Tags
              </h2>
              {activeTag && (
                <button
                  onClick={() => handleTag(activeTag)}
                  className="text-[10px] text-rose-500 font-bold flex items-center gap-1 hover:text-rose-600"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_CHIPS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTag(tag)}
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    activeTag === tag
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Header + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-indigo-600" />
                All Problems
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{total}</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="problems-search"
                  type="text"
                  placeholder="Search problems..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input pl-8 text-xs h-9 py-0 w-52"
                />
              </div>
              <select
                id="difficulty-filter"
                value={difficulty}
                onChange={(e) => handleDifficulty(e.target.value)}
                className="input text-xs h-9 py-0 w-36"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {(search || difficulty || activeTag) && (
                <button
                  onClick={() => {
                    setSearch(''); setDifficulty(''); setActiveTag(''); setPage(1);
                    fetchProblems({ p: 1, s: '', d: '', tag: '' });
                  }}
                  className="btn-ghost text-xs h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              {session?.user && userTier === 'free' && (
                <Link href="/pricing" className="btn-primary text-xs h-9 px-3">
                  Upgrade
                </Link>
              )}
            </div>
          </div>

          {/* Problems Table */}
          <div className="card overflow-hidden border border-slate-200">
            {/* Header row */}
            <div
              className="grid gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400"
              style={{ gridTemplateColumns: '2.5rem 1fr auto auto auto' }}
            >
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span>Access</span>
              <span className="text-right">Rate</span>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span className="text-xs">Loading problems...</span>
              </div>
            )}

            {!loading && problems.length === 0 && (
              <div className="py-16 text-center space-y-2">
                <p className="text-slate-500 text-sm font-semibold">No problems found</p>
                <p className="text-slate-400 text-xs">Try adjusting your filters or topic tag</p>
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
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Page {page} of {pages} · {total} problems</span>
              <div className="flex gap-1">
                <button onClick={() => handlePage(page - 1)} disabled={page <= 1} className="btn-secondary text-xs py-1 px-2.5 h-8 disabled:opacity-40">
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => handlePage(pg)}
                      className={`text-xs py-1 px-2.5 h-8 rounded-lg border font-semibold transition-colors ${
                        pg === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => handlePage(page + 1)} disabled={page >= pages} className="btn-secondary text-xs py-1 px-2.5 h-8 disabled:opacity-40">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-64 shrink-0 hidden xl:flex flex-col gap-4">
          {/* User tier banner */}
          {session?.user && (
            <div className="card p-3 border border-slate-200">
              {userTier === 'free' && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">Free Plan</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Easy problems are free. Upgrade to unlock Medium & Hard.</p>
                  <Link href="/pricing" className="btn-primary w-full justify-center text-xs h-8">
                    Unlock Full Access
                  </Link>
                </div>
              )}
              {userTier === 'mid' && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-amber-700 flex items-center gap-1"><Zap className="w-3 h-3" /> Mid Plan Active</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Easy & Medium unlocked. Upgrade to Pro for Hard problems.</p>
                </div>
              )}
              {userTier === 'pro' && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-amber-800 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Pro Plan Active</p>
                  <p className="text-[10px] text-slate-500">All 455 problems are unlocked.</p>
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
