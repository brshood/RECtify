#!/bin/bash

echo "🔧 Setting up real email functionality for RECtify..."
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ .env file not found in backend directory"
    exit 1
fi

echo "📧 Current email configuration:"
grep -E "EMAIL_USER|EMAIL_PASS" backend/.env || echo "No email configuration found"

echo ""
echo "🔑 To enable real email sending:"
echo "1. Get Gmail App Password from: https://myaccount.google.com/apppasswords"
echo "2. Update backend/.env file with:"
echo "   EMAIL_USER=alsamrikhaled@gmail.com"
echo "   EMAIL_PASS=your-16-character-app-password"
echo ""
echo "3. Restart the backend: cd backend && npm start"
echo ""
echo "✅ Email service will automatically detect real credentials and send actual emails!"
