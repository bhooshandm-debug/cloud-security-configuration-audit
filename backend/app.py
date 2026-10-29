"""
CloudGuard Security Assessment Platform - Main Flask API Application
MCA Main Project - Multi-Cloud Security Assessment Engine
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.config import Config
from backend.models import Base, User, ScanRecord, Finding, SystemAuditLog
from backend.services.audit_engine import AuditEngine
from backend.services.gemini_service import GeminiSecurityService

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database Setup
engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes SQLite database tables and seeds initial user."""
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        if not session.query(User).filter_by(email="bhooshandm@gmail.com").first():
            admin = User(
                email="bhooshandm@gmail.com",
                name="Bhooshan D. M.",
                role="Cloud Security Architect"
            )
            admin.set_password("SecureCloudGuard2026!")
            session.add(admin)
            session.commit()
            print("[INFO] Database initialized with default auditor account.")
    finally:
        session.close()

# Service Instances
audit_engine = AuditEngine()
gemini_service = GeminiSecurityService()

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "service": "CloudGuard Multi-Cloud Audit API",
        "version": "2.4.0",
        "gemini_active": bool(Config.GEMINI_API_KEY)
    })

@app.route("/api/audit/test-connection", methods=["POST"])
def test_connection():
    data = request.get_json() or {}
    provider = data.get("provider", "AWS")

    if provider == "AWS":
        res = audit_engine.aws.test_connection()
    elif provider == "AZURE":
        res = audit_engine.azure.test_connection()
    elif provider == "GCP":
        res = audit_engine.gcp.test_connection()
    else:
        return jsonify({"error": "Unknown cloud provider"}), 400

    return jsonify(res)

@app.route("/api/audit/run", methods=["POST"])
def run_audit():
    data = request.get_json() or {}
    providers = data.get("providers", ["AWS", "AZURE", "GCP"])
    scan_result = audit_engine.run_assessment(providers)
    return jsonify(scan_result)

@app.route("/api/gemini/summarize", methods=["POST"])
def summarize_scan():
    data = request.get_json() or {}
    scan_summary = data.get("scanSummary", {})
    findings = data.get("findings", [])
    brief = gemini_service.generate_executive_brief(scan_summary, findings)
    return jsonify({"executive_brief": brief})

@app.route("/api/gemini/explain", methods=["POST"])
def explain_finding():
    data = request.get_json() or {}
    finding = data.get("finding", {})
    explanation = gemini_service.explain_finding(finding)
    return jsonify({"explanation": explanation})

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    print(f"[INFO] CloudGuard Python Flask Backend running on http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=True)
