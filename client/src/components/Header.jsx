import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  Sparkles, 
  Zap, 
  ChevronDown, 
  Bot,
  Building2,
  Shield
} from 'lucide-react';

export default function Header({ 
  currentUser, 
  onLogout, 
  onQuickAnalyze, 
  onOpenSettings, 
  onOpenAssistant,
  engineMode 
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = currentUser?.fullName || 'Security Analyst';
  const userRole = currentUser?.role || 'Security Analyst';
  const userEmail = currentUser?.email || 'analyst@phishguard.demo';
  const userOrg = currentUser?.organization || 'Acme Enterprise SOC';

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
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-semibold text-[11px]">Protection Active</span>
        </div>

        {/* AI Copilot Header Button */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition shadow-sm"
          title="Open AI Security Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">AI Copilot</span>
        </button>

        {/* Quick Analyze CTA */}
        <button
          onClick={onQuickAnalyze}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm shadow-cyan-900/40"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick Scan</span>
        </button>

        {/* Profile Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block truncate max-w-[120px]">
              <div className="font-semibold text-xs text-slate-200 truncate">{userName}</div>
              <div className="text-[10px] text-cyan-400 truncate">{userRole}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Card */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl shadow-black/80 py-2 z-50 animate-fadeIn divide-y divide-slate-800/60">
              
              {/* User Details */}
              <div className="px-4 py-3 space-y-1">
                <div className="font-bold text-xs text-white truncate">{userName}</div>
                <div className="text-[11px] font-mono text-slate-400 truncate">{userEmail}</div>
                <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-semibold pt-1">
                  <Shield className="w-3 h-3" />
                  <span>{userRole} • {userOrg}</span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2.5 transition"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Security Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenAssistant) onOpenAssistant();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2.5 transition"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>

              {/* Logout Action */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 flex items-center gap-2.5 transition font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}
