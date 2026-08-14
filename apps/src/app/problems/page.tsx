'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Search, Lock, ChevronRight, Loader2, BookOpen, Compass,
  CalendarDays, Library, LayoutList, Zap, Star, CheckCircle2,
  X, ExternalLink, TrendingUp, Building2, Flame, Sparkles,
  Check, Filter, ArrowUpDown, Code, Layers, Shuffle,
  Bookmark, Award, Clock, ChevronDown, ChevronUp, ChevronLeft,
  Smartphone, GraduationCap, ShieldCheck, Heart, Plus
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

// ─── Main Category Tab Pills ─────────────────────────────────────────────────

const MAIN_TABS = [
  { id: 'all', label: 'All Topics', icon: LayoutList, color: 'text-slate-900 bg-slate-900 text-white' },
  { id: 'algorithms', label: 'Algorithms', icon: Code, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'database', label: 'Database', icon: Layers, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'javascript', label: 'JavaScript', icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'concurrency', label: 'Concurrency', icon: Flame, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

// ─── Topic chips with counts ──────────────────────────────────────────────────

const TOPIC_TAGS = [
  { name: 'Dynamic Programming', count: 109 },
  { name: 'Array', count: 110 },
  { name: 'Graph', count: 106 },
  { name: 'Tree', count: 83 },
  { name: 'Linked List', count: 70 },
  { name: 'Recursion', count: 59 },
  { name: 'Stack & Queue', count: 55 },
  { name: 'Basics', count: 49 },
  { name: 'String', count: 47 },
  { name: 'Binary Search', count: 41 },
  { name: 'Bit Manipulation', count: 38 },
  { name: 'Greedy', count: 33 },
  { name: 'Heap', count: 32 },
  { name: 'BST', count: 30 },
  { name: 'Backtracking', count: 7 },
  { name: 'Sliding Window', count: 26 },
  { name: 'Two Pointers', count: 7 },
  { name: 'Sorting', count: 23 },
  { name: 'Hash Table', count: 5 },
  { name: 'Trie', count: 17 },
  { name: 'Math', count: 9 },
];

// ─── Trending Companies ───────────────────────────────────────────────────────

const TRENDING_COMPANIES = [
  { name: 'Amazon', count: 2045, badgeColor: 'bg-amber-100 text-amber-800' },
  { name: 'Google', count: 2341, badgeColor: 'bg-blue-100 text-blue-800' },
  { name: 'Microsoft', count: 1384, badgeColor: 'bg-indigo-100 text-indigo-800' },
  { name: 'Meta', count: 1402, badgeColor: 'bg-rose-100 text-rose-800' },
  { name: 'Apple', count: 896, badgeColor: 'bg-slate-200 text-slate-800' },
  { name: 'Adobe', count: 654, badgeColor: 'bg-red-100 text-red-800' },
];

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
  const [activeTab, setActiveTab] = useState('all');
  const [activeTag, setActiveTag] = useState('');
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
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

  const handleRandomProblem = () => {
    if (problems.length > 0) {
      const randomIdx = Math.floor(Math.random() * problems.length);
      const prob = problems[randomIdx];
      if (prob) {
        window.location.href = `/problems/${prob.slug}`;
      }
    }
  };

  // Calendar dates
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.toLocaleString('default', { month: 'short' }).toUpperCase();
  const currentYear = now.getFullYear();

  const filteredCompanies = TRENDING_COMPANIES.filter(c =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const visibleTags = isTagsExpanded ? TOPIC_TAGS : TOPIC_TAGS.slice(0, 8);

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex gap-6 items-start">

        {/* ── LEFT SIDEBAR NAVIGATION ───────────────────────────── */}
        <aside className="w-44 shrink-0 hidden lg:flex flex-col gap-6 pt-1">
          {/* Main Links */}
          <nav className="space-y-1">
            <Link
              href="/problems"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-900 transition-colors"
            >
              <LayoutList className="w-4 h-4 text-slate-700" />
              <span>Problems</span>
            </Link>
            <Link
              href="/problems/library"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Library className="w-4 h-4 text-slate-500" />
              <span>Library</span>
            </Link>
            <Link
              href="/problems/quest"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-slate-500" />
              <span>Quest</span>
            </Link>
            <Link
              href="/problems/explore"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Compass className="w-4 h-4 text-slate-500" />
              <span>Explore</span>
            </Link>
            <Link
              href="/problems/study-plans"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <span>Study Plan</span>
            </Link>
          </nav>

          {/* My Lists Section */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between px-3 text-xs font-bold text-slate-700">
              <span>My Lists</span>
              <div className="flex items-center gap-1 text-slate-400">
                <button type="button" className="hover:text-slate-700 p-0.5"><Plus className="w-3.5 h-3.5" /></button>
                <button type="button" className="hover:text-slate-700 p-0.5"><ChevronDown className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
              <span className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">Favorite</span>
              </span>
              <Lock className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </aside>

        {/* ── CENTER MAIN CONTENT ────────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-5">

          {/* 1. TOP CAROUSEL BANNER CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {/* Card 1: Gold Plan Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#f59e0b] border border-amber-300 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="space-y-1 z-10">
                <div className="w-6 h-6 rounded-lg bg-amber-900/10 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                </div>
                <h3 className="text-xs font-extrabold text-amber-950 leading-tight">
                  Unlock Full Experience on SparkCode
                </h3>
              </div>
              <div className="flex items-baseline gap-2 z-10">
                <span className="text-base font-extrabold text-amber-950">₹200<span className="text-xs font-normal text-amber-800">/mo</span></span>
                <span className="text-[10px] font-bold bg-amber-900 text-white px-2 py-0.5 rounded-full">Save 56%</span>
              </div>
            </div>

            {/* Card 2: Mobile / App Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-slate-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="space-y-1 z-10">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-100 leading-tight">
                  SparkCode at Your Fingertips
                </h3>
                <p className="text-[10px] text-slate-400">WebRTC Code Casting &amp; Chat</p>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 z-10">
                Try Live Stage <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Card 3: System Design & Crash Course */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] text-white border border-emerald-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="space-y-1 z-10">
                <div className="w-6 h-6 rounded-lg bg-emerald-950/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <h3 className="text-xs font-extrabold text-emerald-50 leading-tight">
                  DSA &amp; System Design Crash Course
                </h3>
                <p className="text-[10px] text-emerald-200">System Design for Interviews &amp; Beyond</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-1 z-10">
                Start Learning <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Card 4: Striver 455 SDE Sheet */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#8b5cf6] text-white border border-violet-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="space-y-1 z-10">
                <div className="w-6 h-6 rounded-lg bg-violet-950/40 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <h3 className="text-xs font-extrabold text-violet-50 leading-tight">
                  Striver's SDE Sheet: 455 Questions
                </h3>
                <p className="text-[10px] text-violet-200">Master Data Structures in 30 Days</p>
              </div>
              <span className="text-[10px] font-bold text-violet-200 flex items-center gap-1 z-10">
                Explore Sheet <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* 2. SUB-TAGS WITH COUNTS BAR */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600">
            {visibleTags.map((t) => {
              const isSelected = activeTag === t.name;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => handleTag(t.name)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{t.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-0.5 px-2 py-1 cursor-pointer"
            >
              <span>{isTagsExpanded ? 'Collapse' : 'Expand'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isTagsExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* 3. MAIN CATEGORY PILLS BAR */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {MAIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'all') setActiveTag('');
                    else handleTag(tab.label);
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                    isSel
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 4. SEARCH & CONTROLS ROW */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="problems-search"
                  type="text"
                  placeholder="Search questions"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input pl-8 text-xs h-9 py-0 w-64 bg-slate-50 border-slate-200 rounded-xl"
                />
                {search && (
                  <button onClick={() => handleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Difficulty Dropdown Filter */}
              <select
                id="difficulty-filter"
                value={difficulty}
                onChange={(e) => handleDifficulty(e.target.value)}
                className="input text-xs h-9 py-0 w-32 bg-slate-50 border-slate-200 rounded-xl font-semibold cursor-pointer"
              >
                <option value="">Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Med.</option>
                <option value="Hard">Hard</option>
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

            {/* Right: Solved Progress & Random Shuffle button */}
            <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>0/{total} Solved</span>
              </span>

              <button
                type="button"
                onClick={handleRandomProblem}
                title="Pick Random Problem"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 5. PROBLEM LIST ITEMS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                <span className="text-xs font-semibold">Loading problems...</span>
              </div>
            )}

            {!loading && problems.length === 0 && (
              <div className="py-20 text-center space-y-2">
                <p className="text-slate-600 text-sm font-bold">No questions found</p>
                <p className="text-slate-400 text-xs">Try adjusting your keyword search or tag filters.</p>
              </div>
            )}

            {!loading && problems.map((prob, idx) => {
              const isEasy = prob.difficulty === 'Easy';
              const isMedium = prob.difficulty === 'Medium';
              const isHard = prob.difficulty === 'Hard';

              const diffColor = isEasy
                ? 'text-cyan-600'
                : isMedium
                ? 'text-amber-500'
                : 'text-rose-500';

              const diffLabel = isEasy ? 'Easy' : isMedium ? 'Med.' : 'Hard';
              const questionNumber = (page - 1) * 50 + idx + 1;

              return (
                <div
                  key={prob.id}
                  className="px-4 py-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 group cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-slate-400 text-[11px] font-mono w-6 shrink-0">{questionNumber}.</span>
                    <Link
                      href={`/problems/${prob.slug}`}
                      className="font-bold text-slate-800 hover:text-indigo-600 transition-colors truncate"
                    >
                      {prob.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 font-mono text-[11px]">
                    <span className="text-slate-400 w-12 text-right">
                      {prob.acceptanceRate > 0 ? `${prob.acceptanceRate.toFixed(1)}%` : '58.0%'}
                    </span>

                    <span className={`font-bold w-10 text-right ${diffColor}`}>
                      {diffLabel}
                    </span>

                    <div className="w-8 flex items-center justify-end text-slate-300 group-hover:text-slate-400">
                      {prob.isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <div className="flex gap-0.5 items-end h-3">
                          <span className="w-0.5 h-1.5 bg-slate-300 rounded-xs" />
                          <span className="w-0.5 h-2.5 bg-slate-300 rounded-xs" />
                          <span className="w-0.5 h-2 bg-slate-300 rounded-xs" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 6. PAGINATION */}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-500">
                Page {page} of {pages} · <strong className="text-slate-800">{total}</strong> questions
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePage(page - 1)}
                  disabled={page <= 1}
                  className="btn-secondary text-xs py-1 px-3 h-8 disabled:opacity-40 font-bold rounded-lg"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => handlePage(pg)}
                      className={`text-xs py-1 px-3 h-8 rounded-lg border font-bold transition-all ${
                        pg === page
                          ? 'bg-slate-900 text-white border-slate-900'
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
                  className="btn-secondary text-xs py-1 px-3 h-8 disabled:opacity-40 font-bold rounded-lg"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR ──────────────────────────────────────── */}
        <aside className="w-72 shrink-0 hidden xl:flex flex-col gap-4">
          
          {/* Daily Quest Calendar Card (LeetCode Style) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>Day {currentDay}</span>
                  <span className="text-[10px] text-slate-400 font-mono">01:17:46 left</span>
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" className="p-1 text-slate-400 hover:text-slate-700"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button type="button" className="p-1 text-slate-400 hover:text-slate-700"><ChevronRight className="w-3.5 h-3.5" /></button>
                <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-[9px] font-extrabold text-rose-600">
                  8<span className="text-[7px]">AUG</span>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-[9px] font-extrabold text-slate-400 py-0.5">{d}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === currentDay;
                const isPast = dayNum < currentDay;
                return (
                  <div
                    key={dayNum}
                    className={`text-[10px] py-1 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                        : isPast
                        ? 'text-slate-600 hover:bg-slate-100 cursor-pointer font-medium'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>

            {/* Weekly Premium Pills */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  Weekly Premium <Sparkles className="w-3 h-3 text-amber-500" />
                </span>
                <span className="text-[10px] text-slate-400">1 day left</span>
              </div>
              <div className="flex items-center gap-1">
                {['W1', 'W2', 'W3', 'W4', 'W5'].map((w, idx) => (
                  <span
                    key={w}
                    className={`flex-1 text-center py-1 text-[10px] font-bold rounded-lg ${
                      idx === 1
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Redeem & Rules Footer */}
            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> 0 Redeem
              </span>
              <button type="button" className="hover:underline text-[10px] text-slate-400">Rules</button>
            </div>
          </div>

          {/* Trending Companies Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900">Trending Companies</h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button type="button" className="p-0.5 hover:text-slate-700"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button type="button" className="p-0.5 hover:text-slate-700"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Company Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search for a company..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            {/* Company Badges */}
            <div className="flex flex-wrap gap-1.5">
              {filteredCompanies.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleSearch(c.name)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <span>{c.name}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded-full font-extrabold ${c.badgeColor}`}>
                    {c.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Upgrade Modal */}
      {upgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in"
          onClick={() => setUpgradeModal(null)}
        >
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
            <button onClick={() => setUpgradeModal(null)} className="p-2 absolute top-4 right-4 rounded-xl text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-lg font-extrabold text-slate-900">Upgrade Required</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-800">{upgradeModal.problem.title}</span> is a premium problem.
              </p>
            </div>
            <Link
              href="/pricing"
              className="btn-primary w-full justify-center text-xs h-10 shadow-md"
            >
              View Subscription Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
