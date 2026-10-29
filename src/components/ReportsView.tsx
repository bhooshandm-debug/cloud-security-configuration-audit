import React, { useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  Shield,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  User,
  Share2,
} from 'lucide-react';
import { AuditScanRecord, SecurityFinding, UserProfile, ComplianceFramework } from '../types/cloudSecurity';
import { exportFindingsToCsv } from '../services/auditEngine';

interface ReportsViewProps {
  currentScan: AuditScanRecord;
  findings: SecurityFinding[];
  user: UserProfile;
  compliance: ComplianceFramework[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentScan,
  findings,
  user,
  compliance,
}) => {
  const handleDownloadCsv = () => {
    exportFindingsToCsv(findings, `CloudGuard_Report_${currentScan.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Download Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Security Audit Reports & Documentation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate auditor-certified compliance dossiers in structured CSV and printable PDF format.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download CSV Spreadsheet</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 space-y-8 shadow-2xl max-w-4xl mx-auto print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-cyan-400 print:text-blue-700" />
              <span className="text-xl font-black tracking-tight text-white print:text-black">
                CloudGuard Security Audit Report
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Multi-Cloud Infrastructure Configuration & Vulnerability Assessment
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 print:text-gray-600 space-y-0.5">
            <div>Report ID: <strong className="text-cyan-400 print:text-black font-mono">{currentScan.id}</strong></div>
            <div>Generated: <strong className="text-slate-200 print:text-black">{currentScan.timestamp}</strong></div>
            <div>Auditor: <strong className="text-slate-200 print:text-black">{user.name}</strong></div>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
            1. Executive Assessment Summary
          </h2>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed print:bg-gray-50 print:border-gray-300 print:text-black">
            {currentScan.executiveSummary ||
              `The automated multi-cloud assessment evaluated ${currentScan.totalResourcesScanned} resources across AWS, Azure, and Google Cloud against CIS Foundations Benchmark v3.0 and NIST 800-53 controls.`}
          </div>
        </div>

        {/* Posture Score & Metrics */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
            2. Vulnerability Severity Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 print:border-gray-300">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Overall Score</div>
              <div className="text-2xl font-black text-white mt-1 print:text-black">{currentScan.score}/100</div>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 print:border-gray-300">
              <div className="text-[10px] text-rose-400 font-bold uppercase">Critical</div>
              <div className="text-2xl font-black text-rose-300 mt-1 print:text-red-700">{currentScan.criticalCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 print:border-gray-300">
              <div className="text-[10px] text-amber-400 font-bold uppercase">High</div>
              <div className="text-2xl font-black text-amber-300 mt-1 print:text-yellow-700">{currentScan.highCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40 print:border-gray-300">
              <div className="text-[10px] text-blue-400 font-bold uppercase">Medium</div>
              <div className="text-2xl font-black text-blue-300 mt-1 print:text-blue-700">{currentScan.mediumCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 print:border-gray-300">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Compliant</div>
              <div className="text-2xl font-black text-emerald-300 mt-1 print:text-green-700">{currentScan.passedCount}</div>
            </div>
          </div>
        </div>

        {/* Itemized Findings Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider print:text-blue-700">
            3. Itemized Security Findings & Evidence
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider print:border-gray-300 print:text-black">
                <tr>
                  <th className="py-2.5 px-3">Finding ID</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Rule & Resource</th>
                  <th className="py-2.5 px-3">Remediation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs print:divide-gray-200">
                {findings.map((f) => (
                  <tr key={f.id} className="py-3">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400 print:text-black">
                      {f.id}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.severity === 'CRITICAL'
                            ? 'text-rose-400 print:text-red-700'
                            : f.severity === 'HIGH'
                            ? 'text-amber-400 print:text-yellow-700'
                            : 'text-blue-400 print:text-blue-700'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200 print:text-black">
                      {f.provider}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-slate-200 print:text-black">{f.ruleTitle}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate print:text-gray-600">
                        {f.resourceId}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-300 print:text-gray-700">
                      {f.recommendedFix}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor Sign-off */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 print:text-gray-600 gap-4">
          <div>
            MCA Final Year Cybersecurity Project • School of Computer Applications
          </div>
          <div className="text-right">
            <span>Verified by: <strong>{user.name}</strong> ({user.role})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
