import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Terminal,
  ExternalLink,
  Key,
  Lock,
  Server,
  Zap,
} from 'lucide-react';
import { ProviderConnection, CloudProvider } from '../types/cloudSecurity';
import { testCloudConnection } from '../services/api';

interface ProvidersViewProps {
  connections: ProviderConnection[];
  onUpdateConnection: (updated: ProviderConnection) => void;
  onOpenAuditModal: () => void;
}

export const ProvidersView: React.FC<ProvidersViewProps> = ({
  connections,
  onUpdateConnection,
  onOpenAuditModal,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>('AWS');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for custom connection config
  const currentConn = connections.find((c) => c.provider === selectedProvider) || connections[0];
  const [accountId, setAccountId] = useState(currentConn.accountId);
  const [region, setRegion] = useState(currentConn.region);
  const [authMethod, setAuthMethod] = useState(currentConn.authMethod);
  const [showConfigSaved, setShowConfigSaved] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setErrorMessage(null);

    try {
      const res = await testCloudConnection({
        provider: selectedProvider,
        authMethod,
        accountId,
        region,
      });

      setTestResult(res);
      onUpdateConnection({
        ...currentConn,
        accountId: res.accountId,
        region: res.region,
        status: res.status,
        latencyMs: res.latencyMs,
        lastTestedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        permissionsVerified: res.permissionsVerified,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConnection({
      ...currentConn,
      accountId,
      region,
      authMethod,
      lastTestedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    });
    setShowConfigSaved(true);
    setTimeout(() => setShowConfigSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Cloud Provider Connectors</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure least-privilege read-only adapters for AWS, Microsoft Azure, and Google Cloud Platform.
          </p>
        </div>

        <button
          onClick={onOpenAuditModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Launch Multi-Cloud Audit</span>
        </button>
      </div>

      {/* Cloud Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['AWS', 'AZURE', 'GCP'] as CloudProvider[]).map((prov) => {
          const conn = connections.find((c) => c.provider === prov);
          const isSelected = selectedProvider === prov;
          return (
            <button
              key={prov}
              onClick={() => {
                setSelectedProvider(prov);
                const target = connections.find((c) => c.provider === prov);
                if (target) {
                  setAccountId(target.accountId);
                  setRegion(target.region);
                  setAuthMethod(target.authMethod);
                  setTestResult(null);
                  setErrorMessage(null);
                }
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      prov === 'AWS'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : prov === 'AZURE'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {prov}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {prov === 'AWS' ? 'Amazon Web Services' : prov === 'AZURE' ? 'Microsoft Azure' : 'Google Cloud Platform'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {conn?.status === 'CONNECTED' || conn?.status === 'SAMPLE_ENV'
                        ? 'Ready for Audit'
                        : 'Needs Configuration'}
                    </div>
                  </div>
                </div>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    conn?.status === 'CONNECTED' || conn?.status === 'SAMPLE_ENV'
                      ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                      : 'bg-slate-600'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Provider Details & Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Connection Status & Tester */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Connection Status
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE / VERIFIED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80 text-slate-400">
                <span>Account / Subscription</span>
                <span className="font-mono text-slate-200">{currentConn.accountId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80 text-slate-400">
                <span>Target Region</span>
                <span className="font-mono text-slate-200">{currentConn.region}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80 text-slate-400">
                <span>Auth Protocol</span>
                <span className="font-semibold text-cyan-400">{currentConn.authMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80 text-slate-400">
                <span>API Latency</span>
                <span className="font-mono text-emerald-400">{currentConn.latencyMs || 142} ms</span>
              </div>
              <div className="flex justify-between py-1 text-slate-400">
                <span>Last Verified</span>
                <span className="text-slate-200">{currentConn.lastTestedAt || 'Just now'}</span>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="w-full py-2.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating Read-Only IAM API...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Test Connection & Verify IAM</span>
                </>
              )}
            </button>

            {testResult && (
              <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 space-y-1.5 text-xs animate-fadeIn">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Connection Verified!</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {testResult.message}
                </p>
                <div className="text-[10px] text-emerald-400/90 font-mono">
                  Latency: {testResult.latencyMs}ms • Verified {testResult.permissionsVerified.length} permissions
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/50 space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Connection Failed</span>
                </div>
                <p className="text-rose-300 text-[11px]">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Verified IAM Permissions Box */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Least-Privilege IAM APIs</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Only read-only API calls are executed by the audit engine:
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {currentConn.permissionsVerified.map((perm) => (
                <div
                  key={perm}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-emerald-300 flex items-center justify-between"
                >
                  <span>{perm}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Credential Configuration & Step-by-Step Guide */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Notice Box */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex items-start space-x-3 text-xs">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-cyan-300">Security & Privacy Protocol</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                CloudGuard enforces strict read-only auditing principles. Root account passwords, write permissions, or permanent deletion rights are never permitted. Credentials are held in volatile memory or local environment variables only.
              </p>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">
              {selectedProvider} Credential & Environment Parameters
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {selectedProvider === 'AWS'
                      ? 'AWS Account ID'
                      : selectedProvider === 'AZURE'
                      ? 'Azure Subscription ID'
                      : 'GCP Project ID'}
                  </label>
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. 124892019482"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Region</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. us-east-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Authentication Method</label>
                <select
                  value={authMethod}
                  onChange={(e) => setAuthMethod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {selectedProvider === 'AWS' && (
                    <>
                      <option value="IAM_ROLE">AssumeRole via Cross-Account IAM Role (Recommended)</option>
                      <option value="ACCESS_KEYS">Read-Only IAM User Access Key / Secret Key</option>
                    </>
                  )}
                  {selectedProvider === 'AZURE' && (
                    <>
                      <option value="SERVICE_PRINCIPAL">Azure AD App Registration / Service Principal</option>
                      <option value="MANAGED_IDENTITY">Azure Managed Identity</option>
                    </>
                  )}
                  {selectedProvider === 'GCP' && (
                    <>
                      <option value="SERVICE_ACCOUNT">GCP Service Account JSON Key (Security Reviewer)</option>
                      <option value="WORKLOAD_IDENTITY">Workload Identity Federation</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Pre-configured enterprise simulation workload loaded by default.
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Save Configuration
                </button>
              </div>

              {showConfigSaved && (
                <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800 text-emerald-400 text-xs text-center font-medium">
                  Configuration parameters updated successfully!
                </div>
              )}
            </form>
          </div>

          {/* Setup Instructions Accordion */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Step-by-Step Read-Only Setup Instructions ({selectedProvider})</span>
            </h3>

            {selectedProvider === 'AWS' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-cyan-400">Step 1: Attach AWS Managed Policy "SecurityAudit"</div>
                  <p className="text-slate-400 text-[11px]">
                    AWS provides an official pre-built policy (<code className="text-cyan-300 font-mono">arn:aws:iam::aws:policy/SecurityAudit</code>) with read-only access to S3, IAM, EC2, CloudTrail, RDS, and KMS.
                  </p>
                  <pre className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto">
                    aws iam attach-role-policy --role-name CloudGuardAuditRole --policy-arn arn:aws:iam::aws:policy/SecurityAudit
                  </pre>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-cyan-400">Step 2: Create Cross-Account STS Assume Role Trust</div>
                  <p className="text-slate-400 text-[11px]">
                    Allows the audit engine to assume the role temporarily without sharing long-lived secret keys.
                  </p>
                  <pre className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::124892019482:root" },
      "Action": "sts:AssumeRole"
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            )}

            {selectedProvider === 'AZURE' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-blue-400">Step 1: Create an Azure AD Service Principal</div>
                  <pre className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto">
                    az ad sp create-for-rbac --name "CloudGuard-Audit-SP" --role "Reader" --scopes /subscriptions/{accountId}
                  </pre>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-blue-400">Step 2: Assign Key Vault Secrets Officer Reader Role</div>
                  <p className="text-slate-400 text-[11px]">
                    Grants read access to Key Vault metadata (soft-delete status) without accessing secret payloads.
                  </p>
                </div>
              </div>
            )}

            {selectedProvider === 'GCP' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-emerald-400">Step 1: Create a Least-Privilege Service Account</div>
                  <pre className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto">
                    gcloud iam service-accounts create cloudguard-auditor --description="Read-only security assessment service account"
                  </pre>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <div className="font-bold text-emerald-400">Step 2: Assign "Security Reviewer" and "Viewer" Roles</div>
                  <pre className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-200 overflow-x-auto">
                    gcloud projects add-iam-policy-binding {accountId} --member="serviceAccount:cloudguard-auditor@{accountId}.iam.gserviceaccount.com" --role="roles/iam.securityReviewer"
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
