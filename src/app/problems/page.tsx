'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Search,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shuffle,
  ChevronDown,
  LayoutGrid,
  Terminal,
  Database,
  Code,
  Cpu,
  Layers,
  Star,
  BookOpen,
  Smartphone,
  GraduationCap,
  Compass,
  CalendarDays,
  Library,
  LayoutList,
  Plus,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Building2,
  Tag,
  Calendar,
  Filter,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { DailyStreakBanner } from '@/components/DailyStreakBanner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProblemRow {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tier: 'free' | 'mid' | 'pro';
  acceptanceRate: number;
  isLocked: boolean;
  requiredTier: string;
  companyTags?: string;
}

interface ProblemListResponse {
  problems: ProblemRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── Main Category Tabs ──────────────────────────────────────────────────────

const MAIN_TABS = [
  { id: 'all', label: 'All Topics', icon: LayoutGrid, query: '' },
  { id: 'algorithms', label: 'Algorithms', icon: Terminal, query: 'Algorithms' },
  { id: 'database', label: 'Database', icon: Database, query: 'Database' },
  { id: 'javascript', label: 'JavaScript', icon: Code, query: 'JavaScript' },
  { id: 'concurrency', label: 'Concurrency', icon: Cpu, query: 'Concurrency' },
];

// ─── Topic Tags (Striver + Extended) ─────────────────────────────────────────

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
  { name: 'Math', count: 12 },
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
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeTag, setActiveTag] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{ problem: ProblemRow } | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFilterCount =
    (search ? 1 : 0) +
    (difficulty ? 1 : 0) +
    (activeTag ? 1 : 0) +
    (selectedCompany ? 1 : 0) +
    (activeTab !== 'all' ? 1 : 0);

  const fetchProblems = useCallback(async (opts: {
    p?: number;
    s?: string;
    d?: string;
    cat?: string;
    comp?: string;
  } = {}) => {
    setLoading(true);
    setError(null);

    const p = opts.p ?? page;
    const s = opts.s !== undefined ? opts.s : search;
    const d = opts.d !== undefined ? opts.d : difficulty;
    const comp = opts.comp !== undefined ? opts.comp : selectedCompany;

    let cat = opts.cat !== undefined ? opts.cat : (activeTag || (activeTab !== 'all' ? MAIN_TABS.find(t => t.id === activeTab)?.query || '' : ''));

    const params = new URLSearchParams({ page: String(p), limit: '50' });
    if (s) params.set('search', s);
    if (d) params.set('difficulty', d);
    if (cat) params.set('category', cat);
    if (comp) params.set('company', comp);

    try {
      const res = await fetch(`/api/problems?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch problems`);
      const data: ProblemListResponse = await res.json();
      setProblems(data.problems ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch (err: any) {
      console.error('Problems fetch error:', err);
      setError(err?.message || 'Unable to connect to the problem server');
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, difficulty, activeTag, activeTab, selectedCompany]);

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

  const handleMainTab = (tabId: string) => {
    setActiveTab(tabId);
    setActiveTag('');
    setPage(1);
    const tabObj = MAIN_TABS.find((t) => t.id === tabId);
    const catQuery = tabObj ? tabObj.query : '';
    fetchProblems({ p: 1, cat: catQuery });
  };

  const handleTag = (tag: string) => {
    const next = activeTag === tag ? '' : tag;
    setActiveTag(next);
    setPage(1);
    const fallbackCat = activeTab !== 'all' ? MAIN_TABS.find((t) => t.id === activeTab)?.query || '' : '';
    fetchProblems({ p: 1, cat: next || fallbackCat });
  };

  const handleCompanyFilter = (compName: string) => {
    const next = selectedCompany === compName ? '' : compName;
    setSelectedCompany(next);
    setPage(1);
    fetchProblems({ p: 1, comp: next });
  };

  const handleResetAllFilters = () => {
    setSearch('');
    setDifficulty('');
    setActiveTab('all');
    setActiveTag('');
    setSelectedCompany('');
    setPage(1);
    fetchProblems({ p: 1, s: '', d: '', cat: '', comp: '' });
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

  // Dynamic Moveable Calendar state
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

  const currentYear = calendarDate.getFullYear();
  const currentMonthIndex = calendarDate.getMonth() + 1;
  const currentMonthName = calendarDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const daysInMonth = new Date(currentYear, calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOffset = new Date(currentYear, calendarDate.getMonth(), 1).getDay();

  const isCurrentRealMonth =
    new Date().getMonth() === calendarDate.getMonth() &&
    new Date().getFullYear() === calendarDate.getFullYear();
  const realTodayDate = new Date().getDate();

  const handlePrevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const filteredCompanies = TRENDING_COMPANIES.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const visibleTags = isTagsExpanded ? TOPIC_TAGS : TOPIC_TAGS.slice(0, 8);
  const hasActiveFilters = Boolean(search || difficulty || activeTag || selectedCompany || activeTab !== 'all');

  return (
    <div className="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">

      {/* ── TOP MOBILE / TABLET NAV STRIP (Visible on < lg) ── */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <Link href="/problems" className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold shrink-0">
          Problems
        </Link>
        <Link href="/problems/library" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold shrink-0">
          Library
        </Link>
        <Link href="/problems/quest" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold shrink-0">
          Daily Quest
        </Link>
        <Link href="/problems/explore" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold shrink-0">
          Explore
        </Link>
        <Link href="/problems/study-plans" className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold shrink-0">
          Study Plans
        </Link>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── LEFT SIDEBAR NAVIGATION (Desktop) ─────────────────── */}
        <aside className="w-44 shrink-0 hidden lg:flex flex-col gap-6 pt-1 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
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
        <main className="flex-1 min-w-0 space-y-4 sm:space-y-5">
          {/* Daily Challenge & Streak Banner */}
          <DailyStreakBanner />

          {/* 1. TOP CAROUSEL BANNER CARDS (Swipeable on Mobile) */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:overflow-visible">
            {/* Card 1: Gold Plan Banner */}
            <div className="min-w-[240px] sm:min-w-0 flex-1 p-4 rounded-2xl bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#f59e0b] border border-amber-300 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group shrink-0 sm:shrink">
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
            <div className="min-w-[240px] sm:min-w-0 flex-1 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-slate-800 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group shrink-0 sm:shrink">
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
            <div className="min-w-[240px] sm:min-w-0 flex-1 p-4 rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] text-white border border-emerald-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group shrink-0 sm:shrink">
              <div className="space-y-1 z-10">
                <div className="w-6 h-6 rounded-lg bg-emerald-950/40 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <h3 className="text-xs font-extrabold text-emerald-50 leading-tight">
                  DSA &amp; System Design Crash Course
                </h3>
                <p className="text-[10px] text-emerald-200">System Design for Interviews</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-1 z-10">
                Start Learning <ChevronRight className="w-3 h-3" />
              </span>
            </div>

            {/* Card 4: Striver 455 SDE Sheet */}
            <div className="min-w-[240px] sm:min-w-0 flex-1 p-4 rounded-2xl bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#8b5cf6] text-white border border-violet-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group shrink-0 sm:shrink">
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

          {/* ── MOBILE / TABLET EXPANDABLE CALENDAR & TRENDING BUTTON (Visible on < xl) ── */}
          <div className="xl:hidden">
            <button
              type="button"
              onClick={() => setMobileCalendarOpen(!mobileCalendarOpen)}
              className="w-full p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Daily Quest Calendar &amp; Top Companies</span>
              </span>
              <span className="text-[11px] text-indigo-600 font-bold flex items-center gap-1">
                {mobileCalendarOpen ? 'Hide' : 'View'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileCalendarOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>

            {mobileCalendarOpen && (
              <div className="mt-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in slide-in-from-top-2">
                {/* Calendar View */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{currentMonthName} {currentYear}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={handlePrevMonth} className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={handleNextMonth} className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center font-mono">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={i} className="text-[9px] font-extrabold text-slate-400 py-0.5">{d}</div>
                    ))}
                    {Array.from({ length: firstDayOffset }).map((_, i) => (
                      <div key={`m-blank-${i}`} className="w-full h-6" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const isSelected = dayNum === selectedDay;
                      return (
                        <button
                          key={`m-day-${dayNum}`}
                          onClick={() => setSelectedDay(dayNum)}
                          className={`w-full h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Company Filter Chips on Mobile */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700">Filter by Company:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TRENDING_COMPANIES.map((c) => {
                      const isSelected = selectedCompany === c.name;
                      return (
                        <button
                          key={`m-comp-${c.name}`}
                          onClick={() => handleCompanyFilter(c.name)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                            isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. SUB-TAGS WITH COUNTS BAR (Smooth Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs text-slate-600">
            {TOPIC_TAGS.map((t) => {
              const isSelected = activeTag === t.name;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => handleTag(t.name)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700 bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  <span>{t.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. MAIN CATEGORY PILLS BAR (Smooth Horizontal Scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {MAIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleMainTab(tab.id)}
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

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
              <span className="text-[11px] font-bold text-slate-400">Active:</span>
              {activeTab !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] sm:text-[11px] font-bold">
                  {MAIN_TABS.find(t => t.id === activeTab)?.label}
                  <button onClick={() => handleMainTab('all')} className="hover:text-rose-400">×</button>
                </span>
              )}
              {activeTag && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] sm:text-[11px] font-bold">
                  <Tag className="w-3 h-3" /> {activeTag}
                  <button onClick={() => handleTag(activeTag)} className="hover:text-rose-300">×</button>
                </span>
              )}
              {difficulty && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] sm:text-[11px] font-bold">
                  Diff: {difficulty}
                  <button onClick={() => handleDifficulty('')} className="hover:text-amber-200">×</button>
                </span>
              )}
              {selectedCompany && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] sm:text-[11px] font-bold">
                  <Building2 className="w-3 h-3" /> {selectedCompany}
                  <button onClick={() => handleCompanyFilter(selectedCompany)} className="hover:text-teal-200">×</button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] sm:text-[11px] font-bold">
                  "{search}"
                  <button onClick={() => handleSearch('')} className="hover:text-rose-600">×</button>
                </span>
              )}
              <button
                onClick={handleResetAllFilters}
                className="text-[11px] font-bold text-rose-600 hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* 4. PROBLEM CONTROLS & TABLE CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Search & Filter Controls */}
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Search input (Full Width on Mobile) */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    id="problems-search"
                    type="text"
                    placeholder="Search problems..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="input pl-8 text-xs h-10 sm:h-9 py-0 w-full bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                  />
                  {search && (
                    <button onClick={() => handleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Mobile Filter Button trigger (< md) */}
                <button
                  type="button"
                  onClick={() => setFilterModalOpen(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold shrink-0 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                </button>

                {/* Desktop Difficulty Dropdown Filter (md+) */}
                <div className="hidden md:flex items-center gap-2">
                  <select
                    id="difficulty-filter"
                    value={difficulty}
                    onChange={(e) => handleDifficulty(e.target.value)}
                    className="input text-xs h-9 py-0 w-32 bg-slate-50 border-slate-200 rounded-xl font-semibold cursor-pointer focus:bg-white"
                  >
                    <option value="">Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Med.</option>
                    <option value="Hard">Hard</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      onClick={handleResetAllFilters}
                      className="btn-ghost text-xs h-9 text-rose-600 hover:bg-rose-50 flex items-center gap-1 font-bold rounded-xl shrink-0"
                    >
                      <X className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Solved Progress & Random Shuffle */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 text-xs text-slate-500 font-semibold shrink-0">
                <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200/60 text-[11px] sm:text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>0/{total} Solved</span>
                </span>

                <button
                  type="button"
                  onClick={handleRandomProblem}
                  title="Pick Random Problem"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop Table Headers (Hidden on mobile) */}
            <div className="hidden md:flex px-4 py-2.5 bg-slate-50/90 items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-6 text-slate-400">#</span>
                <span>Title</span>
              </div>
              <div className="flex items-center gap-6 font-mono text-[11px]">
                <span className="w-16 text-right">Acceptance</span>
                <span className="w-12 text-right">Diff.</span>
                <span className="w-8 text-right">Status</span>
              </div>
            </div>

            {/* 5. PROBLEM LIST (Adaptive: Mobile Cards on < md, Table on md+) */}
            <div className="divide-y divide-slate-100">
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                  <span className="text-xs font-bold text-slate-600">Loading problem set...</span>
                </div>
              )}

              {!loading && error && (
                <div className="py-16 px-4 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Unable to load problems</p>
                    <p className="text-xs text-slate-500">{error}</p>
                  </div>
                  <button
                    onClick={() => fetchProblems()}
                    className="btn-secondary text-xs h-8 px-4 font-bold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Try Again
                  </button>
                </div>
              )}

              {!loading && !error && problems.length === 0 && (
                <div className="py-20 px-4 text-center space-y-3">
                  <Search className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-slate-800 text-sm font-bold">No problems found</p>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto">
                      {hasActiveFilters
                        ? 'No problems match your current combination of filters. Try clearing some filters or searching for another keyword.'
                        : 'No problems currently available. Check back soon!'}
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetAllFilters}
                      className="btn-primary text-xs h-8 px-4 font-bold inline-flex items-center gap-1.5"
                    >
                      <X className="w-3 h-3" /> Reset All Filters
                    </button>
                  )}
                </div>
              )}

              {!loading && !error && problems.map((prob, idx) => {
                const isEasy = prob.difficulty === 'Easy';
                const isMedium = prob.difficulty === 'Medium';
                const isHard = prob.difficulty === 'Hard';

                const diffColor = isEasy
                  ? 'text-cyan-700 bg-cyan-50 border-cyan-200'
                  : isMedium
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200';

                const diffLabel = isEasy ? 'Easy' : isMedium ? 'Med.' : 'Hard';
                const questionNumber = (page - 1) * 50 + idx + 1;

                return (
                  <div
                    key={prob.id}
                    className="p-3.5 sm:px-4 sm:py-3 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* MOBILE CARD LAYOUT (< md) */}
                    <div className="md:hidden space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-mono text-slate-400">#{questionNumber}</span>
                          <Link
                            href={`/problems/${prob.slug}`}
                            className="font-bold text-slate-900 text-xs hover:text-indigo-600 transition-colors truncate"
                          >
                            {prob.title}
                          </Link>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${diffColor}`}>
                          {diffLabel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-sans font-medium">
                          {prob.category}
                        </span>
                        <div className="flex items-center gap-3">
                          <span>{prob.acceptanceRate > 0 ? `${prob.acceptanceRate.toFixed(1)}%` : '58.0%'} acc</span>
                          {prob.isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <span className="text-emerald-600 font-bold">Free</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DESKTOP ROW LAYOUT (md+) */}
                    <div className="hidden md:flex items-center justify-between gap-4 group cursor-pointer text-xs">
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
                        <span className="text-slate-400 w-16 text-right">
                          {prob.acceptanceRate > 0 ? `${prob.acceptanceRate.toFixed(1)}%` : '58.0%'}
                        </span>

                        <span className={`font-bold px-2 py-0.5 rounded-md border text-[10px] text-center w-12 ${diffColor}`}>
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. PAGINATION */}
          {pages > 1 && !loading && !error && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs font-semibold text-slate-500 text-center sm:text-left">
                Page {page} of {pages} · <strong className="text-slate-800">{total}</strong> questions
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePage(page - 1)}
                  disabled={page <= 1}
                  className="btn-secondary text-xs py-1 px-3 h-9 sm:h-8 disabled:opacity-40 font-bold rounded-lg"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                  const pg = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => handlePage(pg)}
                      className={`text-xs py-1 px-3 h-9 sm:h-8 rounded-lg border font-bold transition-all ${
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
                  className="btn-secondary text-xs py-1 px-3 h-9 sm:h-8 disabled:opacity-40 font-bold rounded-lg"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR (Desktop Sticky Calendar & Trending Companies) ── */}
        <aside className="w-72 shrink-0 hidden xl:flex flex-col gap-4 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          {/* Daily Quest Calendar Card (LeetCode Style) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>Day {selectedDay}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentMonthName} {currentYear}
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-[9px] font-extrabold text-rose-600 font-mono">
                  {currentMonthIndex}<span className="text-[7px] ml-0.5">{currentMonthName}</span>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-[9px] font-extrabold text-slate-400 py-0.5">{d}</div>
              ))}

              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`blank-${i}`} className="w-full h-6" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = dayNum === selectedDay;
                const isRealToday = isCurrentRealMonth && dayNum === realTodayDate;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDay(dayNum)}
                    className={`w-full h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-extrabold shadow-xs scale-105'
                        : isRealToday
                        ? 'bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Weekly Premium Progress Strip */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" /> Weekly Premium
                </span>
                <span className="text-[10px] text-slate-400 font-medium">1 day left</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px] font-bold">
                {['W1', 'W2', 'W3', 'W4', 'W5'].map((w, idx) => (
                  <div
                    key={w}
                    className={`py-1 rounded-lg ${
                      idx === 1
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {w}
                  </div>
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

            <div className="flex flex-wrap gap-1.5">
              {filteredCompanies.map((c) => {
                const isSelected = selectedCompany === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCompanyFilter(c.name)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded-full font-extrabold ${isSelected ? 'bg-white/20 text-white' : c.badgeColor}`}>
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* ── MOBILE FILTERS BOTTOM SHEET / MODAL ── */}
      {filterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setFilterModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-extrabold text-slate-900">Filter Problems</h2>
              </div>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Difficulty Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((d) => {
                  const isSel = difficulty === d;
                  return (
                    <button
                      key={d}
                      onClick={() => handleDifficulty(isSel ? '' : d)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        isSel
                          ? d === 'Easy'
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : d === 'Medium'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Category Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Main Categories</label>
              <div className="flex flex-wrap gap-1.5">
                {MAIN_TABS.map((tab) => {
                  const isSel = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleMainTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isSel ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtopic Tags Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Specific Sub-Topics</label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                {TOPIC_TAGS.map((t) => {
                  const isSel = activeTag === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => handleTag(t.name)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                        isSel ? 'bg-indigo-600 text-white font-bold' : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {t.name} ({t.count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Company Tags Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Company Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_COMPANIES.map((c) => {
                  const isSel = selectedCompany === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => handleCompanyFilter(c.name)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                        isSel ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { handleResetAllFilters(); setFilterModalOpen(false); }}
                className="btn-ghost flex-1 text-xs h-10 text-rose-600 hover:bg-rose-50 font-bold rounded-xl"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="btn-primary flex-1 text-xs h-10 justify-center font-bold rounded-xl shadow-md"
              >
                Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>
        </div>
      )}

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
