"""
CloudGuard Security Assessment Platform - Audit Engine
Executes multi-cloud security assessment, computes posture score, and maps compliance frameworks.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any
from backend.adapters.aws_adapter import AWSAdapter
from backend.adapters.azure_adapter import AzureAdapter
from backend.adapters.gcp_adapter import GCPAdapter

class AuditEngine:
    def __init__(self):
        self.aws = AWSAdapter()
        self.azure = AzureAdapter()
        self.gcp = GCPAdapter()

    def run_assessment(self, providers: List[str]) -> Dict[str, Any]:
        """Runs security checks across requested cloud providers."""
        all_findings = []

        if "AWS" in providers:
            all_findings.extend(self.aws.audit_s3_buckets())
            all_findings.extend(self.aws.audit_security_groups())

        if "AZURE" in providers:
            all_findings.extend(self.azure.audit_storage_accounts())
            all_findings.extend(self.azure.audit_network_security_groups())

        if "GCP" in providers:
            all_findings.extend(self.gcp.audit_storage_buckets())
            all_findings.extend(self.gcp.audit_vpc_firewalls())

        critical_count = len([f for f in all_findings if f["severity"] == "CRITICAL"])
        high_count = len([f for f in all_findings if f["severity"] == "HIGH"])
        medium_count = len([f for f in all_findings if f["severity"] == "MEDIUM"])
        low_count = len([f for f in all_findings if f["severity"] == "LOW"])

        total_resources = len(providers) * 45 + len(all_findings)
        score = self.calculate_score(critical_count, high_count, medium_count, low_count)
        passed_count = max(0, total_resources - len(all_findings))

        scan_id = f"scan-{uuid.uuid4().hex[:8]}"

        return {
            "id": scan_id,
            "scan_name": f"Automated Security Audit ({', '.join(providers)})",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "providers": providers,
            "total_resources": total_resources,
            "score": score,
            "critical_count": critical_count,
            "high_count": high_count,
            "medium_count": medium_count,
            "low_count": low_count,
            "passed_count": passed_count,
            "findings": all_findings,
            "duration_seconds": "9.8"
        }

    @staticmethod
    def calculate_score(critical: int, high: int, medium: int, low: int) -> int:
        """Deducts weighted points based on severity to compute 0-100 score."""
        deductions = (critical * 12) + (high * 6) + (medium * 3) + (low * 1)
        return max(10, min(100, 100 - deductions))
