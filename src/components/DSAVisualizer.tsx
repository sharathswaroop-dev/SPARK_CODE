'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Layers,
  Search,
  GitBranch,
  ListOrdered,
  Sparkles,
  Sliders
} from 'lucide-react';

type AlgorithmType = 'two_pointers' | 'binary_search' | 'stack' | 'tree_traversal';

export function DSAVisualizer() {
  const [algo, setAlgo] = useState<AlgorithmType>('two_pointers');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800); // ms per step

  // Two Pointers State
  const initialArray = [2, 7, 11, 15, 18, 24, 30];
  const targetSum = 25; // 7 + 18 = 25
  const twoPointerSteps = [
    { left: 0, right: 6, sum: 32, status: 'Sum 2+30 = 32 > 25 (Target). Decrement Right Pointer.' },
    { left: 0, right: 5, sum: 26, status: 'Sum 2+24 = 26 > 25 (Target). Decrement Right Pointer.' },
    { left: 0, right: 4, sum: 20, status: 'Sum 2+18 = 20 < 25 (Target). Increment Left Pointer.' },
    { left: 1, right: 4, sum: 25, status: 'Sum 7+18 = 25 == 25 (Target)! Match Found at indices (1, 4).' },
  ];

  // Binary Search State
  const bsArray = [1, 3, 5, 8, 12, 16, 21, 28, 35, 42];
  const bsTarget = 21;
  const binarySearchSteps = [
    { low: 0, high: 9, mid: 4, midVal: 12, status: 'Mid element is 12 < 21 (Target). Search right: low = mid + 1 (5).' },
    { low: 5, high: 9, mid: 7, midVal: 28, status: 'Mid element is 28 > 21 (Target). Search left: high = mid - 1 (6).' },
    { low: 5, high: 6, mid: 5, midVal: 16, status: 'Mid element is 16 < 21 (Target). Search right: low = mid + 1 (6).' },
    { low: 6, high: 6, mid: 6, midVal: 21, status: 'Mid element is 21 == 21 (Target)! Target located at index 6 in O(log N).' },
  ];

  // Stack Operations State
  const stackSteps = [
    { items: ['Push(10)'], stack: [10], op: 'Pushed 10 to stack top' },
    { items: ['Push(20)'], stack: [10, 20], op: 'Pushed 20 to stack top' },
    { items: ['Push(30)'], stack: [10, 20, 30], op: 'Pushed 30 to stack top' },
    { items: ['Pop()'], stack: [10, 20], op: 'Popped 30 from stack top (LIFO)' },
    { items: ['Push(40)'], stack: [10, 20, 40], op: 'Pushed 40 to stack top' },
  ];

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;

    const maxSteps =
      algo === 'two_pointers'
        ? twoPointerSteps.length - 1
        : algo === 'binary_search'
        ? binarySearchSteps.length - 1
        : stackSteps.length - 1;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= maxSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, algo, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleNext = () => {
    const maxSteps =
      algo === 'two_pointers'
        ? twoPointerSteps.length - 1
        : algo === 'binary_search'
        ? binarySearchSteps.length - 1
        : stackSteps.length - 1;
    if (currentStep < maxSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="p-4 space-y-5 text-slate-800">
      {/* Visualizer Mode Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
          Select Algorithm Simulation:
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => { setAlgo('two_pointers'); handleReset(); }}
            className={`py-1.5 px-2 text-[11px] font-extrabold rounded-xl border transition ${
              algo === 'two_pointers'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Two Pointers
          </button>
          <button
            onClick={() => { setAlgo('binary_search'); handleReset(); }}
            className={`py-1.5 px-2 text-[11px] font-extrabold rounded-xl border transition ${
              algo === 'binary_search'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Binary Search
          </button>
          <button
            onClick={() => { setAlgo('stack'); handleReset(); }}
            className={`py-1.5 px-2 text-[11px] font-extrabold rounded-xl border transition ${
              algo === 'stack'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Stack (LIFO)
          </button>
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl min-h-[220px] flex flex-col justify-between">
        {/* Step Indicator & Status */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <span className="font-extrabold text-indigo-400">
            Step {currentStep + 1} of{' '}
            {algo === 'two_pointers'
              ? twoPointerSteps.length
              : algo === 'binary_search'
              ? binarySearchSteps.length
              : stackSteps.length}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {isPlaying ? '⚡ Running' : '⏸ Paused'}
          </span>
        </div>

        {/* Algorithm Elements Visualization */}
        <div className="py-6 flex items-center justify-center">
          {algo === 'two_pointers' && (
            <div className="space-y-4 text-center">
              <div className="flex items-center gap-2 justify-center">
                {initialArray.map((val, idx) => {
                  const isLeft = twoPointerSteps[currentStep].left === idx;
                  const isRight = twoPointerSteps[currentStep].right === idx;
                  const isMatched =
                    twoPointerSteps[currentStep].left === idx ||
                    twoPointerSteps[currentStep].right === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-sm font-black transition-all duration-300 ${
                          isMatched
                            ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-500/30'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {val}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">[{idx}]</div>
                      <div className="h-4">
                        {isLeft && <span className="text-[10px] font-black text-emerald-400">L▲</span>}
                        {isRight && <span className="text-[10px] font-black text-rose-400">R▲</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {algo === 'binary_search' && (
            <div className="space-y-4 text-center">
              <div className="flex items-center gap-1.5 justify-center flex-wrap">
                {bsArray.map((val, idx) => {
                  const step = binarySearchSteps[currentStep];
                  const isLow = step.low === idx;
                  const isHigh = step.high === idx;
                  const isMid = step.mid === idx;
                  const inRange = idx >= step.low && idx <= step.high;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-9 h-11 rounded-xl border-2 flex items-center justify-center text-xs font-black transition-all duration-300 ${
                          isMid
                            ? 'bg-amber-500 border-amber-300 text-slate-950 scale-110 shadow-lg'
                            : inRange
                            ? 'bg-slate-800 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40'
                        }`}
                      >
                        {val}
                      </div>
                      <div className="text-[8px] font-mono text-slate-500">[{idx}]</div>
                      <div className="h-4 text-[9px] font-black">
                        {isMid ? (
                          <span className="text-amber-400">MID</span>
                        ) : isLow ? (
                          <span className="text-emerald-400">L</span>
                        ) : isHigh ? (
                          <span className="text-rose-400">H</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {algo === 'stack' && (
            <div className="flex flex-col-reverse items-center gap-1.5 w-32 border-b-4 border-l-4 border-r-4 border-slate-700 p-2 rounded-b-2xl bg-slate-950">
              {stackSteps[currentStep].stack.map((item, idx) => (
                <div
                  key={idx}
                  className="w-full py-2 bg-indigo-600 border border-indigo-400 rounded-lg text-center text-xs font-black text-white shadow-md animate-in slide-in-from-top-2 duration-200"
                >
                  {item}
                </div>
              ))}
              {stackSteps[currentStep].stack.length === 0 && (
                <div className="text-[10px] text-slate-600 italic py-4">Stack is empty</div>
              )}
            </div>
          )}
        </div>

        {/* Narrative Step Log */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
          <span className="text-indigo-400 font-bold">Execution Note: </span>
          {algo === 'two_pointers' && twoPointerSteps[currentStep].status}
          {algo === 'binary_search' && binarySearchSteps[currentStep].status}
          {algo === 'stack' && stackSteps[currentStep].op}
        </div>
      </div>

      {/* Control Buttons & Playback Speed */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 transition flex items-center"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button
            onClick={handleNext}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 transition flex items-center"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
