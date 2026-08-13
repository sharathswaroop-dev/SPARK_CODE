'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, ShieldCheck, Zap, Users, Star } from 'lucide-react';

const FREE_FEATURES = [
  'Unlimited Study Groups (Create & Join)',
  'Live Code Presenting & Screen Casting',
  'In-Group Voice/Video Chat & Text Chat',
  'Unlimited Code Playground (Python, JS, Java)',
  'Access to Easy Problems & Test Cases',
  'Global Discussion Board',
];

const MID_FEATURES = [
  'Everything in Free Tier, plus:',
  'Access to all Medium Problems',
  'Curated Study Plans & Topic Quests',
  'Priority Code Execution Runner',
];

const PRO_FEATURES = [
  'Everything in Mid Tier, plus:',
  'Access to Hard Difficulty Problems',
  'Official Live Contest Participation',
  'Detailed Execution Memory Profiling',
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">

      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          Full access to Study Groups, Live Code Casting, Group Chat, and Easy Coding Problems —&nbsp;
          <span className="font-bold text-emerald-600">100% Free Forever.</span>
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

        {/* Free Plan — Featured */}
        <div className="relative card p-6 flex flex-col justify-between border-2 border-indigo-600 shadow-lg shadow-indigo-600/10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Most Popular
            </span>
          </div>

          <div className="space-y-5">
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-extrabold text-slate-900">Free Tier</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">Perfect for students &amp; study groups.</p>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-extrabold text-slate-950">₹0</span>
                <span className="text-xs text-slate-400 font-medium">/ month forever</span>
              </div>
            </div>

            <ul className="space-y-2.5 border-t border-slate-100 pt-4">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <Link href="/groups" className="btn-primary w-full text-xs h-10 mt-6 justify-center">
            Get Started Free
          </Link>
        </div>

        {/* Mid Plan */}
        <div className="card p-6 flex flex-col justify-between border border-slate-200 bg-white">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900">Mid Tier</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">For intermediate interview prep.</p>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-extrabold text-slate-950">₹200</span>
                <span className="text-xs text-slate-400 font-medium">/ month</span>
              </div>
            </div>

            <ul className="space-y-2.5 border-t border-slate-100 pt-4">
              {MID_FEATURES.map((f, i) => (
                <li key={f} className={`flex items-center gap-2 text-xs font-medium ${i === 0 ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                  <Check className={`w-3.5 h-3.5 shrink-0 ${i === 0 ? 'text-indigo-500' : 'text-emerald-600'}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button disabled className="btn-secondary w-full text-xs h-10 mt-6 justify-center opacity-60 cursor-not-allowed">
            Coming Soon
          </button>
        </div>

        {/* Pro Plan */}
        <div className="card p-6 flex flex-col justify-between border border-slate-200 bg-white">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <h2 className="text-base font-extrabold text-amber-900">Pro Tier</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">For advanced competitive coders.</p>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-extrabold text-slate-950">₹700</span>
                <span className="text-xs text-slate-400 font-medium">/ month</span>
              </div>
            </div>

            <ul className="space-y-2.5 border-t border-slate-100 pt-4">
              {PRO_FEATURES.map((f, i) => (
                <li key={f} className={`flex items-center gap-2 text-xs font-medium ${i === 0 ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                  <Check className={`w-3.5 h-3.5 shrink-0 ${i === 0 ? 'text-amber-500' : 'text-emerald-600'}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button disabled className="btn-secondary w-full text-xs h-10 mt-6 justify-center opacity-60 cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>

      {/* Free Groups Banner */}
      <div className="card p-6 bg-emerald-50 border border-emerald-200 text-center space-y-2">
        <Users className="w-8 h-8 text-emerald-600 mx-auto" />
        <h3 className="text-sm font-extrabold text-emerald-900">Groups, Live Watch &amp; Chat are 100% Free — Forever</h3>
        <p className="text-xs text-emerald-700 font-medium leading-relaxed max-w-lg mx-auto">
          Study Groups, Live Code Casting, Voice/Video Chat, Text Chat, and Code Presenting will never be paywalled.
          SparkCode's core collaboration features belong to the entire community.
        </p>
      </div>
    </div>
  );
}
