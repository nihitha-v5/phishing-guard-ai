import React from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  GraduationCap, 
  Clock, 
  Building2, 
  User, 
  KeyRound, 
  Link2, 
  FileText,
  Activity,
  Ban,
  ArrowRight
} from 'lucide-react';

export default function ThreatDetailModal({ threat, onClose, onQuarantine, onNavigateToCoaching }) {
  if (!threat) return null;

  const isHighRisk = threat.riskLevel === 'CRITICAL' || threat.riskLevel === 'HIGH';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between sticky top-0 bg-slate-950/95 backdrop-blur-md z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                threat.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                threat.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                threat.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {threat.riskLevel} RISK
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(threat.timestamp || Date.now()).toLocaleString()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {threat.subject || 'Threat Inspection Details'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Risk Score</span>
              <div className="text-xl font-extrabold font-mono text-white flex items-baseline gap-1">
                <span className={isHighRisk ? 'text-red-400' : 'text-emerald-400'}>{threat.riskScore}</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Confidence</span>
              <div className="text-xl font-extrabold font-mono text-cyan-400">
                {threat.confidence || 96.4}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Department</span>
              <div className="text-sm font-semibold text-slate-200 truncate mt-1">
                {threat.department || 'Finance'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Containment</span>
              <div className="text-xs font-semibold text-slate-300 mt-1">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                  {threat.userAction || 'ANALYZED'}
                </span>
              </div>
            </div>
          </div>

          {/* Threat Classification & Sender */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Classification:</span>
              <span className="font-bold text-white font-mono">{threat.classification || 'Social Engineering / Phishing'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sender Address:</span>
              <span className="font-mono text-amber-300 break-all">{threat.sender}</span>
            </div>
          </div>

          {/* Explainable Evidence */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Detected Threat Evidence & Explainability
            </h3>

            {threat.evidence && threat.evidence.length > 0 ? (
              <div className="space-y-2.5">
                {threat.evidence.map((ev, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-200">{ev.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        ev.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {ev.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{ev.explanation}</p>
                    {ev.snippet && (
                      <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-amber-300 break-all">
                        Snippet: "{ev.snippet}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 text-center">
                No active threat indicators identified. Standard corporate communication profile.
              </div>
            )}
          </div>

          {/* Recommended Action */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Recommended Security Protocol
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isHighRisk 
                ? 'Do not interact with hyperlinks or provide credentials. Quarantine this email and submit a threat report to the SOC team.'
                : 'Follow standard corporate communication protocols. Exercise routine caution.'}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              if (onQuarantine) onQuarantine(threat.id);
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Ban className="w-4 h-4" />
            <span>Quarantine & Contain</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (onNavigateToCoaching) onNavigateToCoaching();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Launch Coaching</span>
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
