import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  AlertOctagon, 
  ExternalLink, 
  CheckCircle2, 
  Ban, 
  Send, 
  HelpCircle,
  Eye,
  Terminal,
  KeyRound,
  Compass
} from 'lucide-react';

export default function ProtectionHub({ report, onUpdateAction }) {
  const [actionStatus, setActionStatus] = useState(null);
  const [selectedUrlIndex, setSelectedUrlIndex] = useState(0);
  const [showCredDemo, setShowCredDemo] = useState(false);
  const [demoPassword, setDemoPassword] = useState('');
  const [credBlocked, setCredBlocked] = useState(false);

  if (!report) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl">
        <Lock className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-bold text-slate-300">No Active Threat to Contain</h3>
        <p className="text-sm text-slate-500 mt-1">Run an analysis in Step 1 to access the Protection & Sandbox Hub.</p>
      </div>
    );
  }

  const { urlsAnalyzed = [], eventId, riskLevel } = report;
  const currentUrl = urlsAnalyzed[selectedUrlIndex];

  const handleAction = async (actionType, label) => {
    setActionStatus({ type: actionType, message: `Action executing: ${label}...` });
    try {
      if (eventId) {
        await onUpdateAction(eventId, actionType);
      }
      setTimeout(() => {
        setActionStatus({ 
          type: actionType, 
          message: `✅ Successfully executed: ${label}. Telemetry event #${eventId || 'local'} updated.` 
        });
      }, 600);
    } catch (err) {
      setActionStatus({ type: 'error', message: `Failed to record action: ${err.message}` });
    }
  };

  const handleCredSubmit = (e) => {
    e.preventDefault();
    if (demoPassword) {
      setCredBlocked(true);
      if (eventId) {
        onUpdateAction(eventId, 'BLOCKED_CREDENTIAL');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Step 3: User Intervention & Active Protection</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Contain Threats & Intercept Dangerous Actions
          </h2>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            PhishGuard AI intercepts suspicious clicks before your browser opens malicious sites and prevents credential disclosure on unverified gateways.
          </p>
        </div>
      </div>

      {/* Incident Response Buttons */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          Active Incident Containment Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleAction('QUARANTINED', 'Quarantine Email & Block Domain')}
            className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 hover:border-red-500 text-left transition-all duration-150 group"
          >
            <div className="flex items-center justify-between text-red-400 mb-2">
              <Ban className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-red-900/60 rounded">Recommended</span>
            </div>
            <h4 className="text-sm font-bold text-slate-100">Quarantine Message</h4>
            <p className="text-xs text-slate-400 mt-1">Removes message from inbox and submits domain to perimeter blocklist.</p>
          </button>

          <button
            onClick={() => handleAction('REPORTED_SOC', 'Report Incident to Security Team (SOC)')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-500 text-left transition-all duration-150 group"
          >
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <Send className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-cyan-900/40 text-cyan-300 rounded">SOC Alert</span>
            </div>
            <h4 className="text-sm font-bold text-slate-100">Report to Security SOC</h4>
            <p className="text-xs text-slate-400 mt-1">Escalates full forensic telemetry to security analysts for investigation.</p>
          </button>

          <button
            onClick={() => handleAction('FALSE_POSITIVE_FLAGGED', 'Flag as False Positive')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-left transition-all duration-150 group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <HelpCircle className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded">Review</span>
            </div>
            <h4 className="text-sm font-bold text-slate-100">Mark False Positive</h4>
            <p className="text-xs text-slate-400 mt-1">Flags message for heuristic rule tuning if email was legitimate.</p>
          </button>
        </div>

        {actionStatus && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{actionStatus.message}</span>
          </div>
        )}
      </div>

      {/* Interactive URL Sandbox Deconstruction */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              Isolated URL Deconstruction Sandbox
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect suspicious destinations safely without opening them in your browser.
            </p>
          </div>

          {urlsAnalyzed.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {urlsAnalyzed.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedUrlIndex(i)}
                  className={`px-2.5 py-1 text-xs rounded font-mono ${
                    selectedUrlIndex === i ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Link #{i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {!currentUrl ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/50 rounded-xl">
            No links were extracted or provided for sandbox inspection.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Raw Link Display */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold mb-1">Target Raw URL:</span>
              <span className="text-red-400 break-all">{currentUrl.raw}</span>
            </div>

            {/* Deconstructed URL Components */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Protocol</span>
                <span className={`text-xs font-mono font-bold ${currentUrl.protocol === 'https:' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currentUrl.protocol || 'http:'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {currentUrl.protocol === 'https:' ? 'Encrypted tunnel' : 'Unencrypted plain HTTP'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hostname / Domain</span>
                <span className="text-xs font-mono font-bold text-orange-400 break-all">
                  {currentUrl.hostname}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {currentUrl.isIp ? '⚠️ Raw IP Address (Phishing Indicator)' : 'Root Domain Target'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">TLD Extension</span>
                <span className={`text-xs font-mono font-bold ${currentUrl.isSuspiciousTld ? 'text-red-400' : 'text-slate-300'}`}>
                  {currentUrl.tld || 'None'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {currentUrl.isSuspiciousTld ? '⚠️ High-Risk TLD (.xyz/.top)' : 'Standard Registry TLD'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Resource Path</span>
                <span className="text-xs font-mono font-bold text-slate-300 break-all">
                  {currentUrl.pathname || '/'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Target Endpoint
                </span>
              </div>
            </div>

            {/* Sandbox Intercept Status */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-300">PhishGuard Out-of-Band Interceptor Active</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Direct navigation to this hyperlink is intercepted. If this is a work-related task, open your verified bookmark or internal company portal directly instead of following links in email.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Credential Harvester Intercept Simulation */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Live Interactive: Credential Submission Shield Demo</h3>
          </div>
          <button
            onClick={() => { setShowCredDemo(!showCredDemo); setCredBlocked(false); }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            {showCredDemo ? 'Hide Demo' : 'Try Live Simulation'}
          </button>
        </div>

        {showCredDemo && (
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4 animate-fadeIn">
            <p className="text-xs text-slate-300">
              Simulate what happens if a user accidentally types their password on a fake portal destination like <span className="font-mono text-orange-400">auth-verify-session.xyz</span>:
            </p>

            {credBlocked ? (
              <div className="p-4 rounded-xl bg-red-950/80 border border-red-500 text-center space-y-2 glow-critical">
                <AlertOctagon className="w-8 h-8 text-red-400 mx-auto" />
                <h4 className="text-sm font-extrabold text-red-200">🛡️ PHISHGUARD CREDENTIAL INTERCEPT TRIGGERED!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Submission BLOCKED. PhishGuard prevented your password from being transmitted to <span className="font-mono text-red-400">auth-verify-session.xyz</span> because the domain is unverified and exhibits spoofing indicators.
                </p>
                <button
                  onClick={() => { setCredBlocked(false); setDemoPassword(''); }}
                  className="mt-2 text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold"
                >
                  Reset Demo
                </button>
              </div>
            ) : (
              <form onSubmit={handleCredSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  value={demoPassword}
                  onChange={e => setDemoPassword(e.target.value)}
                  placeholder="Type simulated password to test intercept..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={!demoPassword}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
                >
                  Simulate Form Submit
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
