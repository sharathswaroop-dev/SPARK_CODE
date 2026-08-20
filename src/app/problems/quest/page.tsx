'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Calendar,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ProblemsQuestPage() {
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

  const currentYear = calendarDate.getFullYear();
  const currentMonthName = calendarDate.toLocaleString('default', { month: 'long' });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Daily Challenge & Quest Streak
          </h1>
          <p className="text-xs text-slate-500">
            Solve 1 challenge every day to build consistency and keep your problem-solving streak alive.
          </p>
        </div>
        <Link href="/problems" className="text-xs text-indigo-600 font-bold hover:underline">
          ← Back to All Problems
        </Link>
      </div>

      {/* Today's Daily Problem Card */}
      <div className="card p-6 border-2 border-indigo-600 bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold px-3 py-1 bg-amber-400 text-slate-950 rounded-full uppercase tracking-wider">
            Selected Day: {currentMonthName} {selectedDay}, {currentYear}
          </span>
          <span className="text-xs text-slate-300 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5" /> 14h 22m remaining
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white">Two Sum</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="badge-easy">Easy</span>
            <span className="text-slate-400">Category: Array</span>
          </div>

          <Link href="/problems/two-sum" className="btn-primary text-xs h-9 bg-indigo-500 hover:bg-indigo-400 text-white font-bold border-none">
            Solve Daily Quest <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Streak tracker box */}
      <div className="card p-6 border border-slate-200 space-y-4 bg-white shadow-xs rounded-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {currentMonthName} {currentYear} Quest Calendar
          </h3>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 font-mono">
              {currentMonthName} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-xs font-bold text-slate-400 py-1">{d}</div>
          ))}

          {/* Blank offset placeholders */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`blank-${i}`} className="p-2" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isCompleted = isCurrentRealMonth ? dayNum < realTodayDate : true;
            const isSelected = dayNum === selectedDay;
            const isToday = isCurrentRealMonth && dayNum === realTodayDate;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDay(dayNum)}
                className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center justify-between gap-1 transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isToday
                    ? 'bg-amber-50 text-amber-900 border border-amber-300'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                }`}
              >
                <span>{dayNum}</span>
                {isCompleted ? (
                  <CheckCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
