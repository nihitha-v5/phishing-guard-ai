import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  UserX, 
  Link2, 
  Clock, 
  KeyRound, 
  FileSearch, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Building2,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const THREAT_KNOWLEDGE_BASE = [
  {
    id: 'kb-sender-spoof',
    category: 'Sender Reputation',
    title: 'Display Name vs RFC 5322 Address Mismatch',
    severity: 'CRITICAL',
    whyItMatters: 'Attackers manipulate the human-readable display name to show trusted executive or brand identities while sending from unverified third-party email addresses.',
    evidenceExample: '"Microsoft Office 365" <security-auth@foreign-domain.xyz>',
    defenseRule: 'Always inspect the actual domain following the @ symbol, not just the display name.'
  },
  {
    id: 'kb-typosquat',
    category: 'Domain Analysis',
    title: 'Lookalike Typosquatting Domain',
    severity: 'CRITICAL',
    whyItMatters: 'Adversaries register domains with subtle character replacements (e.g. "0" for "o" or "l" for "1") to deceive busy users during visual inspection.',
    evidenceExample: 'micros0ft-security.com (Levenshtein Distance = 1)',
    defenseRule: 'Check character spelling closely in links and browser address bars.'
  },
  {
    id: 'kb-raw-ip',
    category: 'URL Analysis',
    title: 'Raw Numerical IP Address Destination',
    severity: 'CRITICAL',
    whyItMatters: 'Legitimate enterprise services use certified domain names. Raw IP addresses in hyperlinks circumvent domain registration reputation controls.',
    evidenceExample: 'http://185.220.101.5/tracking/dhl-package.php',
    defenseRule: 'Never open links containing raw IP addresses instead of trusted domain names.'
  },
  {
    id: 'kb-urgency',
    category: 'Psychological Manipulation',
    title: 'Artificial Fear & Immediate Deadline Triggers',
    severity: 'HIGH',
    whyItMatters: 'Creating extreme urgency ("Account suspended in 2 hours!") overwhelms rational cognitive evaluation, pushing users into impulsive clicks.',
    evidenceExample: 'FINAL NOTICE: Your Office 365 Password Expires Today. Act within 2 hours.',
    defenseRule: 'Whenever an email threatens immediate negative consequences, pause and verify via a known official portal.'
  },
  {
    id: 'kb-cred-harvest',
    category: 'Credential Harvesting',
    title: 'Deceptive Single Sign-On (SSO) Gateways',
    severity: 'CRITICAL',
    whyItMatters: 'Cloned login pages intercept enterprise credentials, session cookies, and multi-factor authentication (MFA) tokens.',
    evidenceExample: 'http://workday-portal.auth-verify-session.xyz/login/verify',
    defenseRule: 'Never log into corporate services through links in unrequested emails. Bookmark official SSO portals.'
  },
  {
    id: 'kb-free-provider',
    category: 'Brand Impersonation',
    title: 'Corporate Notice Originating from Free Consumer Email',
    severity: 'HIGH',
    whyItMatters: 'Legitimate HR and IT departments never send payroll or authentication requests from free public email providers (@gmail.com, @yahoo.com).',
    evidenceExample: 'Company HR & Payroll <payroll-dept@gmail.com>',
    defenseRule: 'Flag any corporate notification originating from public consumer mail servers.'
  },
  {
    id: 'kb-suspicious-tld',
    category: 'URL Analysis',
    title: 'High-Risk Disposable Top-Level Domain (TLD)',
    severity: 'HIGH',
    whyItMatters: 'Disposable TLDs (.xyz, .top, .click, .buzz) are frequently leveraged for cheap, short-lived phishing campaigns.',
    evidenceExample: 'https://docusign.net.contract-signing-service.top/review',
    defenseRule: 'Inspect the root domain directly before the single slash to identify the genuine host.'
  }
];

export default function ThreatIntelView({ report, onNavigateToAnalyze }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const activeIndicators = report?.indicators || [];

  const filteredKnowledge = THREAT_KNOWLEDGE_BASE.filter(item => {
    const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.whyItMatters.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Explainable Intelligence Repository</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Threat Intelligence & Explainable Evidence
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            PhishGuard AI decomposes every social engineering vector into transparent, evidence-backed forensic indicators. Learn the technical mechanisms behind modern deception.
          </p>
        </div>
      </div>

      {/* If Active Analysis exists, show Live Incident Evidence */}
      {report && (
        <div className="glass-panel p-6 sm:p-7 rounded-2xl space-y-4 border-l-4 border-l-cyan-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono tracking-wider">
                Live Analysis Forensics
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Active Threat Evidence ({activeIndicators.length} Flagged Indicators)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Risk Score:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                report.score >= 50 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {report.score}/100 ({report.riskLevel})
              </span>
            </div>
          </div>

          {activeIndicators.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl">
              No suspicious indicators flagged in the active message.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeIndicators.map((ind, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-100">{ind.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      ind.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {ind.severity}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-amber-300 break-all">
                    Excerpt: {ind.detectedSnippet}
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px]">{ind.humanExplanation}</p>

                  <div className="text-[11px] text-emerald-400 font-medium pt-1 border-t border-slate-800/60">
                    Defense: {ind.recommendedVerification}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Threat Knowledge Base Section */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-cyan-400" />
              Evidence Taxonomy & Attack Categories
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive threat signatures evaluated by the PhishGuard heuristic engine.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search threat rules..."
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 w-40 sm:w-48"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Sender Reputation">Sender Reputation</option>
              <option value="Domain Analysis">Domain Analysis</option>
              <option value="URL Analysis">URL Analysis</option>
              <option value="Psychological Manipulation">Psychological Manipulation</option>
              <option value="Credential Harvesting">Credential Harvesting</option>
              <option value="Brand Impersonation">Brand Impersonation</option>
            </select>
          </div>
        </div>

        {/* Threat Taxonomy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKnowledge.map(item => (
            <div key={item.id} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono">
                  {item.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  item.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {item.severity}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>

              {/* Why It Matters */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-cyan-400" />
                  <span>Why It Matters:</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">{item.whyItMatters}</p>
              </div>

              {/* Evidence Example */}
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 font-mono text-[11px]">
                <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">Forensic Signature:</span>
                <span className="text-amber-300 break-all">{item.evidenceExample}</span>
              </div>

              {/* Defense Rule */}
              <div className="text-[11px] text-emerald-400 font-medium pt-1 border-t border-slate-800/60 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{item.defenseRule}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
