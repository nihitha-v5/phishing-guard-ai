import React, { useState } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Building2, 
  Download, 
  RefreshCw, 
  Filter, 
  FileSpreadsheet, 
  CheckCircle,
  TrendingUp,
  Zap,
  Users
} from 'lucide-react';

export default function AnalyticsView({ telemetryData, onRefreshTelemetry, loading, showToast }) {
  const [filterDept, setFilterDept] = useState('ALL');

  const summary = telemetryData?.summary || {};
  const kpis = telemetryData?.kpis || {
    threatsDetected: 127,
    criticalThreats: 18,
    usersProtected: 1284,
    detectionAccuracy: 96.4,
    avgRiskScore: 72,
    securityAwarenessScore: 82
  };

  const vectorDistribution = telemetryData?.vectorDistribution || [];
  const departmentRisk = telemetryData?.departmentRisk || [];
  const policyRecommendations = telemetryData?.policyRecommendations || [];
  const recentEvents = telemetryData?.recentEvents || [];

  const filteredEvents = filterDept === 'ALL'
    ? recentEvents
    : recentEvents.filter(e => e.department === filterDept);

  const exportTelemetryJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(telemetryData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `phishguard-soc-telemetry-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (showToast) showToast('Exported SOC Telemetry JSON');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 mb-3">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Enterprise Telemetry & Analytics</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Security Operations Telemetry
            </h1>
            <p className="text-slate-400 mt-1 text-sm max-w-2xl leading-relaxed">
              Real-time threat telemetry aggregated from live message scans, user intervention containment events, and department vulnerability trends.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshTelemetry}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={exportTelemetryJson}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-900/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-cyan-500">
          <span className="text-xs text-slate-400 font-medium">Total Messages Inspected</span>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">
            {kpis.threatsDetected}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Live persistent event stream</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-red-500">
          <span className="text-xs text-slate-400 font-medium">Critical & High Threats</span>
          <div className="text-2xl font-extrabold font-mono text-red-400 mt-1">
            {kpis.criticalThreats}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Targeted social engineering</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
          <span className="text-xs text-slate-400 font-medium">Intervention Containment</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
            {summary.protectionRate || 98}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Quarantined before click</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500">
          <span className="text-xs text-slate-400 font-medium">User Awareness Index</span>
          <div className="text-2xl font-extrabold font-mono text-purple-400 mt-1">
            {kpis.securityAwarenessScore}%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">PhishGuard coaching benchmark</span>
        </div>

      </div>

      {/* Attack Vectors & Department Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Threat Categories / Attack Vectors */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Activity className="w-4 h-4 text-cyan-400" />
            Threat Categories & Frequency
          </h2>

          <div className="space-y-3">
            {vectorDistribution.map((vec, i) => {
              const maxCount = Math.max(...vectorDistribution.map(v => v.count), 1);
              const pct = Math.round((vec.count / maxCount) * 100);

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{vec.name}</span>
                    <span className="font-mono text-slate-400">{vec.count} occurrences</span>
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

        {/* Department Vulnerability Matrix */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-orange-400" />
            Department Vulnerability Matrix
          </h2>

          <div className="space-y-2.5">
            {departmentRisk.map((dept, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-200">{dept.name}</h3>
                  <span className="text-[11px] text-slate-500">{dept.total} total evaluations</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    dept.critical > 0 ? 'bg-red-950/80 text-red-400 border border-red-800/60' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {dept.critical} High/Critical
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Automated Policy Recommendations */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          Automated Security Policy Recommendations (Data-Driven)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {policyRecommendations.map((rec, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded inline-block ${
                  rec.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                }`}>
                  {rec.priority}
                </span>
                <h3 className="font-bold text-slate-100">{rec.title}</h3>
                <p className="text-slate-400 leading-relaxed text-[11px]">{rec.reason}</p>
              </div>
              <div className="text-[11px] text-emerald-400 pt-2 border-t border-slate-800 font-medium">
                Impact: {rec.impact}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Inspection Audit Log */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              Live Security Telemetry & Inspection Audit Log
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable forensic record of all messages evaluated across the enterprise.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Finance">Finance</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Engineering">Engineering</option>
              <option value="Legal">Legal</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Subject / Sender</th>
                <th className="py-2.5 px-3">Dept</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">User Action</th>
                <th className="py-2.5 px-3">Coaching</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-sans max-w-xs truncate">
                    <div className="font-semibold text-slate-200 truncate">{evt.subject}</div>
                    <div className="text-slate-500 text-[10px] truncate">{evt.sender}</div>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">{evt.department}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      evt.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      evt.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                      evt.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {evt.riskScore} ({evt.riskLevel})
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[10px]">
                      {evt.userAction}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    {evt.coachingCompleted ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
