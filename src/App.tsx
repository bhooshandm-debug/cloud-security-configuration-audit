/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { FindingsView } from './components/FindingsView';
import { FindingDetailModal } from './components/FindingDetailModal';
import { ProvidersView } from './components/ProvidersView';
import { AuditLauncherModal } from './components/AuditLauncherModal';
import { GeminiCopilotView } from './components/GeminiCopilotView';
import { ScanHistoryView } from './components/ScanHistoryView';
import { ComplianceView } from './components/ComplianceView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

import {
  INITIAL_USER,
  INITIAL_CONNECTIONS,
  INITIAL_FINDINGS,
  INITIAL_SCAN_RECORD,
  PAST_SCANS,
  COMPLIANCE_FRAMEWORKS,
  SYSTEM_AUDIT_LOGS,
} from './data/defaultAuditData';
import {
  SecurityFinding,
  AuditScanRecord,
  ProviderConnection,
  FindingStatus,
  UserProfile,
  SystemAuditLog,
} from './types/cloudSecurity';
import { calculatePostureScore } from './services/auditEngine';

export default function App() {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [connections, setConnections] = useState<ProviderConnection[]>(INITIAL_CONNECTIONS);
  const [findings, setFindings] = useState<SecurityFinding[]>(INITIAL_FINDINGS);
  const [currentScan, setCurrentScan] = useState<AuditScanRecord>(INITIAL_SCAN_RECORD);
  const [scanHistory, setScanHistory] = useState<AuditScanRecord[]>(PAST_SCANS);
  const [compliance, setCompliance] = useState(COMPLIANCE_FRAMEWORKS);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(SYSTEM_AUDIT_LOGS);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedFindingForModal, setSelectedFindingForModal] = useState<SecurityFinding | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openCriticalCount = findings.filter(
    (f) => f.severity === 'CRITICAL' && f.status === 'OPEN'
  ).length;

  // Handle Finding Status Update (e.g. Marked Resolved)
  const handleUpdateFindingStatus = (id: string, newStatus: FindingStatus, notes?: string) => {
    const updatedFindings = findings.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          status: newStatus,
          remediationNotes: notes || f.remediationNotes,
          lastDetected: new Date().toISOString().replace('T', ' ').slice(0, 19),
        };
      }
      return f;
    });

    setFindings(updatedFindings);

    // Recalculate posture score
    const newScore = calculatePostureScore(updatedFindings);
    const updatedScan = {
      ...currentScan,
      score: newScore,
      findings: updatedFindings,
      criticalCount: updatedFindings.filter((f) => f.severity === 'CRITICAL' && f.status === 'OPEN').length,
      highCount: updatedFindings.filter((f) => f.severity === 'HIGH' && f.status === 'OPEN').length,
    };
    setCurrentScan(updatedScan);

    // Update active modal finding if currently open
    if (selectedFindingForModal && selectedFindingForModal.id === id) {
      setSelectedFindingForModal({
        ...selectedFindingForModal,
        status: newStatus,
        remediationNotes: notes || selectedFindingForModal.remediationNotes,
      });
    }

    // Add System Audit Log
    const newLog: SystemAuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: user.email,
      action: `FINDING_STATUS_${newStatus}`,
      target: id,
      status: 'SUCCESS',
      ipAddress: '192.168.1.104',
      details: `Finding ${id} status updated to ${newStatus}. Posture score recalculated to ${newScore}/100.`,
    };
    setAuditLogs([newLog, ...auditLogs]);

    showToast(`Finding ${id} marked as ${newStatus}. Score updated to ${newScore}/100.`);
  };

  // Handle New Audit Scan Completed
  const handleScanCompleted = (newScan: AuditScanRecord) => {
    setCurrentScan(newScan);
    setFindings(newScan.findings);
    setScanHistory([newScan, ...scanHistory]);

    const newLog: SystemAuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: user.email,
      action: 'AUDIT_SCAN_COMPLETED',
      target: `${newScan.providers.join(', ')} (${newScan.totalResourcesScanned} resources)`,
      status: 'SUCCESS',
      ipAddress: '192.168.1.104',
      details: `Automated scan ${newScan.id} completed. ${newScan.criticalCount} Critical, ${newScan.highCount} High vulnerabilities detected.`,
    };
    setAuditLogs([newLog, ...auditLogs]);

    showToast(`Scan ${newScan.id} completed! Identified ${newScan.criticalCount} Critical findings.`);
  };

  const handleUpdateConnection = (updated: ProviderConnection) => {
    setConnections(connections.map((c) => (c.provider === updated.provider ? updated : c)));
    showToast(`${updated.provider} connection parameters verified and updated.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navigation */}
      <Navbar
        user={user}
        connections={connections}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenAiCopilot={() => setCurrentTab('gemini')}
        activeView={currentTab}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          openCriticalCount={openCriticalCount}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentScan={currentScan}
              findings={findings}
              connections={connections}
              compliance={compliance}
              onOpenAuditModal={() => setIsAuditModalOpen(true)}
              onOpenGeminiBrief={() => setCurrentTab('gemini')}
              onSelectFinding={setSelectedFindingForModal}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'findings' && (
            <FindingsView
              findings={findings}
              onSelectFinding={setSelectedFindingForModal}
              onOpenAuditModal={() => setIsAuditModalOpen(true)}
              onOpenGeminiBrief={() => setCurrentTab('gemini')}
            />
          )}

          {currentTab === 'providers' && (
            <ProvidersView
              connections={connections}
              onUpdateConnection={handleUpdateConnection}
              onOpenAuditModal={() => setIsAuditModalOpen(true)}
            />
          )}

          {currentTab === 'gemini' && (
            <GeminiCopilotView
              currentScan={currentScan}
              findings={findings}
              onSelectFinding={setSelectedFindingForModal}
            />
          )}

          {currentTab === 'history' && (
            <ScanHistoryView
              scanHistory={scanHistory}
              currentScan={currentScan}
              onSelectHistoricalScan={(s) => {
                setCurrentScan(s);
                setFindings(s.findings);
                showToast(`Loaded historical scan ${s.id}.`);
              }}
              onSelectFinding={setSelectedFindingForModal}
            />
          )}

          {currentTab === 'compliance' && (
            <ComplianceView
              compliance={compliance}
              findings={findings}
              onSelectFinding={setSelectedFindingForModal}
              onNavigateToFindings={() => setCurrentTab('findings')}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              currentScan={currentScan}
              findings={findings}
              user={user}
              compliance={compliance}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              auditLogs={auditLogs}
              onUpdateUser={setUser}
            />
          )}
        </main>
      </div>

      {/* Finding Detail & Evidence Drawer/Modal */}
      <FindingDetailModal
        finding={selectedFindingForModal}
        onClose={() => setSelectedFindingForModal(null)}
        onUpdateStatus={handleUpdateFindingStatus}
      />

      {/* Audit Execution Modal */}
      <AuditLauncherModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onScanCompleted={handleScanCompleted}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-semibold text-slate-100 shadow-2xl flex items-center space-x-2.5 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
