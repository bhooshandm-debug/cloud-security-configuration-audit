import { SecurityFinding, AuditScanRecord, CloudProvider, Severity } from '../types/cloudSecurity';
import { INITIAL_FINDINGS } from '../data/defaultAuditData';

export function calculatePostureScore(findings: SecurityFinding[]): number {
  let deductions = 0;
  for (const f of findings) {
    if (f.status === 'RESOLVED' || f.status === 'SUPPRESSED') continue;
    switch (f.severity) {
      case 'CRITICAL':
        deductions += 12;
        break;
      case 'HIGH':
        deductions += 6;
        break;
      case 'MEDIUM':
        deductions += 3;
        break;
      case 'LOW':
        deductions += 1;
        break;
      default:
        break;
    }
  }
  const score = Math.max(10, Math.min(100, 100 - deductions));
  return score;
}

export function filterFindings(
  findings: SecurityFinding[],
  filters: {
    search: string;
    provider: string;
    severity: string;
    category: string;
    status: string;
  }
): SecurityFinding[] {
  return findings.filter((f) => {
    if (filters.provider && filters.provider !== 'ALL' && f.provider !== filters.provider) {
      return false;
    }
    if (filters.severity && filters.severity !== 'ALL' && f.severity !== filters.severity) {
      return false;
    }
    if (filters.category && filters.category !== 'ALL' && f.category !== filters.category) {
      return false;
    }
    if (filters.status && filters.status !== 'ALL' && f.status !== filters.status) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        f.id.toLowerCase().includes(q) ||
        f.ruleTitle.toLowerCase().includes(q) ||
        f.resourceId.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.complianceStandards.some((c) => c.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

export function exportFindingsToCsv(findings: SecurityFinding[], scanName: string = 'CloudGuard_Audit_Report') {
  const headers = [
    'Finding ID',
    'Provider',
    'Severity',
    'Category',
    'Rule ID',
    'Rule Title',
    'Resource ID',
    'Resource Type',
    'Region',
    'Status',
    'Why It Matters',
    'Recommended Fix',
    'CLI Remediation Command',
    'Compliance Standards',
    'First Detected',
    'Last Detected',
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = findings.map((f) => [
    escapeCsv(f.id),
    escapeCsv(f.provider),
    escapeCsv(f.severity),
    escapeCsv(f.category),
    escapeCsv(f.ruleId),
    escapeCsv(f.ruleTitle),
    escapeCsv(f.resourceId),
    escapeCsv(f.resourceType),
    escapeCsv(f.region),
    escapeCsv(f.status),
    escapeCsv(f.whyItMatters),
    escapeCsv(f.recommendedFix),
    escapeCsv(f.remediationCli),
    escapeCsv(f.complianceStandards.join('; ')),
    escapeCsv(f.firstDetected),
    escapeCsv(f.lastDetected),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${scanName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function executeSimulationAudit(selectedProviders: CloudProvider[]): AuditScanRecord {
  // Select findings matching chosen providers
  const matchedFindings = INITIAL_FINDINGS.filter((f) => selectedProviders.includes(f.provider));
  const criticalCount = matchedFindings.filter((f) => f.severity === 'CRITICAL' && f.status === 'OPEN').length;
  const highCount = matchedFindings.filter((f) => f.severity === 'HIGH' && f.status === 'OPEN').length;
  const mediumCount = matchedFindings.filter((f) => f.severity === 'MEDIUM' && f.status === 'OPEN').length;
  const lowCount = matchedFindings.filter((f) => f.severity === 'LOW' && f.status === 'OPEN').length;
  const totalResources = selectedProviders.length * 64 + Math.floor(Math.random() * 20);
  const passedCount = totalResources - matchedFindings.length;
  const score = calculatePostureScore(matchedFindings);

  const scanId = `scan-${Date.now().toString().slice(-8)}`;
  return {
    id: scanId,
    scanName: `On-Demand Audit (${selectedProviders.join(', ')})`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
    providers: selectedProviders,
    targetEnvironment: `${selectedProviders.join(' + ')} Multi-Cloud Production Mesh`,
    totalResourcesScanned: totalResources,
    score,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    passedCount,
    findings: matchedFindings,
    durationSeconds: parseFloat((selectedProviders.length * 4.2 + Math.random() * 2).toFixed(1)),
    executiveSummary: `Live automated audit completed across ${selectedProviders.join(', ')}. Scanned ${totalResources} cloud assets against CIS Benchmarks. Identified ${criticalCount} Critical vulnerabilities requiring rapid mitigation.`,
  };
}
