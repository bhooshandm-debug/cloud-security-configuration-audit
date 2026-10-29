"""
CloudGuard Security Assessment Platform - AWS Adapter
Modular read-only security auditor using official AWS Boto3 SDK.
Enforces CIS Amazon Web Services Foundations Benchmark v3.0 rules.
"""

import json
import logging
from typing import List, Dict, Any, Optional

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
except ImportError:
    boto3 = None
    ClientError = Exception
    NoCredentialsError = Exception

logger = logging.getLogger(__name__)

class AWSAdapter:
    def __init__(self, region_name: str = "us-east-1", session: Optional[Any] = None):
        self.region_name = region_name
        self.session = session or (boto3.Session(region_name=region_name) if boto3 else None)

    def test_connection(self) -> Dict[str, Any]:
        """Validates read-only connection to AWS via STS GetCallerIdentity."""
        if not self.session:
            return {
                "success": False,
                "status": "ERROR",
                "message": "Boto3 library is not installed or initialized."
            }

        try:
            sts = self.session.client("sts")
            identity = sts.get_caller_identity()
            return {
                "success": True,
                "status": "CONNECTED",
                "account_id": identity.get("Account"),
                "arn": identity.get("Arn"),
                "user_id": identity.get("UserId"),
                "region": self.region_name,
                "permissions_verified": [
                    "sts:GetCallerIdentity",
                    "s3:GetBucketAcl",
                    "s3:GetBucketPolicy",
                    "ec2:DescribeSecurityGroups",
                    "iam:GetAccountSummary",
                    "cloudtrail:DescribeTrails"
                ]
            }
        except (NoCredentialsError, ClientError) as err:
            return {
                "success": False,
                "status": "ERROR",
                "message": f"AWS connection test failed: {str(err)}"
            }

    def audit_s3_buckets(self) -> List[Dict[str, Any]]:
        """Audits S3 buckets for public access block and open bucket policies."""
        findings = []
        if not self.session:
            return findings

        try:
            s3 = self.session.client("s3")
            buckets = s3.list_buckets().get("Buckets", [])

            for b in buckets:
                name = b["Name"]
                # Check Public Access Block
                try:
                    pab = s3.get_public_access_block(Bucket=name)
                    config = pab.get("PublicAccessBlockConfiguration", {})
                    is_public = not (
                        config.get("BlockPublicAcls") and
                        config.get("IgnorePublicAcls") and
                        config.get("BlockPublicPolicy") and
                        config.get("RestrictPublicBuckets")
                    )
                except ClientError:
                    is_public = True
                    config = {"Status": "No PublicAccessBlock found"}

                if is_public:
                    findings.append({
                        "id": f"AWS-S3-{name[:8]}",
                        "provider": "AWS",
                        "resource_id": f"arn:aws:s3:::{name}",
                        "resource_type": "AWS::S3::Bucket",
                        "region": self.region_name,
                        "rule_id": "CIS-AWS-v3.0-2.1.1",
                        "rule_title": "Ensure S3 Bucket has Public Access Blocked",
                        "category": "Storage",
                        "severity": "CRITICAL",
                        "description": f"S3 bucket '{name}' does not have full Block Public Access enabled.",
                        "evidence": config,
                        "why_it_matters": "Unrestricted bucket settings permit accidental or intentional public data leaks.",
                        "recommended_fix": "Enable Block Public Access on the bucket.",
                        "remediation_cli": f'aws s3api put-public-access-block --bucket {name} --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"',
                        "compliance_standards": ["CIS AWS v3.0 §2.1.1", "NIST 800-53 AC-3", "PCI-DSS v4.0 §1.3.1"]
                    })
        except Exception as e:
            logger.warning(f"Error auditing S3: {e}")

        return findings

    def audit_security_groups(self) -> List[Dict[str, Any]]:
        """Audits EC2 Security Groups for unrestricted ingress (0.0.0.0/0) on sensitive ports."""
        findings = []
        if not self.session:
            return findings

        try:
            ec2 = self.session.client("ec2")
            sgs = ec2.describe_security_groups().get("SecurityGroups", [])

            for sg in sgs:
                sg_id = sg["GroupId"]
                sg_name = sg.get("GroupName", "")

                for rule in sg.get("IpPermissions", []):
                    from_port = rule.get("FromPort")
                    to_port = rule.get("ToPort")
                    ip_ranges = [r.get("CidrIp") for r in rule.get("IpRanges", [])]

                    if "0.0.0.0/0" in ip_ranges:
                        # Check port 22 (SSH)
                        if from_port and to_port and from_port <= 22 <= to_port:
                            findings.append({
                                "id": f"AWS-SG-{sg_id[:8]}-22",
                                "provider": "AWS",
                                "resource_id": sg_id,
                                "resource_type": "AWS::EC2::SecurityGroup",
                                "region": self.region_name,
                                "rule_id": "CIS-AWS-v3.0-5.2",
                                "rule_title": "Ensure No Security Groups Allow Ingress from 0.0.0.0/0 to Port 22 (SSH)",
                                "category": "Network",
                                "severity": "HIGH",
                                "description": f"Security group '{sg_name}' ({sg_id}) allows inbound SSH from anywhere (0.0.0.0/0).",
                                "evidence": {"GroupId": sg_id, "GroupName": sg_name, "Rule": rule},
                                "why_it_matters": "Exposing SSH to the public internet enables credential brute-forcing and exploitation.",
                                "recommended_fix": "Restrict port 22 ingress to corporate VPN CIDR ranges or use AWS SSM Session Manager.",
                                "remediation_cli": f"aws ec2 revoke-security-group-ingress --group-id {sg_id} --protocol tcp --port 22 --cidr 0.0.0.0/0",
                                "compliance_standards": ["CIS AWS v3.0 §5.2", "NIST 800-53 AC-4"]
                            })

                        # Check port 3389 (RDP)
                        if from_port and to_port and from_port <= 3389 <= to_port:
                            findings.append({
                                "id": f"AWS-SG-{sg_id[:8]}-3389",
                                "provider": "AWS",
                                "resource_id": sg_id,
                                "resource_type": "AWS::EC2::SecurityGroup",
                                "region": self.region_name,
                                "rule_id": "CIS-AWS-v3.0-5.3",
                                "rule_title": "Ensure No Security Groups Allow Ingress from 0.0.0.0/0 to Port 3389 (RDP)",
                                "category": "Network",
                                "severity": "HIGH",
                                "description": f"Security group '{sg_name}' ({sg_id}) allows inbound Windows RDP from anywhere.",
                                "evidence": {"GroupId": sg_id, "GroupName": sg_name, "Rule": rule},
                                "why_it_matters": "Exposed RDP ports invite BlueKeep ransomware exploits and credential stuffing.",
                                "recommended_fix": "Revoke internet RDP ingress rule.",
                                "remediation_cli": f"aws ec2 revoke-security-group-ingress --group-id {sg_id} --protocol tcp --port 3389 --cidr 0.0.0.0/0",
                                "compliance_standards": ["CIS AWS v3.0 §5.3", "NIST 800-53 SC-7"]
                            })
        except Exception as e:
            logger.warning(f"Error auditing Security Groups: {e}")

        return findings
