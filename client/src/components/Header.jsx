import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Settings, 
  Bell, 
  User, 
  Sparkles,
  Activity,
  Zap
} from 'lucide-react';

export default function Header({ onQuickAnalyze, onOpenSettings, engineMode }) {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      {/* Title & Tagline */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>PhishGuard AI</span>
            <span className="hidden md:inline text-xs font-normal text-slate-400">
              — Explainable Phishing Detection & Security Awareness
            </span>
          </h1>
        </div>
      </div>

      {/* Right Controls & Status */}
      <div className="flex items-center gap-3">
        {/* Protection Active Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-semibold text-[11px]">Protection Active</span>
        </div>

        {/* Engine Mode */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono text-cyan-300">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>{engineMode?.includes('gemini') ? 'Gemini Hybrid' : 'Heuristic Engine'}</span>
        </div>

        {/* Quick Analyze CTA */}
        <button
          onClick={onQuickAnalyze}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm shadow-cyan-900/40"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick Scan</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/60 transition"
          title="Security Platform Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
