# RECtify Forgot Password - Setup Instructions

## 🔴 Critical Issues Found

Your forgot password feature is not working because:

1. ❌ **Backend dependencies are NOT installed**
2. ❌ **Backend environment variables are NOT configured**
3. ❌ **Backend server is NOT running**

## ✅ Quick Fix (5 Minutes)

### Step 1: Create Backend Environment File

Copy the development environment file:
```powershell
cd backend
Copy-Item .env.development .env
```

Or manually create `backend/.env` with these contents:
```env
MONGODB_URI=mongodb://localhost:27017/rectify
JWT_SECRET=generate-your-own-secure-jwt-secret-using-crypto-randomBytes
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2: Create Frontend Environment File

Copy the development environment file:
```powershell
cd ../REC_Website
Copy-Item .env.development .env
```

Or manually create `REC_Website/.env` with these contents:
```env
VITE_API_URL=http://localhost:5001/api
```

### Step 3: Install Backend Dependencies

```powershell
cd ../backend
npm install
```

This will take 1-2 minutes.

### Step 4: Start Backend Server

```powershell
npm start
```

You should see:
```
🚀 RECtify API server running on port 5001
🌍 Environment: development
📧 Using development mode - emails will be logged to console
```

**Keep this terminal window open!**

### Step 5: Test Forgot Password

1. Open your frontend at http://localhost:5173
2. Click **"Forgot Password"**
3. Enter any email address (e.g., `test@example.com`)
4. Click **"Send Verification Code"**
5. Check the **backend terminal window** for the code
6. You'll see something like:

```
📧 EMAIL SENT (Development Mode):
To: test@example.com
Verification Code: ABC123
```

7. Copy the code (e.g., `ABC123`)
8. Enter it in the frontend
9. Click **"Verify Code"**
10. Set your new password

## 🎯 Why It Wasn't Working

### Problem Analysis:

1. **Backend not running:** 
   - The frontend makes an API call to `http://localhost:5001/api/auth/forgot-password`
   - Without the backend running, this fails immediately
   - Error: "Failed to send verification code. Please try again."

2. **Dependencies not installed:**
   - Running `npm list express` showed "(empty)"
   - This means `npm install` was never run

3. **No environment configuration:**
   - No `.env` file in backend directory
   - Backend can't connect to MongoDB
   - Backend can't generate JWT tokens

## 🔧 Backend Setup (Detailed)

### Environment Variables Explained

**Required Variables:**

- `MONGODB_URI` - Your MongoDB connection string
  - Local: `mongodb://localhost:27017/rectify`
  - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/rectify`

- `JWT_SECRET` - Secret key for JWT tokens (min 32 chars)
  - Development: Any long string
  - Production: Use crypto-random string

- `PORT` - Server port (default 5001)

- `FRONTEND_URL` - Frontend URL for CORS
  - Development: `http://localhost:5173`
  - Production: Your deployed frontend URL

**Optional Variables (Email):**

- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASS` - Gmail App Password (not regular password)
- `EMAIL_FROM` - From address in emails

**Without email config:** Codes are logged to console (perfect for development!)

## 📧 Email Configuration (Optional)

### Option 1: Development Mode (No Configuration Needed)

✅ **This is the easiest option for testing!**

- No email credentials needed
- Verification codes appear in backend console
- Perfect for development and testing

### Option 2: Gmail SMTP (For Real Emails)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Create a new app password for "Mail"
   - Copy the 16-character password

3. Add to backend/.env:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=noreply@rectify.ae
```

4. Restart backend server

### Option 3: EmailJS (Frontend Sends Emails)

1. Create account at https://www.emailjs.com/
2. Create an email service
3. Create an email template
4. Get your credentials:
   - Service ID
   - Template ID
   - Public Key

5. Add to REC_Website/.env:
```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_1234567890
```

6. Restart frontend

## 🧪 Testing

### Test User Creation

Create test users:
```powershell
cd backend
node scripts/seedUsers.js
```

This creates:
- `trader@rectify.ae` / Demo2024!Secure
- `facility@rectify.ae` / Demo2024!Secure
- `compliance@rectify.ae` / Demo2024!Secure
- `admin@rectify.ae` / Demo2024!Secure

### Test Flow

1. **Request Code:**
   - Email: trader@rectify.ae
   - Click "Send Verification Code"
   - Check backend console for code

2. **Verify Code:**
   - Enter the 6-character code
   - Click "Verify Code"

3. **Reset Password:**
   - Enter new password
   - Click "Reset Password"

4. **Login:**
   - Use email and new password
   - Should successfully log in

## ❓ Troubleshooting

### "Failed to send verification code"

**Cause:** Backend is not running or not accessible

**Fix:**
1. Check if backend is running
2. Test: http://localhost:5001/api/health
3. Should return JSON with status "OK"
4. If not, check backend console for errors

### "MongoDB connection error"

**Cause:** MONGODB_URI is incorrect or MongoDB is not running

**Fix:**
- For local MongoDB: `MONGODB_URI=mongodb://localhost:27017/rectify`
- For Atlas: Use connection string from Atlas dashboard
- Whitelist your IP in Atlas Network Access

### Backend won't start

**Cause:** Dependencies not installed or environment variables missing

**Fix:**
```powershell
cd backend
npm install
# Check if .env exists
Get-Content .env
# If not, create it from .env.development
Copy-Item .env.development .env
```

### Port 5001 already in use

**Cause:** Another process is using port 5001

**Fix:**
```powershell
# Find process using port 5001
netstat -ano | findstr :5001
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### CORS errors

**Cause:** Frontend URL not allowed

**Fix:**
1. Check FRONTEND_URL in backend/.env
2. Should be: `http://localhost:5173`
3. Restart backend after changing

## 📝 Summary

The backend is **not properly set up**. To fix:

1. ✅ Copy `.env.development` to `.env` in backend directory
2. ✅ Run `npm install` in backend directory
3. ✅ Start backend with `npm start`
4. ✅ Test forgot password feature
5. ✅ Check backend console for verification codes

For real email sending (optional):
- Configure Gmail SMTP (recommended)
- Or configure EmailJS (alternative)

**The backend setup is working correctly in terms of the code** - it just needs to be running with proper configuration!

## 🚀 Quick Start Commands

Open PowerShell in the project root:

```powershell
# Setup backend
cd backend
Copy-Item .env.development .env
npm install

# Start backend (in this terminal)
npm start

# In a NEW terminal window, start frontend
cd REC_Website
npm run dev
```

Now test forgot password - codes will appear in the backend terminal!

## 📞 Need More Help?

Check these files for detailed guides:
- `FORGOT_PASSWORD_SETUP_GUIDE.md` - Complete setup guide
- `TEST_FORGOT_PASSWORD.md` - Testing procedures
- `backend/env.sample` - Environment variable reference
- `REC_Website/env.sample` - Frontend environment reference

