import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  Sliders, 
  ShieldAlert, 
  RefreshCw, 
  Save, 
  Info, 
  Cpu,
  CheckCircle2
} from 'lucide-react';

export default function SettingsView({ 
  formData, 
  setFormData, 
  onResetTelemetry, 
  engineMode,
  showToast 
}) {
  const [orgDomain, setOrgDomain] = useState(formData.organizationDomain || 'acme-corp.com');
  const [sensitivity, setSensitivity] = useState('Standard');
  const [alertThreshold, setAlertThreshold] = useState('High');
  const [resetting, setResetting] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      organizationDomain: orgDomain
    }));
    if (showToast) showToast('Enterprise settings saved successfully.');
  };

  const handleResetData = async () => {
    setResetting(true);
    try {
      await onResetTelemetry();
      if (showToast) showToast('Telemetry database reset to baseline seed data.');
    } catch (err) {
      if (showToast) showToast(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 mb-3">
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enterprise Configuration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Settings
          </h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            Configure target enterprise domain authentication boundaries, detection sensitivity thresholds, and telemetry storage.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="glass-panel p-6 sm:p-7 rounded-2xl space-y-6">
        
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            Domain & Identity Protection Settings
          </h2>
        </div>

        {/* Target Org Domain */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Target Organization Domain
          </label>
          <p className="text-[11px] text-slate-500">
            Used to identify sender domain mismatches and internal corporate spoofing.
          </p>
          <input
            type="text"
            value={orgDomain}
            onChange={e => setOrgDomain(e.target.value)}
            placeholder="acme-corp.com"
            className="w-full sm:w-80 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Detection Sensitivity */}
        <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
          <label className="block text-xs font-semibold text-slate-300">
            Heuristic Detection Sensitivity
          </label>
          <p className="text-[11px] text-slate-500">
            Controls the weighting of urgency regexes and lookalike domain edit distances.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {['Standard', 'High Sensitivity', 'Strict SOC Mode'].map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setSensitivity(mode)}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                  sensitivity === mode
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>{mode}</div>
                <span className="text-[10px] text-slate-500 font-normal block mt-1">
                  {mode === 'Standard' ? 'Balanced false positive rate' : mode === 'High Sensitivity' ? 'Aggressive brand checking' : 'Zero-trust inbound quarantine'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI & Engine Status */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Active Detection Engine Layer:
            </span>
            <span className="font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[11px]">
              {engineMode?.includes('gemini') ? 'Google Gemini Hybrid' : 'PhishGuard Heuristic Engine'}
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            The platform operates out-of-the-box via multi-vector heuristic rules, Levenshtein distance typosquatting detectors, and NLP urgency analyzers. Pluggable LLM keys can be supplied via <span className="font-mono text-slate-300">.env</span>.
          </p>
        </div>

        {/* Save CTA */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-900/30"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>

      {/* Demo Telemetry Reset Box */}
      <div className="glass-panel p-6 rounded-2xl space-y-3 border-l-4 border-l-amber-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              Demo Data & Telemetry Reset
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Restore the original seed baseline threats and events for fresh evaluation demos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Baseline Telemetry'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
