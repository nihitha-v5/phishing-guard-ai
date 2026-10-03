import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  ShieldAlert, 
  Lock, 
  GraduationCap, 
  BarChart3, 
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'analyze', label: 'Analyze Threat', icon: Search, badge: 'Scanner' },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: ShieldAlert, badge: null },
    { id: 'protection', label: 'Protection', icon: Lock, badge: 'Active' },
    { id: 'coaching', label: 'Security Coaching', icon: GraduationCap, badge: 'Training' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className={`bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Top Branding */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div 
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    PHISHGUARD
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Enterprise SOC</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-cyan-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        item.badge === 'Active' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      {!isCollapsed ? (
        <div className="p-4 m-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Shield Status</span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Real-time link sandbox & heuristic risk engine active.
          </p>
        </div>
      ) : (
        <div className="p-3 text-center">
          <span className="w-2.5 h-2.5 mx-auto rounded-full bg-emerald-400 block animate-pulse" title="Protection Active"></span>
        </div>
      )}
    </aside>
  );
}
