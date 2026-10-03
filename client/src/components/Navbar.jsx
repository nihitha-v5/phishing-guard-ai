import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Eye, 
  Lock, 
  GraduationCap, 
  BarChart3, 
  Sparkles,
  Activity
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, hasAnalysis, engineMode }) {
  const navItems = [
    { id: 'detect', label: '1. Detect', icon: Search, desc: 'Analyze Message' },
    { id: 'explain', label: '2. Explain', icon: Eye, desc: 'Evidence & Score', disabled: !hasAnalysis },
    { id: 'protect', label: '3. Protect', icon: Lock, desc: 'Safe Actions & Sandbox', disabled: !hasAnalysis },
    { id: 'educate', label: '4. Educate', icon: GraduationCap, desc: 'Security Coaching', disabled: !hasAnalysis },
    { id: 'improve', label: '5. Improve', icon: BarChart3, desc: 'Admin Telemetry' }
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('detect')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  PHISHGUARD
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Explainable Defense & Human Coaching</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && setActiveTab(item.id)}
                  disabled={item.disabled}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : item.disabled
                      ? 'opacity-40 cursor-not-allowed text-slate-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={item.desc}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Live Engine Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 font-mono text-[11px]">
              {engineMode?.includes('gemini') ? 'Gemini Hybrid Active' : 'Heuristic Engine Active'}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
