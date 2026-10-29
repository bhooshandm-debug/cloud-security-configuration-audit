"""
CloudGuard Security Assessment Platform - Configuration Module
Supports SQLite initially with seamless PostgreSQL migration capability.
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "cloudguard-security-secret-key-mca-2026")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///cloudguard.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    
    # Cloud Default Regions
    AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    AZURE_DEFAULT_REGION = os.getenv("AZURE_DEFAULT_REGION", "eastus2")
    GCP_DEFAULT_REGION = os.getenv("GCP_DEFAULT_REGION", "us-central1")
    
    # Audit Security Policy
    READ_ONLY_MODE = True
    MAX_RESOURCES_PER_SCAN = 500
