'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Home,
  Layers,
  Swords,
  Users,
  User,
  LogIn
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide on standalone full-screen stadiums or playgrounds if preferred, or keep minimal
  const isStadium = pathname.startsWith('/battles/') && pathname !== '/battles';

  if (isStadium) return null;

  const NAV_ITEMS = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/problems', label: 'Problems', icon: Layers },
    { href: '/battles', label: 'Battles', icon: Swords },
    { href: '/groups', label: 'Groups', icon: Users },
    {
      href: session?.user ? '/profile' : '/signin',
      label: session?.user ? 'Profile' : 'Sign in',
      icon: session?.user ? User : LogIn
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around safe-bottom"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[56px] min-h-[44px] transition-all ${
              isActive
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
