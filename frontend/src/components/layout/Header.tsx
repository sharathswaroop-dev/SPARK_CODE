'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Code2, ChevronDown, LogOut, User, Users, Trophy, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/playground', label: 'Playground' },
  { href: '/problems',   label: 'Problems'   },
  { href: '/groups',     label: 'Groups'     },
  { href: '/discussion', label: 'Discussion' },
  { href: '/contests',   label: 'Contests'   },
  { href: '/pricing',    label: 'Pricing'    },
];

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-xs">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-slate-900 shrink-0 group">
          <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs shadow-indigo-600/30 group-hover:bg-indigo-700 transition-colors">
            <Code2 className="w-4 h-4 text-white stroke-[2.5]" />
          </span>
          <span className="text-sm tracking-tight font-extrabold">SparkCode</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: User Menu or Auth Buttons */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-7 h-7 rounded-full ring-2 ring-indigo-100" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {session.user.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[90px] truncate">
                  {session.user.name ?? session.user.email}
                </span>
                <span className="tier-free">FREE</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[10px] text-slate-500 font-medium truncate">{session.user.email}</p>
                  </div>
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-lg mx-1 transition-colors" onClick={() => setMenuOpen(false)}>
                    <User className="w-3.5 h-3.5 text-indigo-600" /> Developer Profile
                  </Link>
                  <Link href="/groups" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-lg mx-1 transition-colors" onClick={() => setMenuOpen(false)}>
                    <Users className="w-3.5 h-3.5 text-indigo-600" /> Study Groups
                  </Link>
                  <Link href="/discussion" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-lg mx-1 transition-colors" onClick={() => setMenuOpen(false)}>
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Discussion
                  </Link>
                  <Link href="/contests" className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-lg mx-1 transition-colors" onClick={() => setMenuOpen(false)}>
                    <Trophy className="w-3.5 h-3.5 text-amber-500" /> Contests
                  </Link>
                  <hr className="my-1 border-slate-100 mx-3" />
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold rounded-lg mx-1 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signin" className="btn-ghost text-xs hidden sm:flex">Sign in</Link>
              <Link href="/signin" className="btn-primary text-xs">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
