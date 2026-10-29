import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { SecurityFinding, FindingStatus } from '../types/cloudSecurity';
import { filterFindings, exportFindingsToCsv } from '../services/auditEngine';

interface FindingsViewProps {
  findings: SecurityFinding[];
  onSelectFinding: (finding: SecurityFinding) => void;
  onOpenAuditModal: () => void;
  onOpenGeminiBrief: () => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  findings,
  onSelectFinding,
  onOpenAuditModal,
  onOpenGeminiBrief,
}) => {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredFindings = useMemo(() => {
    return filterFindings(findings, {
      search,
      provider: providerFilter,
      severity: severityFilter,
      category: categoryFilter,
      status: statusFilter,
    });
  }, [findings, search, providerFilter, severityFilter, categoryFilter, statusFilter]);

  const handleExportCsv = () => {
    exportFindingsToCsv(filteredFindings, 'CloudGuard_Security_Findings');
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
            <AlertOctagon className="w-3 h-3" />
            <span>CRITICAL</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide">
            <AlertTriangle className="w-3 h-3" />
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wide">
            <Info className="w-3 h-3" />
            <span>MEDIUM</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wide">
            <span>LOW</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Resolved
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Open
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Security Findings Explorer</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed itemization of misconfigurations, risk evidence, and automated remediation scripts.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onOpenGeminiBrief}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Risk Brief</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAuditModal}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search findings, rules, ARNs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Provider */}
        <div>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Cloud Providers</option>
            <option value="AWS">Amazon Web Services (AWS)</option>
            <option value="AZURE">Microsoft Azure</option>
            <option value="GCP">Google Cloud Platform (GCP)</option>
          </select>
        </div>

        {/* Severity */}
        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Storage">Storage (S3 / Blob / GCS)</option>
            <option value="IAM">IAM & Identity</option>
            <option value="Network">Network & Firewalls</option>
            <option value="Encryption">Encryption & KMS</option>
            <option value="Logging">Logging & CloudTrail</option>
            <option value="Database">Database & RDS</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Finding ID</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">Rule Title & Affected Resource</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Compliance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No security findings match your active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => (
                  <tr
                    key={finding.id}
                    onClick={() => onSelectFinding(finding)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 shrink-0">
                      {finding.id}
                    </td>
                    <td className="py-3.5 px-4">{getSeverityBadge(finding.severity)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {finding.provider}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {finding.ruleTitle}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {finding.resourceId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{finding.category}</td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 font-mono">
                      {finding.complianceStandards[0]}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(finding.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded bg-slate-800 group-hover:bg-cyan-600 group-hover:text-white text-slate-300 text-[11px] font-semibold transition-all">
                        Details
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex justify-between items-center">
          <div>
            Showing <strong className="text-slate-200">{filteredFindings.length}</strong> of{' '}
            <strong className="text-slate-200">{findings.length}</strong> findings
          </div>
          <div className="text-[11px]">
            Audited using CIS Benchmark Rules v3.0 & NIST 800-53
          </div>
        </div>
      </div>
    </div>
  );
};
