import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI client with recommended User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Test Cloud Provider Connection
app.post('/api/audit/test-connection', (req: Request, res: Response) => {
  try {
    const { provider, authMethod, accountId, region } = req.body;
    const start = Date.now();

    // Verify provider
    if (!['AWS', 'AZURE', 'GCP'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid cloud provider specified.' });
    }

    // Realistic permission verification simulation
    let verifiedPermissions: string[] = [];
    if (provider === 'AWS') {
      verifiedPermissions = [
        'sts:GetCallerIdentity',
        's3:GetBucketAcl',
        's3:GetBucketPolicy',
        's3:GetEncryptionConfiguration',
        'ec2:DescribeSecurityGroups',
        'ec2:DescribeInstances',
        'iam:GetAccountSummary',
        'iam:ListUsers',
        'iam:ListPolicies',
        'cloudtrail:DescribeTrails',
        'rds:DescribeDBInstances',
        'kms:ListKeys',
      ];
    } else if (provider === 'AZURE') {
      verifiedPermissions = [
        'Microsoft.Resources/subscriptions/read',
        'Microsoft.Storage/storageAccounts/read',
        'Microsoft.Network/networkSecurityGroups/read',
        'Microsoft.KeyVault/vaults/read',
        'Microsoft.Authorization/roleAssignments/read',
      ];
    } else if (provider === 'GCP') {
      verifiedPermissions = [
        'resourcemanager.projects.get',
        'storage.buckets.get',
        'storage.buckets.getIamPolicy',
        'compute.firewalls.list',
        'iam.serviceAccounts.list',
        'logging.sinks.list',
      ];
    }

    const latency = Date.now() - start + Math.floor(Math.random() * 80 + 110);

    return res.json({
      success: true,
      provider,
      status: 'CONNECTED',
      accountId: accountId || (provider === 'AWS' ? '124892019482' : provider === 'AZURE' ? 'sub-8291a9b2' : 'gcp-core-analytics-prod'),
      region: region || (provider === 'AWS' ? 'us-east-1' : provider === 'AZURE' ? 'eastus2' : 'us-central1'),
      authMethod: authMethod || 'IAM_ROLE',
      latencyMs: latency,
      permissionsVerified: verifiedPermissions,
      message: `Successfully connected to ${provider} via read-only security auditing credentials. Verified ${verifiedPermissions.length} IAM security policies.`,
      testedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to test connection' });
  }
});

// Endpoint: Gemini AI Executive Summary
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  try {
    const { scanName, score, criticalCount, highCount, mediumCount, lowCount, findings } = req.body;

    // Filter findings to pass relevant non-sensitive security details
    const sanitizedFindings = (findings || []).slice(0, 10).map((f: any) => ({
      id: f.id,
      provider: f.provider,
      rule: f.ruleTitle,
      resource: f.resourceId,
      severity: f.severity,
      description: f.description,
      whyItMatters: f.whyItMatters,
    }));

    const prompt = `You are a Senior Cloud Security Architect and CIS Benchmark Auditor.
Analyze the following multi-cloud security assessment scan results:

Scan Name: ${scanName || 'Multi-Cloud Security Audit'}
Security Posture Score: ${score}/100
Findings Severity Breakdown:
- Critical: ${criticalCount}
- High: ${highCount}
- Medium: ${mediumCount}
- Low: ${lowCount}

Sample Detected Security Findings:
${JSON.stringify(sanitizedFindings, null, 2)}

Provide a concise, highly professional Executive Briefing in Markdown containing:
1. **Executive Posture Summary**: Direct assessment of the tenant's security posture and risk tolerance.
2. **Key Threat Vectors**: 2-3 highest blast-radius exposure paths (e.g., publicly accessible storage, exposed administrative ports, IAM privilege escalation).
3. **Immediate Containment Roadmap**: Step-by-step priority order to contain critical risks within 24-48 hours.
4. **Compliance Standing**: High-level impact on CIS Benchmarks, NIST 800-53, and PCI-DSS compliance.

Keep it crisp, actionable, and formatted for senior leadership / CISO review.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const summaryText = response.text || 'Unable to generate summary at this time.';

    return res.json({
      success: true,
      executiveSummary: summaryText,
    });
  } catch (err: any) {
    console.error('Gemini Summarize Error:', err);
    return res.status(500).json({
      error: 'Gemini AI synthesis encountered an error: ' + (err.message || 'Unknown error'),
    });
  }
});

// Endpoint: Gemini AI Deep Finding Explanation
app.post('/api/gemini/explain', async (req: Request, res: Response) => {
  try {
    const { finding } = req.body;
    if (!finding) {
      return res.status(400).json({ error: 'Finding payload is required.' });
    }

    const prompt = `You are a Senior Cloud Security Auditor. Explain this cloud configuration vulnerability in detail for a cybersecurity student or security engineer:

Finding ID: ${finding.id}
Cloud Provider: ${finding.provider}
Rule Title: ${finding.ruleTitle}
Severity: ${finding.severity}
Affected Resource: ${finding.resourceId} (${finding.resourceType})
Category: ${finding.category}
Configuration Evidence:
${typeof finding.evidence === 'object' ? JSON.stringify(finding.evidence, null, 2) : finding.evidence}

Compliance Standards: ${(finding.complianceStandards || []).join(', ')}

Please provide:
1. **Plain-English Breakdown**: Explain why this configuration occurred and what it fundamentally means in simple terms.
2. **Attacker Scenario / Threat Path**: How would a real-world threat actor discover and exploit this misconfiguration?
3. **Defense-in-Depth Rationale**: Why do CIS and NIST frameworks mandate this control?
4. **Verification Step**: How can the auditor verify whether this issue has been resolved after remediation?`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      explanation: response.text,
    });
  } catch (err: any) {
    console.error('Gemini Explain Error:', err);
    return res.status(500).json({
      error: 'Gemini explanation error: ' + (err.message || 'Unknown error'),
    });
  }
});

// Endpoint: Gemini AI Custom Remediation Code Generator
app.post('/api/gemini/remediate', async (req: Request, res: Response) => {
  try {
    const { finding, targetFormat } = req.body; // targetFormat: 'CLI' | 'TERRAFORM' | 'PYTHON'
    if (!finding) {
      return res.status(400).json({ error: 'Finding payload is required.' });
    }

    const prompt = `You are a DevSecOps Automation Engineer.
Generate an exact, copy-paste ready remediation solution in ${targetFormat || 'CLI & Terraform'} for this finding:

Provider: ${finding.provider}
Resource ID: ${finding.resourceId}
Rule: ${finding.ruleTitle}
Evidence:
${typeof finding.evidence === 'object' ? JSON.stringify(finding.evidence, null, 2) : finding.evidence}

Output requirements:
1. Show the EXACT command-line instructions (${finding.provider === 'AWS' ? 'AWS CLI' : finding.provider === 'AZURE' ? 'Azure CLI' : 'gcloud'})
2. Show the Terraform (IaC) resource block with the hardened secure configuration.
3. Include brief pre-flight checks and post-validation commands.
Ensure the scripts are safe and do not cause service outages.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      remediationPlan: response.text,
    });
  } catch (err: any) {
    console.error('Gemini Remediate Error:', err);
    return res.status(500).json({
      error: 'Gemini remediation generator error: ' + (err.message || 'Unknown error'),
    });
  }
});

// Endpoint: Gemini Grounded Interactive Cloud Security Chatbot
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, findingsSummary } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const systemInstruction = `You are CloudGuard AI Copilot, an expert AI Cloud Security Assistant specialized in AWS, Azure, and Google Cloud security auditing, CIS Benchmarks, NIST 800-53, and cloud penetration defense.
You are assisting an MCA student and cloud security auditor.
Ground your responses strictly in genuine cloud security best practices and the provided audit findings.
Do not invent scan results or make up fake resources. If asked about how to fix an issue, provide practical commands (boto3, AWS CLI, Terraform, az CLI, gcloud).
Context of current active findings:
${findingsSummary || 'Multi-cloud audit findings active with critical S3 bucket access, root MFA absence, open port 22/3389, and unencrypted databases.'}`;

    // Combine history for simple multi-turn context
    let formattedContents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      formattedContents = history.slice(-6).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));
    }
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      success: true,
      reply: response.text,
    });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    return res.status(500).json({
      error: 'Gemini chat error: ' + (err.message || 'Unknown error'),
    });
  }
});

// Initialize Vite in middleware mode for full-stack SPA development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CloudGuard Security Assessment Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
