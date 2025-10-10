#!/bin/bash

echo "🚀 Setting up EmailJS for Password Reset..."
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env file not found"
    exit 1
fi

if [ ! -f "REC_Website/.env" ]; then
    echo "⚠️  REC_Website/.env file not found, using env.sample"
    if [ -f "REC_Website/env.sample" ]; then
        cp REC_Website/env.sample REC_Website/.env
        echo "✅ Created REC_Website/.env from env.sample"
    else
        echo "❌ No env.sample found in REC_Website"
        exit 1
    fi
fi

echo "📧 Current EmailJS configuration:"
echo "Backend:"
grep -E "EMAILJS_" backend/.env || echo "No EmailJS config found in backend"
echo ""
echo "Frontend:"
grep -E "EMAILJS_" REC_Website/.env || echo "No EmailJS config found in frontend"
echo ""

echo "🔧 Setup Steps:"
echo "1. Go to https://dashboard.emailjs.com/"
echo "2. Create a new template using the template in EMAILJS_PASSWORD_RESET_TEMPLATE.md"
echo "3. Get your Service ID, Template ID, and Public Key"
echo "4. Update both .env files with these credentials"
echo "5. Restart the backend: cd backend && npm start"
echo ""

echo "📝 Template Variables needed:"
echo "- {{user_name}} - User's name"
echo "- {{verification_code}} - 6-digit code"
echo "- {{reset_url}} - Password reset link"
echo ""

echo "✅ Once configured, users will receive real emails for password reset!"
