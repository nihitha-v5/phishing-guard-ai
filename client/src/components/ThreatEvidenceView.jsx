import React from 'react';
import RiskGauge from './RiskGauge';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Info, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle,
  FileSearch,
  Activity,
  UserX,
  Clock,
  KeyRound,
  Link2,
  Paperclip
} from 'lucide-react';

export default function ThreatEvidenceView({ report, onNavigateToProtect, onNavigateToEducate }) {
  if (!report) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl">
        <FileSearch className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-bold text-slate-300">No Analysis Loaded</h3>
        <p className="text-sm text-slate-500 mt-1">Please inspect a message or select a sample scenario in Step 1.</p>
      </div>
    );
  }

  const { score, riskLevel, threatSummary, indicators = [], safeActions = [], breakdown = {}, senderInfo, metadata } = report;

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'SENDER_ANOMALY':
      case 'IMPERSONATION':
        return UserX;
      case 'URGENCY_PRESSURE':
        return Clock;
      case 'CREDENTIAL_HARVEST':
        return KeyRound;
      case 'SUSPICIOUS_URL':
        return Link2;
      case 'ATTACHMENT_RISK':
        return Paperclip;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">LOW</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner: Score & Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Gauge Card */}
        <div className="lg:col-span-1">
          <RiskGauge score={score} riskLevel={riskLevel} />
          <div className="mt-3 text-center">
            <span className="text-[11px] font-mono text-slate-500">
              Engine: {metadata?.engineLabel || 'Explainable Heuristic Engine'}
            </span>
          </div>
        </div>

        {/* Threat Summary & Breakdown Card */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-7 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Explainable Threat Synthesis
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(report.analyzedAt || Date.now()).toLocaleTimeString()}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? '🚨 High Probability Social Engineering Attack' : '✅ Standard Risk Level'}
            </h2>

            <p className="text-slate-300 mt-2 text-sm leading-relaxed">
              {threatSummary}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Indicators</span>
                <span className="text-lg font-bold font-mono text-white">{indicators.length}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Sender Anomalies</span>
                <span className="text-lg font-bold font-mono text-orange-400">{(breakdown.senderAnomaly || 0) + (breakdown.impersonation || 0)}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Suspicious Links</span>
                <span className="text-lg font-bold font-mono text-red-400">{breakdown.suspiciousUrls || 0}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Urgency / Harvest</span>
                <span className="text-lg font-bold font-mono text-amber-400">{(breakdown.urgencyPressure || 0) + (breakdown.credentialHarvest || 0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onNavigateToProtect}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition"
            >
              <span>Step 3: Containment & Link Protection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigateToEducate}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <span>Step 4: View Coaching</span>
            </button>
          </div>
        </div>
      </div>

      {/* Structured Evidence Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-cyan-400" />
              Transparent Evidence & Anomaly Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              PhishGuard AI does not provide a black-box verdict. Every score point is linked to exact extracted evidence.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            {indicators.length} Threat Vectors Flagged
          </span>
        </div>

        {indicators.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-200">No Malicious Indicators Identified</h4>
            <p className="text-xs text-slate-400 mt-1">This message conforms to standard corporate communication patterns.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {indicators.map((ind, idx) => {
              const Icon = getCategoryIcon(ind.category);
              return (
                <div 
                  key={idx} 
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-150 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{ind.title}</h4>
                        <span className="text-[11px] text-slate-400">{ind.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">+{ind.scoreImpact} pts</span>
                      {getSeverityBadge(ind.severity)}
                    </div>
                  </div>

                  {/* Why this is suspicious */}
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Why This Is Suspicious:
                    </div>
                    <p className="text-slate-300 leading-relaxed">{ind.humanExplanation}</p>
                  </div>

                  {/* Technical details & Detected Snippet */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-950/40 border border-slate-800/60 font-mono text-[11px]">
                      <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Detected Excerpt / Value:</span>
                      <span className="text-amber-300 break-all">{ind.detectedSnippet}</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/40 border border-slate-800/60 font-mono text-[11px]">
                      <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">Technical Rule Trigger:</span>
                      <span className="text-slate-300">{ind.technicalDetail}</span>
                    </div>
                  </div>

                  {/* Recommended Verification */}
                  <div className="text-xs text-slate-400 flex items-start gap-1.5 pt-1">
                    <span className="font-semibold text-emerald-400">Recommended Action:</span>
                    <span>{ind.recommendedVerification}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Safe Next Steps */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          Recommended Action Protocol:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {safeActions.map((action, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                {i + 1}
              </span>
              <span className="leading-relaxed">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
