"""
CloudGuard Security Assessment Platform - Automated Test Suite
Tests scoring algorithms, audit checks, and models using Pytest.
"""

import pytest
from backend.services.audit_engine import AuditEngine
from backend.adapters.aws_adapter import AWSAdapter
from backend.models import User

def test_posture_score_calculation():
    """Verify weighted scoring deduction algorithm."""
    # 0 vulnerabilities -> 100
    assert AuditEngine.calculate_score(0, 0, 0, 0) == 100

    # 1 Critical (-12 points) -> 88
    assert AuditEngine.calculate_score(1, 0, 0, 0) == 88

    # 2 Critical (-24) + 2 High (-12) -> 64
    assert AuditEngine.calculate_score(2, 2, 0, 0) == 64

    # Floor score at 10 minimum
    assert AuditEngine.calculate_score(10, 10, 10, 10) == 10

def test_multi_cloud_audit_engine_execution():
    """Verify multi-cloud orchestrator aggregates findings and computes metrics."""
    engine = AuditEngine()
    result = engine.run_assessment(["AWS", "AZURE", "GCP"])

    assert "id" in result
    assert result["score"] >= 10 and result["score"] <= 100
    assert len(result["findings"]) > 0
    assert result["critical_count"] >= 0

    # Verify each finding contains required CIS audit attributes
    for finding in result["findings"]:
        assert "id" in finding
        assert "provider" in finding
        assert "rule_id" in finding
        assert "severity" in finding
        assert "evidence" in finding
        assert "recommended_fix" in finding
        assert "remediation_cli" in finding

def test_user_password_hashing():
    """Verify secure password hashing with Werkzeug."""
    user = User(email="test@cloudguard.io", name="Test Auditor")
    user.set_password("SecurePassword2026!")

    assert user.password_hash != "SecurePassword2026!"
    assert user.verify_password("SecurePassword2026!") is True
    assert user.verify_password("WrongPassword") is False
