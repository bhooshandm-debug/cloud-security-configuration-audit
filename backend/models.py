"""
CloudGuard Security Assessment Platform - Database Models
Compatible with SQLite and PostgreSQL (SQLAlchemy 2.0).
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from werkzeug.security import generate_password_hash, check_password_hash

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(256), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(50), default="Cloud Security Architect")
    mfa_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(String(64), primary_key=True)
    scan_name = Column(String(150), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    providers = Column(String(100), nullable=False) # e.g. "AWS,AZURE,GCP"
    target_environment = Column(String(150), default="Multi-Cloud Production")
    total_resources = Column(Integer, default=0)
    score = Column(Integer, default=100) # 0 - 100
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    passed_count = Column(Integer, default=0)
    duration_seconds = Column(String(20), default="12.4")
    executive_summary = Column(Text, nullable=True)

    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(64), primary_key=True)
    scan_id = Column(String(64), ForeignKey("scan_records.id"), nullable=False, index=True)
    provider = Column(String(20), nullable=False) # "AWS", "AZURE", "GCP"
    resource_id = Column(String(300), nullable=False)
    resource_type = Column(String(100), nullable=False)
    region = Column(String(50), default="global")
    rule_id = Column(String(100), nullable=False)
    rule_title = Column(String(250), nullable=False)
    category = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False) # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    description = Column(Text, nullable=False)
    evidence_json = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    recommended_fix = Column(Text, nullable=False)
    remediation_cli = Column(Text, nullable=False)
    remediation_terraform = Column(Text, nullable=True)
    compliance_standards = Column(String(250), nullable=False)
    first_detected = Column(DateTime, default=datetime.utcnow)
    last_detected = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="OPEN") # "OPEN", "IN_PROGRESS", "RESOLVED", "SUPPRESSED"
    remediation_notes = Column(Text, nullable=True)

    scan = relationship("ScanRecord", back_populates="findings")


class SystemAuditLog(Base):
    __tablename__ = "system_audit_logs"

    id = Column(String(64), primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = Column(String(120), nullable=False)
    action = Column(String(100), nullable=False)
    target = Column(String(200), nullable=False)
    status = Column(String(20), default="SUCCESS")
    ip_address = Column(String(50), default="127.0.0.1")
    details = Column(Text, nullable=False)
