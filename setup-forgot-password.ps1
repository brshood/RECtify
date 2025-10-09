# RECtify - Forgot Password Setup Script
# This script sets up the forgot password feature

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RECtify Forgot Password Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create backend .env file
Write-Host "Step 1: Creating backend .env file..." -ForegroundColor Yellow
$backendEnv = @"
MONGODB_URI=mongodb://localhost:27017/rectify
JWT_SECRET=rectify-super-secure-jwt-secret-key-for-development-only-change-in-production
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@

Set-Content -Path "backend\.env" -Value $backendEnv
Write-Host "✓ Created backend\.env" -ForegroundColor Green

# Create frontend .env file
Write-Host ""
Write-Host "Step 2: Creating frontend .env file..." -ForegroundColor Yellow
$frontendEnv = @"
VITE_API_URL=http://localhost:5001/api
"@

Set-Content -Path "REC_Website\.env" -Value $frontendEnv
Write-Host "✓ Created REC_Website\.env" -ForegroundColor Green

# Install backend dependencies
Write-Host ""
Write-Host "Step 3: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

Set-Location -Path ".."

# Done
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Keep the backend running and test forgot password" -ForegroundColor White
Write-Host ""
Write-Host "3. Verification codes will appear in the backend terminal" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor Yellow
Write-Host "  - SETUP_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host "  - TEST_FORGOT_PASSWORD.md" -ForegroundColor Cyan
Write-Host "  - FORGOT_PASSWORD_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

