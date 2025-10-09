# Forgot Password Setup Guide

## Issues Found

Your forgot password feature is failing because:

1. ❌ **Backend dependencies are not installed**
2. ❌ **Backend environment variables are not configured**
3. ❌ **Backend server is not running**
4. ❌ **Email service is not configured**

## Step-by-Step Fix

### 1. Install Backend Dependencies

```powershell
cd backend
npm install
```

### 2. Create Backend .env File

Create a `.env` file in the `backend` directory with these settings:

```env
# MongoDB Connection (Required)
MONGODB_URI=your_mongodb_connection_string

# JWT Secret (Required - must be at least 32 characters)
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long

# Server Configuration
PORT=5001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration - Option 1: Gmail SMTP (Recommended for testing)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=noreply@rectify.ae

# Email Configuration - Option 2: EmailJS (Alternative)
# EMAILJS_SERVICE_ID=your_service_id
# EMAILJS_TEMPLATE_ID=your_template_id
# EMAILJS_PUBLIC_KEY=your_public_key
```

**Important Notes:**
- For `EMAIL_PASS`, you need a Gmail App Password (not your regular password)
- Get it from: https://myaccount.google.com/apppasswords
- You need 2-factor authentication enabled on your Gmail account first

### 3. Start the Backend Server

```powershell
cd backend
npm start
```

Or for development with auto-reload:
```powershell
npm run dev
```

The backend should start on http://localhost:5001

### 4. Verify Backend is Running

Open a browser and go to: http://localhost:5001/api/health

You should see a JSON response like:
```json
{
  "status": "OK",
  "message": "RECtify API is running",
  "database": "Connected"
}
```

### 5. Test Forgot Password Feature

1. Go to your frontend application
2. Click "Forgot Password"
3. Enter a registered email address
4. Click "Send Verification Code"
5. Check the backend console - you should see the verification code logged
6. Check your email for the code (if email is configured)

## How the Forgot Password Flow Works

1. **User enters email** → Frontend calls `/api/auth/forgot-password`
2. **Backend generates code** → Creates 6-character code and saves to database
3. **Backend sends email** → Attempts to send email with code
   - If Gmail SMTP is configured: Sends real email
   - If EmailJS is configured: Logs code to console (frontend sends email)
   - If nothing configured: Logs code to console (development mode)
4. **Backend returns code** → Sends code back to frontend
5. **Frontend sends email** → Uses EmailJS to send email (if configured)
6. **User enters code** → Frontend verifies code with backend
7. **User resets password** → Backend updates password in database

## Troubleshooting

### "Failed to send verification code"

This error means the frontend can't reach the backend API. Check:
- ✅ Backend server is running on port 5001
- ✅ No firewall blocking localhost:5001
- ✅ `VITE_API_URL` in frontend .env is correct

### Email not sending

If the code appears in the console but no email is sent:
- For Gmail SMTP: Check EMAIL_USER and EMAIL_PASS are correct
- For EmailJS: Configure frontend EmailJS variables in REC_Website/.env

### "User not found" or code doesn't work

- Make sure the email address exists in your database
- Run the seed script to create test users:
  ```powershell
  cd backend
  node scripts/seedUsers.js
  ```

### MongoDB connection issues

- Check your MONGODB_URI is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Test connection: `node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"`

## Quick Test (Development Mode)

For quick testing without email setup:

1. Start backend with minimal .env (no email config)
2. Try forgot password
3. Check backend console for the verification code
4. Copy the code from console
5. Enter it in the frontend

The code will be logged like:
```
📧 EMAIL SENT (Development Mode):
To: user@example.com
Subject: RECtify - Password Reset Request
Verification Code: ABC123
```

## Production Setup

For production, you MUST configure either:
- Gmail SMTP (recommended for reliability)
- EmailJS (good for client-side sending)
- Another SMTP service (SendGrid, Mailgun, etc.)

Never rely on development mode (console logging) in production!

