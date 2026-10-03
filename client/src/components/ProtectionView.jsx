import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  Ban, 
  Send, 
  HelpCircle, 
  Terminal, 
  KeyRound, 
  Sliders, 
  Zap,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function ProtectionView({ report, onUpdateAction, showToast }) {
  // Real interactive toggle controls
  const [controls, setControls] = useState({
    suspiciousLinks: true,
    credentialTheft: true,
    domainImpersonation: true,
    securityAwareness: true,
    threatAlerting: true
  });

  const [selectedUrlIndex, setSelectedUrlIndex] = useState(0);
  const [showCredDemo, setShowCredDemo] = useState(false);
  const [demoPassword, setDemoPassword] = useState('');
  const [credBlocked, setCredBlocked] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);

  const toggleControl = (key, label) => {
    setControls(prev => {
      const nextVal = !prev[key];
      const updated = { ...prev, [key]: nextVal };
      if (showToast) {
        showToast(`${label} is now ${nextVal ? 'ACTIVE' : 'DISABLED'}`);
      }
      return updated;
    });
  };

  const urlsAnalyzed = report?.urlsAnalyzed || [
    {
      raw: 'http://workday-portal.auth-verify-session.xyz/login/verify',
      protocol: 'http:',
      hostname: 'workday-portal.auth-verify-session.xyz',
      pathname: '/login/verify',
      tld: '.xyz',
      isIp: false,
      isSuspiciousTld: true,
      isValid: true
    }
  ];

  const currentUrl = urlsAnalyzed[selectedUrlIndex] || urlsAnalyzed[0];
  const eventId = report?.eventId;

  const handleAction = async (actionType, label) => {
    setActionStatus({ type: actionType, message: `Executing: ${label}...` });
    try {
      if (eventId && onUpdateAction) {
        await onUpdateAction(eventId, actionType);
      }
      setTimeout(() => {
        setActionStatus({ 
          type: actionType, 
          message: `✅ Action confirmed: ${label}. Telemetry event recorded.` 
        });
        if (showToast) showToast(`Action executed: ${label}`);
      }, 500);
    } catch (err) {
      setActionStatus({ type: 'error', message: `Failed to execute: ${err.message}` });
    }
  };

  const handleCredSubmit = (e) => {
    e.preventDefault();
    if (demoPassword) {
      setCredBlocked(true);
      if (eventId && onUpdateAction) {
        onUpdateAction(eventId, 'BLOCKED_CREDENTIAL');
      }
      if (showToast) showToast('🛡️ Credential Interception Triggered!');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Real-Time Defense & Link Containment</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Active Threat Protection
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              STATUS: ACTIVE
            </span>
          </div>

          <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            Configure automated interception policies, inspect untrusted hyperlinks in an isolated sandbox, and test real-time credential harvesting blockers.
          </p>
        </div>
      </div>

      {/* Interactive Protection Policy Controls */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Real-Time Protection Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          
          {/* Control 1 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100">Suspicious Link Detection</h3>
              <span className="text-[11px] text-slate-400 block mt-0.5">Intercepts high-risk TLDs & IP links</span>
            </div>
            <button
              onClick={() => toggleControl('suspiciousLinks', 'Suspicious Link Detection')}
              className={`p-1.5 rounded-lg transition ${
                controls.suspiciousLinks ? 'text-emerald-400' : 'text-slate-600'
              }`}
            >
              {controls.suspiciousLinks ? (
                <ToggleRight className="w-7 h-7" />
              ) : (
                <ToggleLeft className="w-7 h-7" />
              )}
            </button>
          </div>

          {/* Control 2 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100">Credential Theft Protection</h3>
              <span className="text-[11px] text-slate-400 block mt-0.5">Blocks input on unverified SSO gateways</span>
            </div>
            <button
              onClick={() => toggleControl('credentialTheft', 'Credential Theft Protection')}
              className={`p-1.5 rounded-lg transition ${
                controls.credentialTheft ? 'text-emerald-400' : 'text-slate-600'
              }`}
            >
              {controls.credentialTheft ? (
                <ToggleRight className="w-7 h-7" />
              ) : (
                <ToggleLeft className="w-7 h-7" />
              )}
            </button>
          </div>

          {/* Control 3 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100">Domain Impersonation Detection</h3>
              <span className="text-[11px] text-slate-400 block mt-0.5">Flags lookalike typosquatting domains</span>
            </div>
            <button
              onClick={() => toggleControl('domainImpersonation', 'Domain Impersonation Detection')}
              className={`p-1.5 rounded-lg transition ${
                controls.domainImpersonation ? 'text-emerald-400' : 'text-slate-600'
              }`}
            >
              {controls.domainImpersonation ? (
                <ToggleRight className="w-7 h-7" />
              ) : (
                <ToggleLeft className="w-7 h-7" />
              )}
            </button>
          </div>

          {/* Control 4 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100">Security Awareness Monitoring</h3>
              <span className="text-[11px] text-slate-400 block mt-0.5">Contextual coaching on dangerous actions</span>
            </div>
            <button
              onClick={() => toggleControl('securityAwareness', 'Security Awareness Monitoring')}
              className={`p-1.5 rounded-lg transition ${
                controls.securityAwareness ? 'text-emerald-400' : 'text-slate-600'
              }`}
            >
              {controls.securityAwareness ? (
                <ToggleRight className="w-7 h-7" />
              ) : (
                <ToggleLeft className="w-7 h-7" />
              )}
            </button>
          </div>

          {/* Control 5 */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-100">Threat Alerting & SOC Escalation</h3>
              <span className="text-[11px] text-slate-400 block mt-0.5">Real-time alerts for critical attacks</span>
            </div>
            <button
              onClick={() => toggleControl('threatAlerting', 'Threat Alerting')}
              className={`p-1.5 rounded-lg transition ${
                controls.threatAlerting ? 'text-emerald-400' : 'text-slate-600'
              }`}
            >
              {controls.threatAlerting ? (
                <ToggleRight className="w-7 h-7" />
              ) : (
                <ToggleLeft className="w-7 h-7" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Incident Containment Actions */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          Active Incident Containment Protocols
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleAction('QUARANTINED', 'Quarantine Message & Block Domain')}
            className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 hover:border-red-500 text-left transition group"
          >
            <div className="flex items-center justify-between text-red-400 mb-2">
              <Ban className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-red-900/60 rounded">Recommended</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100">Quarantine Message</h3>
            <p className="text-xs text-slate-400 mt-1">Isolates email from inbox and submits domain to perimeter firewall blocklist.</p>
          </button>

          <button
            onClick={() => handleAction('REPORTED_SOC', 'Report Incident to Security SOC')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-500 text-left transition group"
          >
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <Send className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-cyan-900/40 text-cyan-300 rounded">SOC Alert</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100">Report to Security SOC</h3>
            <p className="text-xs text-slate-400 mt-1">Escalates full forensic telemetry to security team for investigation.</p>
          </button>

          <button
            onClick={() => handleAction('FALSE_POSITIVE_FLAGGED', 'Flag as False Positive')}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-left transition group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <HelpCircle className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-800 text-slate-400 rounded">Review</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100">Mark False Positive</h3>
            <p className="text-xs text-slate-400 mt-1">Flags message for heuristic rule calibration if legitimate.</p>
          </button>
        </div>

        {actionStatus && (
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{actionStatus.message}</span>
          </div>
        )}
      </div>

      {/* URL Sandbox Deconstruction */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Isolated URL Deconstruction Sandbox
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect untrusted hyperlinks safely without executing scripts in your browser.
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

        {currentUrl && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold mb-1">Target Raw URL:</span>
              <span className="text-red-400 break-all">{currentUrl.raw}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hostname Target</span>
                <span className="text-xs font-mono font-bold text-orange-400 break-all">
                  {currentUrl.hostname}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {currentUrl.isIp ? '⚠️ Raw IP Host' : 'Destination Domain'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">TLD Category</span>
                <span className={`text-xs font-mono font-bold ${currentUrl.isSuspiciousTld ? 'text-red-400' : 'text-slate-300'}`}>
                  {currentUrl.tld || '.com'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {currentUrl.isSuspiciousTld ? '⚠️ High-Risk TLD (.xyz)' : 'Standard Registry'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Resource Path</span>
                <span className="text-xs font-mono font-bold text-slate-300 break-all">
                  {currentUrl.pathname || '/login'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Authentication Endpoint
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-red-300">PhishGuard Interception Barrier Active</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Direct navigation is intercepted. When accessing enterprise resources, navigate manually to your verified corporate bookmark instead of clicking email links.
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
            <h2 className="text-sm font-bold text-slate-100">Live Interactive: Credential Submission Shield Demo</h2>
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
                <h3 className="text-sm font-extrabold text-red-200">🛡️ PHISHGUARD CREDENTIAL INTERCEPT TRIGGERED!</h3>
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
