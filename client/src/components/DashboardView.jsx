import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Activity, 
  Users, 
  TrendingUp, 
  Lock, 
  AlertOctagon, 
  ArrowUpRight, 
  ChevronRight, 
  FileSearch, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Building2,
  Bot,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function DashboardView({ 
  telemetryData, 
  onNavigateToAnalyze, 
  onNavigateToIntel, 
  onSelectThreatDetail,
  onOpenAssistant 
}) {
  const kpis = telemetryData?.kpis || {
    threatsDetected: 127,
    criticalThreats: 18,
    usersProtected: 1284,
    detectionAccuracy: 96.4,
    avgRiskScore: 72
  };

  const vectorDistribution = telemetryData?.vectorDistribution || [];
  const recentEvents = telemetryData?.recentEvents || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Security Overview Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>SOC Incident Response & Defense Center</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security Overview
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            Monitor phishing threats, analyze suspicious messages in real-time, and improve organizational security awareness with transparent AI explainability.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToAnalyze}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Analyze a Threat</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToIntel}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700/80 flex items-center gap-2 transition"
            >
              <FileSearch className="w-4 h-4 text-cyan-400" />
              <span>View Threat Intelligence</span>
            </button>

            <button
              onClick={onOpenAssistant}
              className="px-4 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-semibold text-xs sm:text-sm border border-cyan-500/40 flex items-center gap-2 transition"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Threats Detected */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-cyan-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Threats Detected</span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {kpis.threatsDetected}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium pt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12% from last week</span>
          </div>
        </div>

        {/* Metric 2: Critical Threats */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-red-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Critical Threats</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-red-400">
            {kpis.criticalThreats}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            <span>High-severity attacks</span>
          </div>
        </div>

        {/* Metric 3: Users Protected */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Users Protected</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">
            {kpis.usersProtected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            <span>99.2% org coverage</span>
          </div>
        </div>

        {/* Metric 4: Detection Accuracy */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Detection Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-400">
            {kpis.detectionAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            <span>0.2% false positive rate</span>
          </div>
        </div>

        {/* Metric 5: Average Risk Score */}
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Risk Score</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {kpis.avgRiskScore} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-amber-400/90 font-medium pt-1">
            <span>Status: Elevated vigilance</span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Vectors & Live Threat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Threat Activity Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Recent Threat Activity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any incident to inspect forensic indicators, explainable evidence, and recommended containment actions.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 self-start sm:self-auto">
              Live SOC Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Threat / Subject</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentEvents.slice(0, 6).map(evt => {
                  const isCritical = evt.riskLevel === 'CRITICAL';
                  const isHigh = evt.riskLevel === 'HIGH';
                  const isLow = evt.riskLevel === 'LOW';

                  return (
                    <tr 
                      key={evt.id} 
                      onClick={() => onSelectThreatDetail(evt)}
                      className="hover:bg-slate-900/80 cursor-pointer transition group"
                    >
                      <td className="py-3 px-3 max-w-[220px]">
                        <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition truncate">
                          {evt.subject}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {evt.sender}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          isHigh ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          isLow ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {evt.riskLevel}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {evt.classification || 'Phishing Attack'}
                      </td>

                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {evt.department || 'Finance'}
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[11px] font-semibold text-cyan-400 group-hover:underline flex items-center gap-1">
                          Inspect <ChevronRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Top Threat Vectors */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Active Threat Vectors
            </h3>

            <div className="space-y-3.5 mt-4">
              {vectorDistribution.map((vec, i) => {
                const maxCount = Math.max(...vectorDistribution.map(v => v.count), 1);
                const pct = Math.round((vec.count / maxCount) * 100);

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{vec.name}</span>
                      <span className="font-mono text-slate-400">{vec.count} hits</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={onNavigateToIntel}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-cyan-300 font-bold border border-cyan-500/30 flex items-center justify-center gap-1.5 transition"
            >
              <span>Explore All Threat Forensics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* AI Assistant Help CTA Card */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-cyan-950/30 to-blue-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Need help understanding a threat?</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300">AI Copilot</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask questions about deceptive indicators, verify suspicious links, and receive step-by-step incident response guidance.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAssistant}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-900/40 flex items-center gap-2 transition shrink-0 self-stretch sm:self-auto justify-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask PhishGuard AI</span>
        </button>
      </div>

    </div>
  );
}

