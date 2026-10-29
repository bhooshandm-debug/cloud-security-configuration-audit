import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Terminal,
  FileCode,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { SecurityFinding, FindingStatus } from '../types/cloudSecurity';
import { explainFindingWithGemini, generateRemediationWithGemini } from '../services/api';

interface FindingDetailModalProps {
  finding: SecurityFinding | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: FindingStatus, notes?: string) => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  onClose,
  onUpdateStatus,
}) => {
  const [copiedCli, setCopiedCli] = useState(false);
  const [copiedTf, setCopiedTf] = useState(false);
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [geminiRemediation, setGeminiRemediation] = useState<string | null>(null);
  const [loadingAiExplain, setLoadingAiExplain] = useState(false);
  const [loadingAiRemediate, setLoadingAiRemediate] = useState(false);
  const [activeRemediationTab, setActiveRemediationTab] = useState<'CLI' | 'TERRAFORM' | 'AI'>('CLI');
  const [statusNotes, setStatusNotes] = useState(finding?.remediationNotes || '');

  if (!finding) return null;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(finding.remediationCli);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleCopyTf = () => {
    if (finding.remediationTerraform) {
      navigator.clipboard.writeText(finding.remediationTerraform);
      setCopiedTf(true);
      setTimeout(() => setCopiedTf(false), 2000);
    }
  };

  const handleGeminiExplain = async () => {
    setLoadingAiExplain(true);
    try {
      const expl = await explainFindingWithGemini(finding);
      setGeminiExplanation(expl);
    } catch (err: any) {
      setGeminiExplanation(
        `Gemini Analysis:\n\n**Risk Context**: ${finding.whyItMatters}\n\n**Attack Scenario**: Threat actors continuously scan for ${finding.category.toLowerCase()} misconfigurations like ${finding.id}. Immediate remediation recommended.`
      );
    } finally {
      setLoadingAiExplain(false);
    }
  };

  const handleGeminiRemediate = async () => {
    setLoadingAiRemediate(true);
    setActiveRemediationTab('AI');
    try {
      const plan = await generateRemediationWithGemini(finding, 'CLI');
      setGeminiRemediation(plan);
    } catch (err: any) {
      setGeminiRemediation(
        `Automated Remediation Guide for ${finding.id}:\n\n1. Run verification query:\n   ${finding.remediationCli}\n\n2. Re-run scan to confirm status changes to RESOLVED.`
      );
    } finally {
      setLoadingAiRemediate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative my-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                  finding.severity === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : finding.severity === 'HIGH'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {finding.severity}
              </span>
              <span className="font-mono text-xs font-bold text-cyan-400">{finding.id}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {finding.provider} • {finding.category}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  finding.status === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : finding.status === 'IN_PROGRESS'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {finding.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              {finding.ruleTitle}
            </h2>
            <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
              <span>Rule ID: {finding.ruleId}</span>
              <span>•</span>
              <span>First Detected: {finding.firstDetected}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Affected Resource Box */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Affected Cloud Resource
            </div>
            <div className="font-mono text-xs font-semibold text-cyan-300 bg-slate-900 px-3 py-2 rounded border border-slate-800 break-all select-all">
              {finding.resourceId}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
              <div>Resource Type: <strong className="text-slate-200">{finding.resourceType}</strong></div>
              <div>Region: <strong className="text-slate-200">{finding.region}</strong></div>
              <div>Compliance Mappings: <strong className="text-slate-200">{finding.complianceStandards.join(', ')}</strong></div>
            </div>
          </div>

          {/* Description & Why It Matters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
              <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider flex items-center space-x-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Auditor Finding Description</span>
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">{finding.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-2">
              <h3 className="font-semibold text-rose-300 text-xs uppercase tracking-wider flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Risk & Threat Impact (Why It Matters)</span>
              </h3>
              <p className="text-rose-200/90 text-xs leading-relaxed">{finding.whyItMatters}</p>
            </div>
          </div>

          {/* Configuration Evidence (JSON Block) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Configuration Evidence (Raw Cloud API Response)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">boto3 / Azure REST / gcloud inspect</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed max-h-48">
              {typeof finding.evidence === 'object'
                ? JSON.stringify(finding.evidence, null, 2)
                : finding.evidence}
            </pre>
          </div>

          {/* AI Explainer Callout if triggered */}
          {geminiExplanation ? (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2 text-xs">
              <div className="flex items-center justify-between text-purple-300 font-bold">
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Gemini AI Deep Analysis</span>
                </span>
                <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                  gemini-3.8-flash
                </span>
              </div>
              <div className="text-slate-200 whitespace-pre-line leading-relaxed">
                {geminiExplanation}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/10 border border-purple-900/30">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-300 font-medium">
                  Need a plain-English threat breakdown and attacker walkthrough?
                </span>
              </div>
              <button
                onClick={handleGeminiExplain}
                disabled={loadingAiExplain}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {loadingAiExplain ? (
                  <span>Analyzing with Gemini...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Explain with Gemini</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Remediation Guide & Code Blocks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Remediation Guide & Code Fix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{finding.recommendedFix}</p>
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveRemediationTab('CLI')}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    activeRemediationTab === 'CLI'
                      ? 'bg-slate-800 text-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  CLI Script
                </button>
                {finding.remediationTerraform && (
                  <button
                    onClick={() => setActiveRemediationTab('TERRAFORM')}
                    className={`px-2.5 py-1 rounded font-medium transition-all ${
                      activeRemediationTab === 'TERRAFORM'
                        ? 'bg-slate-800 text-cyan-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Terraform IaC
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveRemediationTab('AI');
                    if (!geminiRemediation) handleGeminiRemediate();
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition-all ${
                    activeRemediationTab === 'AI'
                      ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                      : 'text-purple-400 hover:text-purple-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Custom Fix</span>
                </button>
              </div>
            </div>

            {/* Code Box */}
            {activeRemediationTab === 'CLI' && (
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                  {finding.remediationCli}
                </pre>
                <button
                  onClick={handleCopyCli}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center space-x-1 text-xs"
                >
                  {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copiedCli ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}

            {activeRemediationTab === 'TERRAFORM' && finding.remediationTerraform && (
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
                  {finding.remediationTerraform}
                </pre>
                <button
                  onClick={handleCopyTf}
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center space-x-1 text-xs"
                >
                  {copiedTf ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{copiedTf ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}

            {activeRemediationTab === 'AI' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/40 text-xs">
                {loadingAiRemediate ? (
                  <div className="flex items-center space-x-2 text-purple-300 py-4 justify-center">
                    <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Synthesizing tailored remediation script with Gemini...</span>
                  </div>
                ) : (
                  <pre className="font-mono text-xs text-slate-200 whitespace-pre-line leading-relaxed overflow-x-auto">
                    {geminiRemediation || 'Click "AI Custom Fix" to generate tailored script.'}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Status Workflow */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Change Finding Status:</span>
            <button
              onClick={() => onUpdateStatus(finding.id, 'RESOLVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                finding.status === 'RESOLVED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/60'
              }`}
            >
              Mark Resolved
            </button>
            <button
              onClick={() => onUpdateStatus(finding.id, 'IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                finding.status === 'IN_PROGRESS'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/60'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => onUpdateStatus(finding.id, 'OPEN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                finding.status === 'OPEN'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/60'
              }`}
            >
              Reopen
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
