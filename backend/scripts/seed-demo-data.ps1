# RECtify Demo Data Seeding Script
# This script seeds comprehensive demo data for testing

Write-Host "🌱 RECtify Demo Data Seeding Script" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if MongoDB URI is set
if (-not $env:MONGODB_URI) {
    Write-Host "⚠️  Warning: MONGODB_URI environment variable not set" -ForegroundColor Yellow
    Write-Host "Reading from .env file...`n" -ForegroundColor Yellow
}

# Navigate to backend directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Split-Path -Parent $scriptPath
Set-Location $backendPath

Write-Host "📍 Current directory: $backendPath`n" -ForegroundColor Gray

# Run the seed script
Write-Host "🚀 Starting demo data seeding...`n" -ForegroundColor Green

node scripts/seedDemoData.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Demo data seeding completed successfully!" -ForegroundColor Green
    Write-Host "`n📋 Demo User Credentials:" -ForegroundColor Cyan
    Write-Host "------------------------" -ForegroundColor Cyan
    Write-Host "👤 Ahmed Al Mansouri (Trader)" -ForegroundColor White
    Write-Host "   Email: ahmed.trader@example.com" -ForegroundColor Gray
    Write-Host "   Password: password123`n" -ForegroundColor Gray
    
    Write-Host "👤 Fatima Al Zahra (Facility Owner)" -ForegroundColor White
    Write-Host "   Email: fatima.energy@example.com" -ForegroundColor Gray
    Write-Host "   Password: password123`n" -ForegroundColor Gray
    
    Write-Host "👤 Mohammed Al Rashid (Compliance Officer)" -ForegroundColor White
    Write-Host "   Email: mohammed.compliance@example.com" -ForegroundColor Gray
    Write-Host "   Password: password123`n" -ForegroundColor Gray
    
    Write-Host "📊 Data Summary:" -ForegroundColor Cyan
    Write-Host "------------------------" -ForegroundColor Cyan
    Write-Host "   • 3 Users with different roles" -ForegroundColor White
    Write-Host "   • 15 Holdings (~13,280 MWh total)" -ForegroundColor White
    Write-Host "   • 10 Active Orders (Buy & Sell)" -ForegroundColor White
    Write-Host "   • 18 Completed Transactions (4 months history)" -ForegroundColor White
    Write-Host "`n📖 For detailed data breakdown, see:" -ForegroundColor Yellow
    Write-Host "   backend/scripts/DEMO_DATA_SUMMARY.md`n" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Demo data seeding failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above.`n" -ForegroundColor Red
    exit 1
}

