import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CloudProvider, AuditScanRecord } from '../types/cloudSecurity';
import { executeSimulationAudit } from '../services/auditEngine';

interface AuditLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanCompleted: (newScan: AuditScanRecord) => void;
}

const AUDIT_STEPS = [
  'Initializing least-privilege read-only sessions via AWS STS and Azure/GCP service principles...',
  'Querying Object Storage: Evaluating S3 Bucket ACLs, Block Public Access & Azure Blob container policies...',
  'Auditing Network Perimeter: Inspecting EC2 Security Groups, NSGs, and VPC Firewalls for exposed ports (22, 3389, 5432)...',
  'Analyzing Identity & Access Management: Detecting root account login, missing MFA & wildcard "*" IAM policies...',
  'Validating Cryptographic Posture: Checking RDS encryption, Customer Managed KMS key rotation & Key Vault purge protection...',
  'Evaluating Compliance Controls: Mapping raw evidence against CIS Foundations v3.0, NIST 800-53 & PCI-DSS 4.0...',
  'Invoking Gemini AI Security Engine: Synthesizing threat blast radius, executive briefing & prioritized remediations...',
];

export const AuditLauncherModal: React.FC<AuditLauncherModalProps> = ({
  isOpen,
  onClose,
  onScanCompleted,
}) => {
  const [selectedProviders, setSelectedProviders] = useState<CloudProvider[]>(['AWS', 'AZURE', 'GCP']);
  const [auditDepth, setAuditDepth] = useState<'STANDARD' | 'DEEP'>('STANDARD');
  const [isScanning, setIsScanning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanFinished, setScanFinished] = useState(false);
  const [generatedScan, setGeneratedScan] = useState<AuditScanRecord | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setCurrentStepIndex(0);
      setLogs([]);
      setScanFinished(false);
      setGeneratedScan(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleProvider = (p: CloudProvider) => {
    if (selectedProviders.includes(p)) {
      if (selectedProviders.length === 1) return; // Keep at least one
      setSelectedProviders(selectedProviders.filter((item) => item !== p));
    } else {
      setSelectedProviders([...selectedProviders, p]);
    }
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setLogs([`[0.0s] Audit engine initialized for: ${selectedProviders.join(', ')}`]);
    setCurrentStepIndex(0);

    const stepInterval = 900;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step < AUDIT_STEPS.length) {
        setCurrentStepIndex(step);
        setLogs((prev) => [...prev, `[+${(step * 0.9).toFixed(1)}s] ${AUDIT_STEPS[step]}`]);
      } else {
        clearInterval(timer);
        const result = executeSimulationAudit(selectedProviders);
        setGeneratedScan(result);
        setScanFinished(true);
        setIsScanning(false);
        setLogs((prev) => [
          ...prev,
          `[+${(AUDIT_STEPS.length * 0.9).toFixed(1)}s] Completed inspection! Found ${result.criticalCount} Critical and ${result.highCount} High vulnerabilities.`,
        ]);
      }
    }, stepInterval);
  };

  const handleViewResults = () => {
    if (generatedScan) {
      onScanCompleted(generatedScan);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Automated Cloud Security Audit
              </h2>
              <p className="text-xs text-slate-400">
                Execute non-intrusive read-only configuration assessment
              </p>
            </div>
          </div>

          {!isScanning && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {!isScanning && !scanFinished ? (
            <div className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Select Target Cloud Environments
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['AWS', 'AZURE', 'GCP'] as CloudProvider[]).map((prov) => {
                    const active = selectedProviders.includes(prov);
                    return (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => toggleProvider(prov)}
                        className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-800 border-cyan-500/60 shadow-sm shadow-cyan-500/20 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-sm">{prov}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {active ? 'Selected' : 'Omitted'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audit Scope / Depth */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Compliance Audit Depth
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setAuditDepth('STANDARD')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      auditDepth === 'STANDARD'
                        ? 'bg-slate-800 border-cyan-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">Standard CIS Foundations (Fast)</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Scans identity, storage, network firewalls, and cloud audit logging.
                    </p>
                  </div>

                  <div
                    onClick={() => setAuditDepth('DEEP')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      auditDepth === 'DEEP'
                        ? 'bg-slate-800 border-cyan-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">Comprehensive NIST & PCI-DSS</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Deep cross-provider configuration correlation and blast-radius analysis.
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Guarantee */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
                <div className="font-bold text-cyan-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Auditor Safety Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The audit process will not alter cloud resources, delete data, modify firewall rules, or degrade system performance. Only read-only describe and get API calls will be invoked.
                </p>
              </div>
            </div>
          ) : (
            /* Scanning / Completed State */
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 flex items-center space-x-2">
                    {isScanning && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                    <span>{scanFinished ? 'Audit Finished!' : 'Auditing Cloud Infrastructure...'}</span>
                  </span>
                  <span className="font-mono text-cyan-400">
                    {Math.round(((currentStepIndex + 1) / AUDIT_STEPS.length) * 100)}%
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(((currentStepIndex + 1) / AUDIT_STEPS.length) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Live Terminal Output */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 space-y-1.5 max-h-56 overflow-y-auto">
                <div className="text-slate-500 pb-1 border-b border-slate-900 flex items-center justify-between">
                  <span>AUDIT_LOG_STREAM: active</span>
                  <span>port: 443 (TLS 1.3)</span>
                </div>
                {logs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>

              {scanFinished && generatedScan && (
                <div className="p-4 rounded-xl bg-slate-850 border border-cyan-500/40 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Posture Score:</span>
                    <span className="text-base font-extrabold text-cyan-400">
                      {generatedScan.score}/100
                    </span>
                  </div>
                  <div className="flex gap-4 text-slate-300 text-xs">
                    <div>Critical: <strong className="text-rose-400">{generatedScan.criticalCount}</strong></div>
                    <div>High: <strong className="text-amber-400">{generatedScan.highCount}</strong></div>
                    <div>Medium: <strong className="text-blue-400">{generatedScan.mediumCount}</strong></div>
                    <div>Compliant Assets: <strong className="text-emerald-400">{generatedScan.passedCount}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end space-x-3">
          {!isScanning && !scanFinished ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartScan}
                className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Audit</span>
              </button>
            </>
          ) : scanFinished ? (
            <button
              onClick={handleViewResults}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Load Scan Report</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Audit in progress, please do not close window...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
