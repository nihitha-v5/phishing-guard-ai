import React, { useState } from 'react';
import RiskGauge from './RiskGauge';
import { 
  Search, 
  Send, 
  RefreshCw, 
  FileText, 
  Link2, 
  Mail, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  BookOpen, 
  Lock, 
  Layers,
  Info,
  ChevronDown
} from 'lucide-react';

export default function AnalyzerView({ 
  formData, 
  setFormData, 
  onAnalyze, 
  loading, 
  report, 
  sampleScenarios = [], 
  onSelectScenario,
  selectedScenarioId,
  onNavigateToIntel,
  onNavigateToCoaching,
  onNavigateToProtection,
  onResetAnalysis,
  onOpenAssistant
}) {
  const [inputTab, setInputTab] = useState('message'); // 'message' | 'url' | 'headers'
  const [rawHeaders, setRawHeaders] = useState('');

  const handleParseHeaders = () => {
    if (!rawHeaders.trim()) return;
    let sender = '';
    let subject = '';
    let body = rawHeaders;

    const fromMatch = rawHeaders.match(/^From:\s*(.*)$/im);
    if (fromMatch) sender = fromMatch[1].trim();

    const subjMatch = rawHeaders.match(/^Subject:\s*(.*)$/im);
    if (subjMatch) subject = subjMatch[1].trim();

    body = rawHeaders
      .replace(/^From:.*$/im, '')
      .replace(/^To:.*$/im, '')
      .replace(/^Subject:.*$/im, '')
      .replace(/^Date:.*$/im, '')
      .trim();

    setFormData(prev => ({
      ...prev,
      sender: sender || prev.sender,
      subject: subject || prev.subject,
      body: body || prev.body
    }));
    setInputTab('message');
  };

  const handleClear = () => {
    setFormData({
      sender: '',
      subject: '',
      body: '',
      urls: [''],
      department: 'Finance',
      organizationDomain: 'acme-corp.com'
    });
    setRawHeaders('');
    if (onResetAnalysis) onResetAnalysis();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
            <Search className="w-3.5 h-3.5" />
            <span>Interactive Threat Scanner</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Analyze Threat
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            Submit a suspicious email, message body, or URL for multi-vector threat decomposition, domain authentication checking, and explainable risk evaluation.
          </p>

          {/* Sample Scenario Picker */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Load Sample Scenario:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {sampleScenarios.map(sc => {
                const isSelected = selectedScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => onSelectScenario(sc)}
                    className={`text-left p-3 rounded-xl border text-xs font-medium transition-all duration-150 flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-cyan-950/70 border-cyan-500/70 text-cyan-200 shadow-md shadow-cyan-950' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="font-semibold text-slate-100 truncate">{sc.title}</div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <span>{sc.category}</span>
                      <span className={`font-semibold ${
                        sc.difficulty.includes('Critical') ? 'text-red-400' :
                        sc.difficulty.includes('High') ? 'text-orange-400' : 'text-emerald-400'
                      }`}>
                        {sc.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace & Result View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Form (7 Cols on desktop) */}
        <div className={`glass-panel p-6 rounded-2xl space-y-5 ${report ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          
          {/* Workspace Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setInputTab('message')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  inputTab === 'message'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Message & Body</span>
              </button>

              <button
                type="button"
                onClick={() => setInputTab('url')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  inputTab === 'url'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Direct URL</span>
              </button>

              <button
                type="button"
                onClick={() => setInputTab('headers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  inputTab === 'headers'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Email Headers</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-900 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          {/* Form Controls */}
          {inputTab === 'headers' ? (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Paste RFC 5322 Email Headers & Raw Body:
              </label>
              <textarea
                rows={9}
                value={rawHeaders}
                onChange={e => setRawHeaders(e.target.value)}
                placeholder="From: IT Support <support@micros0ft.com>&#10;Subject: Urgent Password Expiry&#10;&#10;Please verify your account immediately..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleParseHeaders}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition"
              >
                Parse & Fill Form
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); onAnalyze(); }} className="space-y-4">
              
              {/* Sender & Department Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sender Information (Name & Email)
                  </label>
                  <input
                    type="text"
                    value={formData.sender}
                    onChange={e => setFormData({ ...formData, sender: e.target.value })}
                    placeholder='e.g. "IT Helpdesk" <support@micros0ft-security-auth.com>'
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Executive">Executive</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. FINAL NOTICE: Your Office 365 Password Expires Today"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Body Content */}
              {inputTab === 'message' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Message Body Content
                  </label>
                  <textarea
                    rows={6}
                    value={formData.body}
                    onChange={e => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Paste the message content here..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* URL Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Hyperlink / URL Destination
                </label>
                <input
                  type="text"
                  value={formData.urls[0] || ''}
                  onChange={e => setFormData({ ...formData, urls: [e.target.value] })}
                  placeholder="http://workday-portal.auth-verify-session.xyz/login/verify"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Engine: Explainable Heuristic & Risk Synthesis
                </span>

                <button
                  type="submit"
                  disabled={loading || (!formData.sender && !formData.subject && !formData.body && !formData.urls[0])}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg flex items-center gap-2 transition-all ${
                    loading || (!formData.sender && !formData.subject && !formData.body && !formData.urls[0])
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-cyan-500/25 active:scale-95'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning Indicators...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Analyze Threat</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Right Column: Professional Result Card (5 Cols on desktop) */}
        {report && (
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-5 animate-fadeIn border-l-4 border-l-cyan-500 flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Header Result */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Security Verdict
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {report.riskLevel === 'CRITICAL' || report.riskLevel === 'HIGH' ? '🚨 Threat Detected' : '✅ Standard Risk Level'}
                  </h3>
                </div>

                <span className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold ${
                  report.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40 glow-critical' :
                  report.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 glow-high' :
                  report.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {report.riskLevel}
                </span>
              </div>

              {/* Gauge & Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Risk Score</span>
                  <div className="text-2xl font-extrabold font-mono text-white">
                    <span className={report.score >= 50 ? 'text-red-400' : 'text-emerald-400'}>{report.score}</span>
                    <span className="text-xs text-slate-500 font-normal"> / 100</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Confidence</span>
                  <div className="text-2xl font-extrabold font-mono text-cyan-400">
                    {report.confidence || 96.4}%
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Attack Classification:</span>
                <span className="font-bold text-slate-100 font-mono text-xs mt-0.5 block">
                  {report.classification || 'Social Engineering / Phishing'}
                </span>
              </div>

              {/* Detected Indicators List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Detected Indicators ({report.indicators?.length || 0}):
                </span>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {report.indicators?.length > 0 ? (
                    report.indicators.map((ind, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="text-slate-200 truncate">{ind.title}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          ind.severity === 'CRITICAL' ? 'text-red-400 bg-red-500/10' : 'text-orange-400 bg-orange-500/10'
                        }`}>
                          {ind.severity}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 p-2 bg-slate-900/40 rounded-lg">
                      No malicious indicators detected.
                    </div>
                  )}
                </div>
              </div>

              {/* Plain English Explanation */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Explainable Threat Summary:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {report.threatSummary}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Recommended Action:</span>
                </div>
                <p className="text-emerald-200/90 leading-relaxed text-[11px]">
                  {report.safeActions && report.safeActions[0]}
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={onNavigateToIntel}
                  className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center justify-center gap-1"
                >
                  <span>Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onNavigateToCoaching}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Coaching</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAssistant && onOpenAssistant(report)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Ask AI</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 font-semibold transition text-center"
              >
                Analyze Another Message
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
