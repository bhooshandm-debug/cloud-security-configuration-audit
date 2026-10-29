import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Terminal,
  FileCode,
  GraduationCap,
  Copy,
  Check,
  CheckCircle2,
  ListFilter,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { UserProfile, SystemAuditLog } from '../types/cloudSecurity';

interface SettingsViewProps {
  user: UserProfile;
  auditLogs: SystemAuditLog[];
  onUpdateUser: (updated: UserProfile) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  auditLogs,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'PROJECT_DOCS' | 'SETUP_GUIDE' | 'PROFILE' | 'AUDIT_LOGS'>('PROJECT_DOCS');
  const [copiedPs, setCopiedPs] = useState(false);

  // Profile form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      role: role as any,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const powershellScript = `# ==============================================================================
# Cloud Security Configuration and Audit Platform - Windows Setup (PowerShell)
# MCA Final Year Project - Bhooshan D. M.
# ==============================================================================

# 1. Open PowerShell as Administrator or standard user in project directory
cd E:\\MCA_Projects\\CloudSecurityAudit

# 2. Create and Activate Python Virtual Environment (Windows)
python -m venv venv
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
.\\venv\\Scripts\\Activate.ps1

# 3. Upgrade pip and Install Dependencies (Flask, Boto3, Azure SDK, Google GenAI)
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

# 4. Configure Local Environment Variables (.env)
Copy-Item .env.example .env
# Edit .env and supply GEMINI_API_KEY="your-gemini-key" and AWS credentials
# notepad .env

# 5. Initialize the SQLite Database (Users, ScanRecords, Findings, AuditLogs)
python -c "from backend.app import init_db; init_db()"

# 6. Run Automated Test Suite (Pytest)
pytest backend/tests/test_audit.py -v

# 7. Start the Python Flask Security Audit API
python backend/app.py
# Server starts at: http://127.0.0.1:5000

# 8. Start the React Frontend Dashboard (in a second PowerShell terminal)
npm install
npm run dev
# Dashboard launches at: http://localhost:3000
`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Settings, Audit Logs & MCA Project Documentation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Academic project synopsis, system architecture, PowerShell deployment script, and immutable security audit logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('PROJECT_DOCS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'PROJECT_DOCS'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MCA Synopsis & Viva
          </button>
          <button
            onClick={() => setActiveTab('SETUP_GUIDE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'SETUP_GUIDE'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Windows PowerShell Setup
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auditor Profile
          </button>
        </div>
      </div>

      {/* Tab 1: Project Docs & Viva Guide */}
      {activeTab === 'PROJECT_DOCS' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>MCA Final Year Main Project Documentation</span>
              </div>
              <h2 className="text-lg font-black text-white">
                Cloud Security Configuration and Audit: An AI-Assisted Multi-Cloud Security Assessment Platform
              </h2>
              <div className="text-xs text-slate-400 mt-1">
                Student: <strong>{user.name}</strong> • Department: <strong>Computer Applications</strong>
              </div>
            </div>
          </div>

          {/* Abstract / Synopsis */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              1. Project Abstract & Motivation
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              Modern enterprises increasingly distribute infrastructure across AWS, Microsoft Azure, and Google Cloud Platform. However, multi-cloud complexity frequently leads to critical configuration drifts—such as publicly accessible S3/Blob storage, unencrypted databases, root accounts lacking MFA, and unrestricted inbound firewall rules (ports 22 & 3389). This project implements an automated, least-privilege cloud security assessment platform grounded in CIS Foundations Benchmarks and NIST SP 800-53 controls, coupled with Google Gemini 3.8 Flash to interpret technical configuration evidence, synthesize executive briefings, and generate verified remediation scripts.
            </p>
          </div>

          {/* Architecture Modules */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              2. System Architecture & Modular Design
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400">AWS Security Adapter</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Utilizes <code>boto3</code> with IAM <code>SecurityAudit</code> policy to inspect S3 bucket policies, EC2 security groups, IAM access keys, CloudTrail trails, RDS encryption, and KMS keys.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-blue-400">Azure Security Adapter</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Leverages Azure REST APIs with <code>Reader</code> role to inspect Storage Account public blob permissions, Network Security Groups, and Key Vault soft delete settings.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-400">GCP Security Adapter</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Employs Google Cloud Client Libraries to inspect Cloud Storage IAM bindings (e.g. <code>allUsers</code>), VPC firewall ingress rules, and default Compute service account roles.
                </p>
              </div>
            </div>
          </div>

          {/* Key Viva Questions & Answers */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              3. Viva Voce Defense / Evaluation Q&A
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200">
                  Q1: How does your tool ensure it does not break production cloud workloads during an audit?
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  <strong>Answer:</strong> The platform enforces a strict read-only model. Authentication requires AWS <code>SecurityAudit</code> or Azure <code>Reader</code> permissions. The audit engine exclusively invokes describe and get APIs, with zero write, modify, or delete privileges.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200">
                  Q2: Why use Gemini AI instead of static remediation templates alone?
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  <strong>Answer:</strong> While rule engines detect binary misconfigurations, Gemini analyzes the specific context of raw configuration evidence, explains the attacker exploitation path in plain English, and generates tailored CLI/Terraform fixes adapted to the specific resource ARN.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Windows PowerShell Setup Guide */}
      {activeTab === 'SETUP_GUIDE' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Windows 10/11 & VS Code Setup Commands</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact PowerShell commands to set up the Python venv, install boto3 & dependencies, and run tests.
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(powershellScript);
                setCopiedPs(true);
                setTimeout(() => setCopiedPs(false), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              {copiedPs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPs ? 'Copied' : 'Copy PowerShell Script'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {powershellScript}
          </pre>
        </div>
      )}

      {/* Tab 3: System Audit Logs */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Immutable System Audit Trail</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Total Recorded Events: {auditLogs.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-cyan-400 font-bold">{log.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                    <td className="py-3 px-4 text-slate-200">{log.user}</td>
                    <td className="py-3 px-4 font-semibold text-slate-300">{log.action}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{log.target}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Profile */}
      {activeTab === 'PROFILE' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 max-w-xl shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Auditor Credentials & Profile</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Auditor Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Security Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Cloud Security Architect">Cloud Security Architect</option>
                <option value="Lead Auditor">Lead Auditor</option>
                <option value="Security Analyst">Security Analyst</option>
                <option value="Viewer">Viewer (Read-Only)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Update Profile
              </button>
              {savedSuccess && (
                <span className="text-xs text-emerald-400 font-semibold">Profile saved!</span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
