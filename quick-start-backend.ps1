# RECtify Backend Quick Start Script
# This script sets up and starts the backend server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RECtify Backend Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Write-Host ""
Write-Host "Navigating to backend directory..." -ForegroundColor Yellow
Set-Location -Path "backend"

# Check if .env file exists
Write-Host ""
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file in the backend directory" -ForegroundColor Red
    Write-Host "You can copy from .env.example or env.sample" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green

# Start the server
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will start on http://localhost:5001" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start

