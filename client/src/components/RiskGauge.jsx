import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react';

export default function RiskGauge({ score = 0, riskLevel = 'LOW' }) {
  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let gaugeColor = '#10b981';
  let Icon = ShieldCheck;
  let label = 'Low Risk';

  if (riskLevel === 'CRITICAL' || score >= 80) {
    colorClass = 'text-red-400 border-red-500/30 bg-red-500/10 glow-critical';
    gaugeColor = '#ef4444';
    Icon = ShieldX;
    label = 'Critical Threat';
  } else if (riskLevel === 'HIGH' || score >= 50) {
    colorClass = 'text-orange-400 border-orange-500/30 bg-orange-500/10 glow-high';
    gaugeColor = '#f97316';
    Icon = ShieldAlert;
    label = 'High Risk';
  } else if (riskLevel === 'MEDIUM' || score >= 25) {
    colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10 glow-medium';
    gaugeColor = '#f59e0b';
    Icon = AlertTriangle;
    label = 'Medium Suspicion';
  }

  // SVG Circular Gauge calculation
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`p-6 rounded-xl border ${colorClass} flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-slate-800 opacity-40"
          />
          <circle
            cx="65"
            cy="65"
            r={radius}
            stroke={gaugeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold tracking-tight font-mono text-slate-100">
            {score}
          </span>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            / 100 Risk
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <span className="font-bold text-sm tracking-wide uppercase">{label}</span>
      </div>
    </div>
  );
}
