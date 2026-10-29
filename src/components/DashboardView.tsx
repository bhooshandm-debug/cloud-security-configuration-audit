import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle,
  ArrowUpRight,
  Sparkles,
  Cloud,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { SecurityFinding, AuditScanRecord, ProviderConnection, ComplianceFramework } from '../types/cloudSecurity';

interface DashboardViewProps {
  currentScan: AuditScanRecord;
  findings: SecurityFinding[];
  connections: ProviderConnection[];
  compliance: ComplianceFramework[];
  onOpenAuditModal: () => void;
  onOpenGeminiBrief: () => void;
  onSelectFinding: (finding: SecurityFinding) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentScan,
  findings,
  connections,
  compliance,
  onOpenAuditModal,
  onOpenGeminiBrief,
  onSelectFinding,
  onNavigateToTab,
}) => {
  const criticalFindings = findings.filter((f) => f.severity === 'CRITICAL' && f.status === 'OPEN');
  const highFindings = findings.filter((f) => f.severity === 'HIGH' && f.status === 'OPEN');
  const mediumFindings = findings.filter((f) => f.severity === 'MEDIUM' && f.status === 'OPEN');
  const lowFindings = findings.filter((f) => f.severity === 'LOW' && f.status === 'OPEN');
  const resolvedFindings = findings.filter((f) => f.status === 'RESOLVED');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-400';
    if (score >= 65) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Last Scan Status & CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Environment: {currentScan.targetEnvironment}</span>
              <span>•</span>
              <span>Last Scan: {currentScan.timestamp}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Cloud Security Posture Management
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Automated multi-cloud audit running against CIS Foundations Benchmarks and NIST 800-53 controls.
              Identified <strong className="text-rose-400 font-semibold">{criticalFindings.length} Critical</strong> and{' '}
              <strong className="text-amber-400 font-semibold">{highFindings.length} High</strong> severity misconfigurations.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenGeminiBrief}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold shadow-lg shadow-purple-600/10 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Executive Brief</span>
            </button>
            <button
              onClick={onOpenAuditModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Run Assessment Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row: Posture Score & Severity Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Score Card */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={getScoreColor(currentScan.score)}
                strokeDasharray={`${currentScan.score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-black text-lg text-white">{currentScan.score}</span>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Posture Score
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {currentScan.score >= 80 ? 'Good Baseline' : currentScan.score >= 65 ? 'Elevated Risk' : 'Critical Exposure'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">184 assets verified</div>
          </div>
        </div>

        {/* Critical */}
        <div
          onClick={() => onNavigateToTab('findings')}
          className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/40 hover:border-rose-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Critical</span>
            <AlertOctagon className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-2">{criticalFindings.length}</div>
          <p className="text-[11px] text-rose-400/80 mt-1">Immediate internet exposure</p>
        </div>

        {/* High */}
        <div
          onClick={() => onNavigateToTab('findings')}
          className="p-5 rounded-xl bg-amber-950/20 border border-amber-900/40 hover:border-amber-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">High Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2">{highFindings.length}</div>
          <p className="text-[11px] text-amber-400/80 mt-1">IAM & perimeter privilege gaps</p>
        </div>

        {/* Medium & Low */}
        <div
          onClick={() => onNavigateToTab('findings')}
          className="p-5 rounded-xl bg-blue-950/20 border border-blue-900/40 hover:border-blue-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Medium / Low</span>
            <Info className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-blue-300 mt-2">{mediumFindings.length + lowFindings.length}</div>
          <p className="text-[11px] text-blue-400/80 mt-1">Logging & hygiene policies</p>
        </div>

        {/* Passed Rules */}
        <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Compliant</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-2">{currentScan.passedCount}</div>
          <p className="text-[11px] text-emerald-400/80 mt-1">Passed CIS verification</p>
        </div>
      </div>

      {/* Cloud Provider Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {connections.map((c) => {
          const provFindings = findings.filter((f) => f.provider === c.provider);
          const provCritical = provFindings.filter((f) => f.severity === 'CRITICAL' && f.status === 'OPEN').length;
          const provHigh = provFindings.filter((f) => f.severity === 'HIGH' && f.status === 'OPEN').length;

          return (
            <div
              key={c.provider}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-slate-700">
                    {c.provider}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.provider} Workload</h3>
                    <div className="text-[10px] text-slate-400">{c.region} • {c.authMethod}</div>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Open Issues</span>
                  <span className="font-semibold text-slate-200">{provFindings.length} findings</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Critical / High</span>
                  <span className="font-semibold text-rose-400">{provCritical} Crit / {provHigh} High</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Read-Only API Checks</span>
                  <span className="font-semibold text-emerald-400">{c.permissionsVerified.length} Verified</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTab('providers')}
                className="mt-4 w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center space-x-1.5 border border-slate-700 transition-colors"
              >
                <span>Inspect {c.provider} Configuration</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Top Critical Risk Exposures */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Highest Priority Attack Vectors</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identified attack paths that permit remote data exfiltration or tenant takeover.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('findings')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All {findings.length} Findings</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {findings.slice(0, 4).map((f) => (
            <div
              key={f.id}
              onClick={() => onSelectFinding(f)}
              className="p-4 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      f.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {f.severity}
                  </span>
                  <span className="text-xs font-semibold text-cyan-400 font-mono">{f.id}</span>
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {f.ruleTitle}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono truncate max-w-2xl">
                  {f.resourceId}
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  {f.complianceStandards[0]}
                </span>
                <span className="px-3 py-1 rounded bg-slate-800 text-slate-200 group-hover:bg-cyan-600 group-hover:text-white text-xs font-medium transition-all">
                  Inspect & Fix
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Standing Summary */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              <span>Compliance Standards Alignment</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated control evaluation against industry regulatory security frameworks.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('compliance')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>Full Compliance Matrix</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {compliance.slice(0, 3).map((comp) => (
            <div key={comp.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-200">{comp.name}</span>
                <span className="text-xs font-extrabold text-cyan-400">{comp.passedPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                  style={{ width: `${comp.passedPercentage}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Passed: {comp.controlsPassed} controls</span>
                <span className="text-rose-400">Failed: {comp.controlsFailed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
