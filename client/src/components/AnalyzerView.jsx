import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  AlertCircle, 
  Sliders, 
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function AnalyzerView({ 
  formData, 
  setFormData, 
  onAnalyze, 
  loading, 
  sampleScenarios, 
  onSelectScenario,
  selectedScenarioId
}) {
  const [rawPasteMode, setRawPasteMode] = useState(false);
  const [rawText, setRawText] = useState('');

  const handleRawParse = () => {
    if (!rawText.trim()) return;
    
    // Simple header extraction
    let sender = '';
    let subject = '';
    let body = rawText;

    const fromMatch = rawText.match(/^From:\s*(.*)$/im);
    if (fromMatch) sender = fromMatch[1].trim();

    const subjMatch = rawText.match(/^Subject:\s*(.*)$/im);
    if (subjMatch) subject = subjMatch[1].trim();

    // Remove headers if present to get clean body
    body = rawText
      .replace(/^From:.*$/im, '')
      .replace(/^To:.*$/im, '')
      .replace(/^Subject:.*$/im, '')
      .replace(/^Date:.*$/im, '')
      .trim();

    setFormData(prev => ({
      ...prev,
      sender: sender || prev.sender,
      subject: subject || prev.subject,
      body: body || rawText
    }));

    setRawPasteMode(false);
  };

  const handleAddUrl = () => {
    setFormData(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }));
  };

  const handleUrlChange = (index, value) => {
    const updated = [...formData.urls];
    updated[index] = value;
    setFormData(prev => ({ ...prev, urls: updated }));
  };

  const handleRemoveUrl = (index) => {
    const updated = formData.urls.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, urls: updated }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 1: Intelligent Threat Detection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Inspect Suspicious Emails & Messages
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            PhishGuard AI analyzes sender authentication, lookalike typosquatting domains, psychological urgency markers, deceptive URL destinations, and credential harvesting gateways.
          </p>
        </div>

        {/* Quick Scenario Picker */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Load Real-World Scenario:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {sampleScenarios.map(sc => {
              const isSelected = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc)}
                  className={`text-left p-3 rounded-xl border text-xs font-medium transition-all duration-150 flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 shadow-md shadow-cyan-900/30' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="font-semibold text-slate-200 truncate">{sc.title}</div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span>{sc.category}</span>
                    <span className={`font-semibold ${sc.difficulty.includes('Critical') ? 'text-red-400' : sc.difficulty.includes('High') ? 'text-orange-400' : 'text-emerald-400'}`}>
                      {sc.difficulty}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Message Attributes & Content
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRawPasteMode(!rawPasteMode)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            >
              {rawPasteMode ? 'Switch to Form Fields' : 'Paste Raw EML / Headers'}
            </button>
            <button
              onClick={() => setFormData({
                sender: '',
                subject: '',
                body: '',
                urls: [''],
                department: 'Finance',
                organizationDomain: 'acme-corp.com'
              })}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        {rawPasteMode ? (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-300">
              Paste Raw Email Content or RFC Headers:
            </label>
            <textarea
              rows={10}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="From: IT Support <support@micros0ft.com>&#10;Subject: Urgent password notice&#10;&#10;Please verify immediately..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleRawParse}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition"
            >
              Extract & Apply Fields
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); onAnalyze(); }} className="space-y-5">
            {/* Sender & Department Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sender (Display Name & Email Address)
                </label>
                <input
                  type="text"
                  value={formData.sender}
                  onChange={e => setFormData({ ...formData, sender: e.target.value })}
                  placeholder='e.g. "Corporate Payroll" <payroll-department@gmail.com>'
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Department
                </label>
                <select
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Finance">Finance & Accounting</option>
                  <option value="Human Resources">Human Resources (HR)</option>
                  <option value="Engineering">Engineering / IT</option>
                  <option value="Executive">Executive Leadership</option>
                  <option value="Operations">Operations / Logistics</option>
                  <option value="Legal">Legal & Compliance</option>
                  <option value="Marketing">Marketing / Sales</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. URGENT: Action Required - Account Verification"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message Body Content
              </label>
              <textarea
                rows={7}
                value={formData.body}
                onChange={e => setFormData({ ...formData, body: e.target.value })}
                placeholder="Paste the full text of the suspicious email or message..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* URLs Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Target URLs / Hyperlinks (Auto-extracted or explicitly specified)
                </label>
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  + Add Another URL
                </button>
              </div>
              {formData.urls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={url}
                    onChange={e => handleUrlChange(idx, e.target.value)}
                    placeholder="http://suspicious-login.xyz/auth/verify"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {formData.urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(idx)}
                      className="text-slate-500 hover:text-red-400 text-xs px-2 py-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Protected Sandbox Evaluation • Transparent Multi-Vector Heuristics</span>
              </div>

              <button
                type="submit"
                disabled={loading || (!formData.sender && !formData.subject && !formData.body)}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                  loading || (!formData.sender && !formData.subject && !formData.body)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-cyan-500/25 active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Indicators...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Execute Full Security Scan</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
