import React, { useState } from 'react';
import {
  History,
  GitCompare,
  ArrowRight,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AuditScanRecord, SecurityFinding } from '../types/cloudSecurity';

interface ScanHistoryViewProps {
  scanHistory: AuditScanRecord[];
  currentScan: AuditScanRecord;
  onSelectHistoricalScan: (scan: AuditScanRecord) => void;
  onSelectFinding: (finding: SecurityFinding) => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  scanHistory,
  currentScan,
  onSelectHistoricalScan,
  onSelectFinding,
}) => {
  const [scanAId, setScanAId] = useState<string>(scanHistory[1]?.id || scanHistory[0]?.id);
  const [scanBId, setScanBId] = useState<string>(scanHistory[0]?.id);

  const scanA = scanHistory.find((s) => s.id === scanAId) || scanHistory[0];
  const scanB = scanHistory.find((s) => s.id === scanBId) || scanHistory[0];

  // Compute Drift
  const findingsA = scanA?.findings || [];
  const findingsB = scanB?.findings || [];

  const findingsAIds = new Set(findingsA.map((f) => f.id));
  const findingsBIds = new Set(findingsB.map((f) => f.id));

  const newVulnerabilities = findingsB.filter((f) => !findingsAIds.has(f.id));
  const resolvedVulnerabilities = findingsA.filter((f) => !findingsBIds.has(f.id));
  const persistentVulnerabilities = findingsB.filter((f) => findingsAIds.has(f.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Scan History & Configuration Drift Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Track posture improvements over time and detect newly introduced security regressions.
        </p>
      </div>

      {/* Comparison Selector Card */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <GitCompare className="w-4 h-4" />
          <span>Select Scans for Drift Comparison</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Baseline Scan A */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold">Baseline Scan (Older / Previous)</label>
            <select
              value={scanAId}
              onChange={(e) => setScanAId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {scanHistory.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.scanName} ({s.timestamp.slice(0, 10)}) - Score: {s.score}/100
                </option>
              ))}
            </select>
          </div>

          {/* Current Scan B */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold">Comparison Scan (Newer / Current)</label>
            <select
              value={scanBId}
              onChange={(e) => setScanBId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {scanHistory.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.scanName} ({s.timestamp.slice(0, 10)}) - Score: {s.score}/100
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drift Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Newly Introduced */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400">New Regressions Introduced</span>
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-300 mt-2">
              +{newVulnerabilities.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Violations detected in Scan B that did not exist in Scan A
            </p>
          </div>

          {/* Resolved */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">Issues Resolved / Remediated</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-2">
              -{resolvedVulnerabilities.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Fixed misconfigurations no longer present in Scan B
            </p>
          </div>

          {/* Persistent */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400">Persistent Unresolved Risks</span>
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-300 mt-2">
              {persistentVulnerabilities.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ongoing risks present across both evaluation periods
            </p>
          </div>
        </div>

        {/* New Vulnerabilities List */}
        {newVulnerabilities.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Newly Introduced Cloud Vulnerabilities in {scanB.scanName}:
            </div>
            <div className="space-y-2">
              {newVulnerabilities.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onSelectFinding(f)}
                  className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 hover:border-rose-700 text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-rose-400">{f.id}</span>
                    <span className="font-bold text-slate-200">{f.ruleTitle}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({f.provider})</span>
                  </div>
                  <span className="text-[11px] font-semibold text-rose-300">Inspect & Fix →</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Historical Scans Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Audit Execution Log</span>
          </h2>
          <span className="text-xs text-slate-400">Total Recorded Audits: {scanHistory.length}</span>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs">
          {scanHistory.map((scan) => {
            const isCurrent = scan.id === currentScan.id;
            return (
              <div
                key={scan.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-cyan-400 font-bold">{scan.id}</span>
                    <span className="font-bold text-white text-sm">{scan.scanName}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        ACTIVE AUDIT
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 flex items-center space-x-3 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{scan.timestamp}</span>
                    </span>
                    <span>•</span>
                    <span>Providers: {scan.providers.join(', ')}</span>
                    <span>•</span>
                    <span>Resources: {scan.totalResourcesScanned}</span>
                    <span>•</span>
                    <span>Duration: {scan.durationSeconds}s</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right">
                    <div className="font-extrabold text-white text-sm">
                      Score: <span className="text-cyan-400">{scan.score}/100</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {scan.criticalCount} Crit • {scan.highCount} High • {scan.passedCount} Passed
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={() => onSelectHistoricalScan(scan)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
                    >
                      Load Scan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
