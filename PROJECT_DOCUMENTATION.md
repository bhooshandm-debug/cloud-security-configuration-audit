# Cloud Security Configuration and Audit: An AI-Assisted Multi-Cloud Security Assessment Platform

**Master of Computer Applications (MCA) - Main Project Documentation**  
**Student:** Bhooshan D. M. (`bhooshandm@gmail.com`)  
**Domain:** Cloud Computing, Cybersecurity & Artificial Intelligence  
**Standard Benchmarks:** CIS AWS Foundations Benchmark v3.0, CIS Azure v2.0, CIS GCP v2.0, NIST SP 800-53 Rev. 5, PCI-DSS v4.0  

---

## 1. Executive Summary & Problem Statement

Modern enterprise IT architecture increasingly leverages multi-cloud deployments across Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP). However, fragmented cloud consoles and rapid infrastructure-as-code changes frequently introduce critical security misconfigurations:
1. **Public Storage Exposures:** S3 buckets, Azure Blob containers, and GCS buckets permitting unauthenticated anonymous access.
2. **Insecure Network Boundaries:** Unrestricted inbound rules (`0.0.0.0/0`) exposing management ports such as SSH (22) and Windows RDP (3389).
3. **Identity Vulnerabilities:** Root/Global Admin accounts lacking Multi-Factor Authentication (MFA) and customer-managed IAM policies with wildcard `*` privileges.
4. **Cryptographic & Logging Deficits:** Disabled database encryption, unrotated KMS keys, and single-region CloudTrail trails.

**CloudGuard** is an end-to-end multi-cloud security assessment platform that performs automated, non-intrusive, read-only configuration audits and leverages **Google Gemini 3.8 Flash** to transform complex configuration payloads into plain-English threat narratives and copy-paste remediation scripts.

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                        PRESENTATION LAYER (React 19 + Tailwind CSS)               |
|  - Posture Dashboard        - Security Findings Explorer   - Cloud Provider Hub   |
|  - Gemini AI Co-Pilot Chat  - Scan History & Drift Engine  - Regulatory Reports   |
+-----------------------------------------+-----------------------------------------+
                                          | JSON REST / SSE
                                          v
+-----------------------------------------------------------------------------------+
|                     APPLICATION & ORCHESTRATION LAYER (Full-Stack)                |
|  - Express / Flask Server  - Least-Privilege Enforcer  - Scoring & Drift Engine   |
+-------------+---------------------------+---------------------------+-------------+
              |                           |                           |
              v                           v                           v
+-----------------------------+ +-------------------+ +-----------------------------+
|    CLOUD PROVIDER ADAPTERS  | |  GEMINI AI ENGINE | |     PERSISTENCE LAYER       |
|  - AWS (boto3 / STS / S3)   | |  - Gemini 3.8     | |  - SQLite (cloudguard.db)   |
|  - Azure (REST / Storage)   | |    Flash          | |  - User Sessions / PBKDF2   |
|  - GCP (Cloud Storage / FW) | |  - Threat Models  | |  - Immutable Audit Trails   |
+-----------------------------+ +-------------------+ +-----------------------------+
```

---

## 3. Database Schema

1. **`users` Table:**
   - `id` (PK, INTEGER)
   - `email` (VARCHAR(120), UNIQUE, INDEXED)
   - `password_hash` (VARCHAR(256), Werkzeug PBKDF2-SHA256)
   - `role` (VARCHAR(50), "Cloud Security Architect", "Lead Auditor")
   - `mfa_enabled` (BOOLEAN)
   - `created_at` (DATETIME)

2. **`scan_records` Table:**
   - `id` (PK, VARCHAR(64), e.g. `scan-20261028-2245`)
   - `scan_name` (VARCHAR(150))
   - `timestamp` (DATETIME)
   - `providers` (VARCHAR(100), e.g. "AWS,AZURE,GCP")
   - `total_resources` (INTEGER)
   - `score` (INTEGER, 0 to 100)
   - `critical_count`, `high_count`, `medium_count`, `low_count`, `passed_count` (INTEGER)
   - `executive_summary` (TEXT)

3. **`findings` Table:**
   - `id` (PK, VARCHAR(64), e.g. `AWS-S3-001`)
   - `scan_id` (FK -> `scan_records.id`)
   - `provider` (VARCHAR(20), "AWS" | "AZURE" | "GCP")
   - `resource_id` (VARCHAR(300))
   - `rule_id` (VARCHAR(100), e.g. `CIS-AWS-v3.0-2.1.1`)
   - `severity` (VARCHAR(20), "CRITICAL" | "HIGH" | "MEDIUM" | "LOW")
   - `description` (TEXT)
   - `evidence_json` (TEXT)
   - `why_it_matters` (TEXT)
   - `recommended_fix` (TEXT)
   - `remediation_cli` (TEXT)
   - `status` (VARCHAR(20), "OPEN" | "IN_PROGRESS" | "RESOLVED")

4. **`system_audit_logs` Table:**
   - `id` (PK, VARCHAR(64))
   - `timestamp` (DATETIME)
   - `user` (VARCHAR(120))
   - `action` (VARCHAR(100))
   - `target` (VARCHAR(200))
   - `status` (VARCHAR(20))
   - `details` (TEXT)

---

## 4. Windows 10/11 & VS Code Setup (PowerShell)

Run the following commands in PowerShell from the project workspace:

```powershell
# 1. Create and Activate Virtual Environment
python -m venv venv
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
.\venv\Scripts\Activate.ps1

# 2. Install Python Dependencies
pip install -r backend/requirements.txt

# 3. Configure .env file
Copy-Item .env.example .env
# Set GEMINI_API_KEY in .env

# 4. Initialize Database
python -c "from backend.app import init_db; init_db()"

# 5. Run Automated Tests
pytest backend/tests/test_audit.py -v

# 6. Start Application
# Terminal 1:
python backend/app.py
# Terminal 2:
npm install
npm run dev
```

---

## 5. Viva Voce Defense & Examiner Q&A Guide

- **Q1: What prevents the platform from causing outages in a live cloud environment?**  
  *Answer:* The platform strictly enforces read-only access. It attaches only the AWS managed policy `SecurityAudit` or Azure `Reader` role, invoking only describe/get APIs. It possesses zero IAM permissions to create, update, or delete resources.

- **Q2: How does the configuration drift detection algorithm work?**  
  *Answer:* The platform tracks scans over time using unique finding signatures `(provider, rule_id, resource_id)`. When comparing Scan A and Scan B, it computes the set difference to identify newly introduced vulnerabilities (regressions) and resolved issues.

- **Q3: What role does Gemini AI play in the audit lifecycle?**  
  *Answer:* Gemini 3.8 Flash acts as an AI Co-Pilot to: (1) synthesize high-level Executive Briefings for leadership, (2) translate raw JSON configuration evidence into plain-English attack paths, (3) generate exact CLI and Terraform IaC fix blocks, and (4) provide grounded interactive Q&A.
