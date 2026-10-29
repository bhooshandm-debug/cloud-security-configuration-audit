import { SecurityFinding } from '../types/cloudSecurity';

export interface TestConnectionResponse {
  success: boolean;
  provider: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SAMPLE_ENV' | 'ERROR';
  accountId: string;
  region: string;
  latencyMs: number;
  permissionsVerified: string[];
  message: string;
  testedAt: string;
}

export async function testCloudConnection(params: {
  provider: 'AWS' | 'AZURE' | 'GCP';
  authMethod: string;
  accountId?: string;
  region?: string;
  credentials?: Record<string, string>;
}): Promise<TestConnectionResponse> {
  const res = await fetch('/api/audit/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Connection test failed with HTTP ${res.status}`);
  }

  return res.json();
}

export async function generateGeminiSummary(params: {
  scanName: string;
  score: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  findings: SecurityFinding[];
}): Promise<string> {
  const res = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate Gemini summary');
  }

  const data = await res.json();
  return data.executiveSummary;
}

export async function explainFindingWithGemini(finding: SecurityFinding): Promise<string> {
  const res = await fetch('/api/gemini/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finding }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to explain finding');
  }

  const data = await res.json();
  return data.explanation;
}

export async function generateRemediationWithGemini(
  finding: SecurityFinding,
  targetFormat: 'CLI' | 'TERRAFORM' | 'PYTHON'
): Promise<string> {
  const res = await fetch('/api/gemini/remediate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finding, targetFormat }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate remediation');
  }

  const data = await res.json();
  return data.remediationPlan;
}

export async function sendGeminiChatMessage(params: {
  message: string;
  history: { role: 'user' | 'model'; text: string }[];
  findingsSummary: string;
}): Promise<string> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gemini chatbot request failed');
  }

  const data = await res.json();
  return data.reply;
}
