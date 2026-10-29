import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ComplianceFramework, SecurityFinding } from '../types/cloudSecurity';

interface ComplianceViewProps {
  compliance: ComplianceFramework[];
  findings: SecurityFinding[];
  onSelectFinding: (finding: SecurityFinding) => void;
  onNavigateToFindings: () => void;
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({
  compliance,
  findings,
  onSelectFinding,
  onNavigateToFindings,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Regulatory Compliance & Benchmark Alignment
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Automated mapping of multi-cloud configuration checks to CIS Benchmarks, NIST SP 800-53, and PCI-DSS v4.0.
        </p>
      </div>

      {/* Compliance Frameworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {compliance.map((fw) => {
          return (
            <div
              key={fw.id}
              className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-white">{fw.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {fw.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{fw.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-cyan-400">{fw.passedPercentage}%</span>
                  <div className="text-[10px] text-slate-400">Pass Rate</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${fw.passedPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Passed Controls: <strong className="text-emerald-400">{fw.controlsPassed}</strong></span>
                  <span>Failed Controls: <strong className="text-rose-400">{fw.controlsFailed}</strong></span>
                  <span>Total Scoped: {fw.controlsTotal}</span>
                </div>
              </div>

              {/* Top Gaps */}
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                <div className="font-semibold text-rose-300 text-[11px] uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Top Non-Compliant Control Gaps</span>
                </div>
                <div className="space-y-1">
                  {fw.topGaps.map((gap, i) => (
                    <div
                      key={i}
                      className="text-slate-300 text-[11px] flex items-center space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onNavigateToFindings}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center space-x-1.5 border border-slate-700 transition-colors"
              >
                <span>Filter Audit Findings by {fw.name.slice(0, 20)}...</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
