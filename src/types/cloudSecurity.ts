export type CloudProvider = 'AWS' | 'AZURE' | 'GCP';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PASSED';

export type FindingStatus = 'OPEN' | 'IN_PROGRESS' | 'SUPPRESSED' | 'RESOLVED';

export type Category = 'Storage' | 'IAM' | 'Network' | 'Encryption' | 'Logging' | 'Database' | 'Compute';

export interface SecurityFinding {
  id: string;
  provider: CloudProvider;
  resourceId: string;
  resourceType: string;
  region: string;
  ruleId: string;
  ruleTitle: string;
  category: Category;
  severity: Severity;
  description: string;
  evidence: Record<string, any> | string;
  whyItMatters: string;
  recommendedFix: string;
  remediationCli: string;
  remediationTerraform?: string;
  complianceStandards: string[];
  firstDetected: string;
  lastDetected: string;
  status: FindingStatus;
  remediationNotes?: string;
}

export interface AuditScanRecord {
  id: string;
  scanName: string;
  timestamp: string;
  providers: CloudProvider[];
  targetEnvironment: string;
  totalResourcesScanned: number;
  score: number; // 0 - 100
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  passedCount: number;
  findings: SecurityFinding[];
  executiveSummary?: string;
  durationSeconds: number;
}

export interface ProviderConnection {
  provider: CloudProvider;
  accountName: string;
  accountId: string;
  region: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SAMPLE_ENV' | 'ERROR';
  authMethod: 'IAM_ROLE' | 'ACCESS_KEYS' | 'SERVICE_PRINCIPAL' | 'SERVICE_ACCOUNT';
  permissionsVerified: string[];
  lastTestedAt?: string;
  latencyMs?: number;
  errorMessage?: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  passedPercentage: number;
  controlsTotal: number;
  controlsPassed: number;
  controlsFailed: number;
  topGaps: string[];
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  ipAddress: string;
  details: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Cloud Security Architect' | 'Lead Auditor' | 'Security Analyst' | 'Viewer';
  department: string;
  institution: string;
  avatarUrl?: string;
  mfaEnabled: boolean;
}
