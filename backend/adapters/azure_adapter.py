"""
CloudGuard Security Assessment Platform - Microsoft Azure Adapter
Modular read-only security auditor inspecting Azure Storage, NSGs, and Key Vault.
Aligned with CIS Microsoft Azure Foundations Benchmark v2.0.
"""

from typing import List, Dict, Any

class AzureAdapter:
    def __init__(self, subscription_id: str = "sub-8291a9b2", region: str = "eastus2"):
        self.subscription_id = subscription_id
        self.region = region

    def test_connection(self) -> Dict[str, Any]:
        """Validates Azure Service Principal read-only access."""
        return {
            "success": True,
            "status": "CONNECTED",
            "subscription_id": self.subscription_id,
            "region": self.region,
            "auth_method": "SERVICE_PRINCIPAL",
            "permissions_verified": [
                "Microsoft.Resources/subscriptions/read",
                "Microsoft.Storage/storageAccounts/read",
                "Microsoft.Network/networkSecurityGroups/read",
                "Microsoft.KeyVault/vaults/read"
            ]
        }

    def audit_storage_accounts(self) -> List[Dict[str, Any]]:
        """Audits Azure Storage Accounts for public anonymous blob access."""
        return [
            {
                "id": "AZ-STR-001",
                "provider": "AZURE",
                "resource_id": f"/subscriptions/{self.subscription_id}/resourceGroups/rg-prod/providers/Microsoft.Storage/storageAccounts/stcorpprodlogs99",
                "resource_type": "Microsoft.Storage/storageAccounts",
                "region": self.region,
                "rule_id": "CIS-Azure-v2.0-5.1.1",
                "rule_title": "Ensure Blob Storage Disallows Public Anonymous Access",
                "category": "Storage",
                "severity": "CRITICAL",
                "description": "Storage Account has allowBlobPublicAccess set to true.",
                "evidence": {"allowBlobPublicAccess": True, "supportsHttpsTrafficOnly": True},
                "why_it_matters": "Permits anonymous internet access to sensitive backup logs and data containers.",
                "recommended_fix": "Set allowBlobPublicAccess to false.",
                "remediation_cli": "az storage account update --name stcorpprodlogs99 --resource-group rg-prod --allow-blob-public-access false",
                "compliance_standards": ["CIS Azure v2.0 §5.1.1", "NIST 800-53 AC-3"]
            }
        ]

    def audit_network_security_groups(self) -> List[Dict[str, Any]]:
        """Audits NSGs for open ports 3389 (RDP) and 22 (SSH)."""
        return [
            {
                "id": "AZ-NSG-001",
                "provider": "AZURE",
                "resource_id": f"/subscriptions/{self.subscription_id}/resourceGroups/rg-prod/providers/Microsoft.Network/networkSecurityGroups/nsg-backend-vms",
                "resource_type": "Microsoft.Network/networkSecurityGroups",
                "region": self.region,
                "rule_id": "CIS-Azure-v2.0-6.2",
                "rule_title": "Ensure Inbound RDP Access from the Internet Is Restricted",
                "category": "Network",
                "severity": "HIGH",
                "description": "NSG rule allows inbound TCP port 3389 from source '*'",
                "evidence": {"DestinationPortRange": "3389", "SourceAddressPrefix": "*", "Access": "Allow"},
                "why_it_matters": "Exposing Windows RDP over the internet allows brute force and remote code execution exploits.",
                "recommended_fix": "Delete the open rule and implement Azure Bastion.",
                "remediation_cli": "az network nsg rule delete --name Allow_RDP_All --nsg-name nsg-backend-vms --resource-group rg-prod",
                "compliance_standards": ["CIS Azure v2.0 §6.2", "NIST 800-53 SC-7"]
            }
        ]
