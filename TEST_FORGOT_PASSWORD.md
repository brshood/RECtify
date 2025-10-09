# Testing Forgot Password Feature

## Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies
```powershell
cd backend
npm install
```

### Step 2: Start Backend Server
```powershell
npm start
```

**Expected output:**
```
🚀 RECtify API server running on port 5001
🌍 Environment: development
📧 Using development mode - emails will be logged to console
✅ Connected to MongoDB Atlas
```

### Step 3: Test the Feature

1. **Open your frontend** (http://localhost:5173)
2. **Click "Forgot Password"**
3. **Enter your email** (use a test email like: `test@example.com`)
4. **Click "Send Verification Code"**

### Step 4: Get the Code

**Without email configuration (Development Mode):**
- The verification code will appear in the **backend console/terminal**
- Look for output like:
  ```
  📧 EMAIL SENT (Development Mode):
  To: test@example.com
  Verification Code: ABC123
  ```
- Copy the 6-character code

**With email configuration (Production Mode):**
- Check your email inbox for the verification code
- The email will be from "noreply@rectify.ae"
- Subject: "RECtify - Password Reset Request"

### Step 5: Verify and Reset

1. **Enter the code** in the frontend (e.g., `ABC123`)
2. **Click "Verify Code"**
3. **Enter your new password**
4. **Click "Reset Password"**
5. **Login with your new password**

## Troubleshooting

### ❌ "Failed to send verification code"

**Cause:** Frontend can't connect to backend

**Solutions:**
1. Check if backend is running: http://localhost:5001/api/health
2. Check backend console for errors
3. Verify VITE_API_URL in REC_Website/.env is set to `http://localhost:5001/api`
4. Restart both frontend and backend

### ❌ "Invalid or expired verification code"

**Cause:** Code expired (10 minute timeout) or wrong code

**Solutions:**
1. Click "Resend Code" to get a new code
2. Make sure you're copying the latest code from console
3. Codes are case-insensitive but must match exactly
4. Check backend console for the actual code being generated

### ❌ Backend won't start

**Cause:** MongoDB connection issue

**Solutions:**
1. Check MONGODB_URI in backend/.env
2. Ensure MongoDB Atlas IP whitelist includes your IP
3. Test with local MongoDB: `MONGODB_URI=mongodb://localhost:27017/rectify`
4. Check MongoDB Atlas credentials are correct

### ❌ Email not arriving

**Cause:** Email service not configured or misconfigured

**Solutions:**
1. **Development Mode:** Check backend console - code is logged there
2. **Gmail SMTP:** 
   - Verify EMAIL_USER is your Gmail address
   - Verify EMAIL_PASS is an App Password (not your regular password)
   - Enable 2FA on Gmail: https://myaccount.google.com/security
   - Create App Password: https://myaccount.google.com/apppasswords
3. **EmailJS:**
   - Check frontend .env has correct EmailJS credentials
   - Verify EmailJS template is set up correctly
   - Check EmailJS dashboard for failed sends

## Backend States

### Development Mode (No Email Config)
```
📧 Using development mode - emails will be logged to console
```
- ✅ Perfect for testing
- ✅ No email setup needed
- ✅ Codes appear in backend console
- ❌ No actual emails sent

### Gmail SMTP Mode
```
📧 Using real Gmail SMTP for email delivery
```
- ✅ Real emails sent
- ✅ Reliable delivery
- ⚠️ Requires Gmail App Password
- ⚠️ Requires 2FA enabled

### EmailJS Mode
```
📧 Using EmailJS for email delivery (frontend integration)
```
- ✅ No backend SMTP needed
- ✅ Frontend sends emails
- ⚠️ Requires EmailJS account
- ⚠️ Requires both backend and frontend config

## Creating Test Users

If you need test users:

```powershell
cd backend
node scripts/seedUsers.js
```

This creates several test users:
- trader@rectify.ae
- facility@rectify.ae
- compliance@rectify.ae
- admin@rectify.ae

All with password: `password123`

## Expected Backend Logs (Development Mode)

```
🚀 RECtify API server running on port 5001
🌍 Environment: development
📧 Using development mode - emails will be logged to console
✅ Connected to MongoDB Atlas

[User clicks "Forgot Password" and enters email]

📧 EMAIL SENT (Development Mode):
To: test@example.com
Subject: RECtify - Password Reset Request
Verification Code: A3X9K2
Reset URL: http://localhost:5173/reset-password?token=a3x9k2...
📧 End of Email

[User enters code and verifies]

✅ Code verified successfully for test@example.com

[User resets password]

✅ Password reset successfully for test@example.com
```

## Testing Checklist

- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend .env file created and configured
- [ ] Backend server running (http://localhost:5001)
- [ ] Frontend running (http://localhost:5173)
- [ ] Frontend .env has correct VITE_API_URL
- [ ] Test user exists in database
- [ ] Can see "Forgot Password" link
- [ ] Can submit email address
- [ ] Verification code appears in backend console
- [ ] Can enter and verify code
- [ ] Can set new password
- [ ] Can login with new password

## Common Issues

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution:** Kill the process using port 5001
```powershell
netstat -ano | findstr :5001
taskkill /PID <process_id> /F
```

### MongoDB Connection Timeout
```
MongoServerError: bad auth
```

**Solution:** Check MONGODB_URI credentials are correct

### CORS Errors in Browser Console
```
Access to fetch at 'http://localhost:5001/api/auth/forgot-password' from origin 'http://localhost:5173' has been blocked by CORS
```

**Solution:** 
1. Check FRONTEND_URL in backend/.env is set to `http://localhost:5173`
2. Restart backend server after changing .env

## Need Help?

1. Check backend console for detailed error messages
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Try restarting both frontend and backend
5. Check the FORGOT_PASSWORD_SETUP_GUIDE.md for detailed setup instructions

