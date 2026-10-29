# ==============================================================================
# CloudGuard - Multi-Cloud Security Assessment Platform (Windows PowerShell Setup)
# MCA Final Year Main Project
# Student: Bhooshan D. M. (bhooshandm@gmail.com)
# ==============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " CloudGuard AI - Multi-Cloud Security Configuration & Audit Setup" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Verify Python Installation
Write-Host "`n[Step 1/7] Verifying Python 3.10+ installation..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Python is not installed or not in system PATH." -ForegroundColor Red
    exit 1
}

# 2. Create and Activate Virtual Environment
Write-Host "`n[Step 2/7] Creating Python Virtual Environment (venv)..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "Created virtual environment in .\venv" -ForegroundColor Green
} else {
    Write-Host "Virtual environment already exists." -ForegroundColor Green
}

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
.\venv\Scripts\Activate.ps1
Write-Host "Virtual environment activated." -ForegroundColor Green

# 3. Upgrade pip and Install Dependencies
Write-Host "`n[Step 3/7] Installing Python dependencies (Flask, Boto3, Google-GenAI)..." -ForegroundColor Yellow
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
Write-Host "Dependencies successfully installed." -ForegroundColor Green

# 4. Configure .env file
Write-Host "`n[Step 4/7] Checking environment configuration (.env)..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
    Write-Host "Created .env file from .env.example. Please verify GEMINI_API_KEY." -ForegroundColor Green
} else {
    Write-Host ".env file is present." -ForegroundColor Green
}

# 5. Initialize the Database
Write-Host "`n[Step 5/7] Initializing SQLite Database (cloudguard.db)..." -ForegroundColor Yellow
python -c "from backend.app import init_db; init_db()"
Write-Host "Database tables created and seeded with default security architect user." -ForegroundColor Green

# 6. Execute Automated Pytest Suite
Write-Host "`n[Step 6/7] Running Automated Security Engine Tests (Pytest)..." -ForegroundColor Yellow
pytest backend/tests/test_audit.py -v

# 7. Complete Instructions
Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " SETUP COMPLETE! Start the application using:" -ForegroundColor Green
Write-Host " 1. Terminal 1 (Python Flask API):" -ForegroundColor White
Write-Host "    .\venv\Scripts\Activate.ps1; python backend/app.py" -ForegroundColor Cyan
Write-Host " 2. Terminal 2 (React Vite Dashboard):" -ForegroundColor White
Write-Host "    npm install; npm run dev" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
