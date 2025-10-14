# Quick Soft Launch Checklist

**For immediate soft launch with 5-10 beta users**

Status: **IN PROGRESS**  
Date: October 10, 2025

---

## ✅ **COMPLETED**

- [x] Backend deployed to Railway
- [x] Frontend deployed to Netlify
- [x] Database (MongoDB Atlas) configured
- [x] Email service set up on Railway
- [x] Legal documents drafted
- [x] Frontend manually tested
- [x] Dependencies installed
- [x] CI/CD pipelines active
- [x] Security hardening in place

---

## 🔴 **CRITICAL - Must Complete Before Launch**

### 1. Environment Variables

**Railway Backend** - Verify these are set:
```bash
□ MONGODB_URI (Atlas connection string)
□ JWT_SECRET (64+ character random string)
□ NODE_ENV=production
□ FRONTEND_URL=https://rectifygo.com
□ EMAIL_USER (your production email)
□ EMAIL_PASS (app password)
□ EMAIL_FROM=noreply@rectifygo.com
□ BLOCKCHAIN_NETWORK=disabled
```

**How to verify**: 
1. Go to Railway → Project → Backend Service → Variables
2. Check each variable is set
3. Click "Redeploy" if you made changes

---

### 2. Test Production Endpoints

**Backend Health Check**:
```bash
curl https://rectify-production.up.railway.app/api/health
```
Expected response:
```json
{
  "status": "OK",
  "environment": "production",
  "database": "connected",
  "timestamp": "..."
}
```

□ Backend health check returns 200 OK  
□ Database shows "connected"  
□ Environment shows "production"

**Frontend**:
```bash
curl -I https://rectifygo.com
```
□ Returns 200 OK  
□ Loads in browser  
□ No console errors

---

### 3. Test End-to-End User Flow

**Manual Testing**:

□ **Registration**:
  - Go to https://rectifygo.com
  - Click "Enter Platform"
  - Register new test account
  - Successful registration + JWT token received

□ **Login**:
  - Logout
  - Login with test account
  - Dashboard loads correctly

□ **Password Reset**:
  - Logout
  - Click "Forgot Password"
  - Enter email
  - Check email inbox (or Railway logs if dev mode)
  - Reset code received
  - Can set new password
  - Can login with new password

□ **Trading Flow**:
  - View order book
  - Place a buy order (will stay active)
  - View order in order book
  - Cancel order
  - Order removed from book

---

### 4. Legal Documents

□ Documents are accessible:
  - https://rectifygo.com/legal/terms-of-service.md
  - https://rectifygo.com/legal/privacy-policy.md
  - https://rectifygo.com/legal/trading-terms.md
  - https://rectifygo.com/legal/risk-disclaimer.md

□ Links visible in footer

**⚠️ CRITICAL**: 
□ Documents reviewed by UAE legal counsel (STRONGLY RECOMMENDED)
□ OR acknowledged that launching without legal review is risky

---

### 5. Database Backup

□ MongoDB Atlas automated backups enabled
□ Manual backup created before launch (export via Atlas UI)

**How**: 
- Go to MongoDB Atlas → Cluster → Backups
- Take snapshot manually

---

### 6. Monitoring Setup (Choose One)

**Option A: Manual Monitoring** (for soft launch):
□ Railway logs dashboard bookmarked
□ Can check logs in real-time
□ MongoDB Atlas alerts configured
□ Team available during launch

**Option B: Automated Monitoring** (better):
□ Sentry set up (see MONITORING_SETUP.md)
□ Better Uptime monitors configured
□ Alerts going to email/SMS

**For 5-10 users**: Option A is acceptable

---

### 7. Communication Plan

□ Beta user list prepared (5-10 people)
□ Launch announcement email drafted
□ Support email monitored: support@rectifygo.com
□ Team available for first 24 hours

---

## 🟡 **IMPORTANT - Should Complete**

### 8. Code Issues

□ Fix duplicate function in `routes/orders.js` (line 842)
  - Search for `executeTraditionalMatch`
  - Remove duplicate declaration
  - Redeploy

□ Update test setup.js (remove deprecated MongoDB options)

**Note**: These don't block launch if production code works, but fix soon.

---

### 9. Security Verification

□ Test rate limiting:
```bash
# Make 101 requests quickly
for ($i=1; $i -le 101; $i++) {
  Invoke-WebRequest -Uri "https://rectify-production.up.railway.app/api/health"
}
```
Request 101 should return 429 (Too Many Requests)

□ HTTPS working (green lock icon in browser)
□ CORS configured (no errors in browser console)

---

### 10. Data Seeding (Optional)

□ Demo data created (for testing):
```bash
# If needed
cd backend
node scripts/seedDemoData.js
```

---

## 🟢 **NICE-TO-HAVE - Can Wait**

- [ ] Sentry error tracking (set up in week 1)
- [ ] Load testing
- [ ] Arabic translations of legal docs
- [ ] Automated test suite fully passing
- [ ] In-house KYC implementation

---

## **GO / NO-GO Decision**

### Minimum Requirements for Soft Launch (5-10 users):

✅ Must Have:
- [x] Production backend working
- [x] Production frontend working
- [x] Database connected
- [x] Email working
- [ ] Environment variables verified
- [ ] End-to-end test passed
- [ ] Legal docs accessible
- [ ] Backup created
- [ ] Team available for monitoring

⚠️ Risks Acknowledged:
- [ ] No Sentry (monitoring manually)
- [ ] Legal docs not reviewed by counsel (accepted risk)
- [ ] Test suite has issues (production works)

---

## **Launch Decision**

**Status**: □ GO  /  □ NO-GO

**If GO**:
- Launch date/time: __________
- Number of beta users: __________
- Team on standby: __________

**If NO-GO**:
- Blocking issues: __________
- Resolution plan: __________

---

## **Post-Launch Actions (First 24 Hours)**

□ Monitor Railway logs every hour
□ Check for error patterns
□ Verify user registrations working
□ Respond to user feedback < 1 hour
□ Document any issues

---

## **Week 1 Post-Launch**

□ Set up Sentry monitoring
□ Fix code issues (duplicate function)
□ Get legal review of documents
□ Collect user feedback
□ Plan Phase 2 features

---

**Your Soft Launch is Ready!** ✅

**Recommendation**: 
1. Verify environment variables (5 min)
2. Test end-to-end flow (15 min)
3. Create database backup (5 min)
4. Launch to 3-5 trusted beta users
5. Monitor closely for 48 hours
6. Expand to 10-20 users week 2

**Questions?** Review the detailed guides or contact technical team.

