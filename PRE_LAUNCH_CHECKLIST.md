# Pre-Launch Checklist - RECtify Soft Launch

**Target Launch Date**: [To be determined]  
**Checklist Owner**: Technical Team  
**Last Updated**: October 10, 2025

---

## Overview

This checklist ensures all critical systems are validated before soft launch. Complete each section in order, checking off items as you go.

**DO NOT LAUNCH** until all "CRITICAL" items are complete and verified.

---

## Legend

- 🔴 **CRITICAL** - Must complete before launch
- 🟡 **IMPORTANT** - Should complete before launch
- 🟢 **NICE-TO-HAVE** - Can complete post-launch

---

## Section 1: Environment Configuration

### Backend Environment Variables (Railway)

🔴 **CRITICAL - Verify these are set correctly**:

```bash
# Database
- [ ] MONGODB_URI (Atlas connection string with correct credentials)
- [ ] Verified MongoDB Atlas IP whitelist includes Railway IPs

# Security
- [ ] JWT_SECRET (64+ character random string, NOT the dev one)
- [ ] Generate new: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Server Config
- [ ] PORT (Railway sets automatically, verify 5000 or assigned port)
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL=https://rectifygo.com

# Rate Limiting
- [ ] RATE_LIMIT_WINDOW_MS=900000 (15 minutes)
- [ ] RATE_LIMIT_MAX_REQUESTS=100

# Email (See EMAIL_PRODUCTION_SETUP.md)
- [ ] EMAIL_USER (your production email)
- [ ] EMAIL_PASS (app password or API key)
- [ ] EMAIL_FROM (noreply@rectifygo.com)

# Optional: Blockchain (See BLOCKCHAIN_DECISION.md)
- [ ] BLOCKCHAIN_NETWORK=disabled (recommended) OR
- [ ] BLOCKCHAIN_NETWORK=sepolia (if testing)
- [ ] INFURA_API_KEY (if using blockchain)
- [ ] INFURA_API_KEY_SECRET (if using blockchain)

# Optional: Monitoring (See MONITORING_SETUP.md)
- [ ] SENTRY_DSN (if using Sentry)
```

**Verification**:
```bash
# Check environment variables are set
curl https://rectify-production.up.railway.app/api/health

# Should return:
{
  "status": "OK",
  "environment": "production",
  "database": "connected",
  "timestamp": "..."
}
```

### Frontend Environment Variables (Netlify)

🔴 **CRITICAL - Verify these are set correctly**:

```bash
# API Configuration
- [ ] VITE_API_URL=https://rectify-production.up.railway.app/api

# App Configuration  
- [ ] VITE_APP_NAME=RECtify
- [ ] VITE_APP_VERSION=1.0.0
- [ ] VITE_NODE_ENV=production

# Optional: Monitoring
- [ ] VITE_SENTRY_DSN (if using Sentry)

# Optional: Analytics
- [ ] VITE_EMAILJS_SERVICE_ID (if using EmailJS for contact form)
- [ ] VITE_EMAILJS_TEMPLATE_ID
- [ ] VITE_EMAILJS_PUBLIC_KEY
```

**Verification**:
```bash
# Visit frontend
curl -I https://rectifygo.com
# Should return 200 OK

# Check it loads in browser
# Open https://rectifygo.com
# Verify it connects to backend API
```

---

## Section 2: Database Configuration

### MongoDB Atlas Setup

🔴 **CRITICAL**:
- [ ] Database created: `rectify` (or your chosen name)
- [ ] Collections created (will auto-create on first use):
  - users
  - rechholdings
  - orders
  - transactions
  - stripeevents (if using Stripe)

🔴 **Network Access**:
- [ ] IP whitelist configured
- [ ] Option A: Allow access from anywhere (0.0.0.0/0) - simpler
- [ ] Option B: Add specific Railway IPs - more secure
- [ ] Verify backend can connect

🔴 **Database User**:
- [ ] User created with strong password
- [ ] Role: "Read and write to any database" or "Atlas admin"
- [ ] Password does NOT contain special characters that break URI
- [ ] Connection string tested

🟡 **Backups**:
- [ ] Automated backups enabled (default: enabled on M10+)
- [ ] Free tier (M0): Manual backup process documented
- [ ] Backup frequency: Daily (minimum)
- [ ] Retention: 7 days (minimum)

🟡 **Monitoring**:
- [ ] Atlas alerts configured (see MONITORING_SETUP.md)
- [ ] Alert emails go to team
- [ ] Performance Advisor enabled

**Verification**:
```bash
# Test connection from Railway
# In Railway logs, look for:
"MongoDB connected successfully"
"Database: connected"

# Test from backend
curl https://rectify-production.up.railway.app/api/health
# Should show "database": "connected"
```

---

## Section 3: Security Verification

### SSL/TLS Certificates

🔴 **CRITICAL**:
- [ ] Frontend (Netlify) has valid SSL certificate
  - Visit: https://rectifygo.com
  - Check browser lock icon (should be green/secure)
- [ ] Backend (Railway) has valid SSL certificate
  - Visit: https://rectify-production.up.railway.app/api/health
  - Check browser lock icon

### CORS Configuration

🔴 **CRITICAL - Test CORS**:
```bash
# Test CORS from browser console on frontend
fetch('https://rectify-production.up.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)

# Should work without CORS errors
```

- [ ] FRONTEND_URL in backend matches actual frontend URL
- [ ] No CORS errors in browser console

### Security Headers

🟡 **IMPORTANT - Verify security headers**:
```bash
curl -I https://rectifygo.com

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Referrer-Policy: strict-origin-when-cross-origin
```

- [ ] CSP headers present
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set

### Rate Limiting

🟡 **IMPORTANT - Test rate limiting**:
```bash
# Make 101 requests quickly to same endpoint
for i in {1..101}; do
  curl https://rectify-production.up.railway.app/api/health
done

# Request 101 should return 429 (Too Many Requests)
```

- [ ] Rate limiting active
- [ ] Auth endpoints have stricter limits
- [ ] Error messages don't leak sensitive info

---

## Section 4: Authentication & Authorization

### Registration Flow

🔴 **CRITICAL - Test registration**:
```bash
curl -X POST https://rectify-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "company": "Test Co",
    "role": "trader",
    "emirate": "Dubai"
  }'
```

- [ ] Registration endpoint works
- [ ] Receives JWT token in response
- [ ] Password is hashed (check database)
- [ ] Weak passwords rejected
- [ ] Duplicate emails rejected
- [ ] Email validation works

### Login Flow

🔴 **CRITICAL - Test login**:
```bash
curl -X POST https://rectify-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

- [ ] Login endpoint works
- [ ] Returns JWT token
- [ ] Wrong password returns 401
- [ ] Account locks after 5 failed attempts

### Password Reset

🔴 **CRITICAL - Test password reset**:
```bash
curl -X POST https://rectify-production.up.railway.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

- [ ] Forgot password endpoint works
- [ ] Email is sent (check inbox or logs)
- [ ] Reset code is valid
- [ ] Reset code expires after 10 minutes
- [ ] Can set new password with valid code

### JWT Token Validation

🔴 **CRITICAL - Test protected endpoints**:
```bash
# Without token (should fail)
curl https://rectify-production.up.railway.app/api/auth/me

# With token (should succeed)
curl https://rectify-production.up.railway.app/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

- [ ] Protected endpoints require token
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected
- [ ] Token includes correct user ID

---

## Section 5: Trading Functionality

### Seed Demo Data

🟡 **IMPORTANT - Create test data**:
```bash
# SSH into Railway or run locally with production DB
cd backend
node scripts/seedDemoData.js
```

- [ ] Demo users created
- [ ] Demo holdings created
- [ ] Demo orders created
- [ ] Can login with demo accounts

### Order Placement

🔴 **CRITICAL - Test order creation**:

**Buy Order**:
```bash
curl -X POST https://rectify-production.up.railway.app/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "buy",
    "facilityName": "Solar Farm A",
    "energyType": "Solar",
    "quantity": 100,
    "price": 50,
    "vintage": 2024,
    "emirate": "Abu Dhabi"
  }'
```

- [ ] Can place buy order
- [ ] Funds are reserved
- [ ] Order appears in order book
- [ ] Insufficient balance rejected

**Sell Order**:
- [ ] Can place sell order
- [ ] RECs are reserved
- [ ] Order appears in order book
- [ ] Insufficient holdings rejected

### Order Matching

🔴 **CRITICAL - Test order matching**:

Create matching buy and sell orders from different accounts:
- [ ] Orders automatically match
- [ ] Transaction is created
- [ ] Buyer holdings updated
- [ ] Seller holdings updated
- [ ] Cash balances updated
- [ ] Fees calculated correctly
- [ ] Order status updates (filled/partial)

### Transaction History

🟡 **IMPORTANT**:
```bash
curl https://rectify-production.up.railway.app/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

- [ ] Can view transaction history
- [ ] Transactions show correct details
- [ ] Buyer and seller info present
- [ ] Timestamps accurate

---

## Section 6: Portfolio Management

### Holdings View

🔴 **CRITICAL**:
```bash
curl https://rectify-production.up.railway.app/api/holdings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

- [ ] Can view holdings
- [ ] Holdings show correct quantities
- [ ] Portfolio value calculated
- [ ] Can filter by energy type/emirate
- [ ] Empty portfolios handled gracefully

### Holdings Updates

🟡 **IMPORTANT**:
- [ ] Holdings update after buy
- [ ] Holdings decrease after sell
- [ ] Holdings correct after multiple trades
- [ ] No negative holdings possible
- [ ] Concurrent trades handled correctly

---

## Section 7: Payment Integration (If Using Stripe)

### Stripe Configuration

🟡 **IMPORTANT** (if using Stripe):
- [ ] Stripe account created
- [ ] API keys (secret and publishable) set
- [ ] Webhook endpoint configured
- [ ] Webhook secret set in environment
- [ ] Test mode vs production mode verified

### Payment Flow

🟡 **Test payment** (if using Stripe):
- [ ] Can initiate payment
- [ ] Stripe checkout loads
- [ ] Test card accepted (4242 4242 4242 4242)
- [ ] Balance updates after payment
- [ ] Webhook receives confirmation
- [ ] Failed payments handled

---

## Section 8: Email Delivery

### Email Service Configuration

🔴 **CRITICAL** (See EMAIL_PRODUCTION_SETUP.md):
- [ ] Email service configured (Gmail/SendGrid/SES)
- [ ] DNS records added (SPF, DKIM, DMARC)
- [ ] DNS propagated (wait 24-48 hours after adding)
- [ ] Service account or API key created
- [ ] Environment variables set

### Email Testing

🔴 **CRITICAL - Test all email types**:

**Password Reset**:
```bash
curl -X POST https://rectify-production.up.railway.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-real-email@example.com"}'
```

- [ ] Password reset email received
- [ ] Email NOT in spam folder
- [ ] Email formatting correct
- [ ] Links work correctly
- [ ] Reset code works

**Contact Form** (if implemented):
- [ ] Contact form submits
- [ ] Email received by support
- [ ] Reply-to address correct

### Email Deliverability

🟡 **IMPORTANT - Test deliverability**:
- [ ] Run mail-tester.com test (aim for 9/10 or 10/10)
- [ ] Test with Gmail account
- [ ] Test with Outlook account
- [ ] Test with Yahoo account (if relevant)
- [ ] Check not blacklisted: https://mxtoolbox.com/blacklists.aspx

---

## Section 9: Frontend Functionality

### Landing Page

🔴 **CRITICAL**:
- [ ] Landing page loads (https://rectifygo.com)
- [ ] All sections visible
- [ ] Images load correctly
- [ ] Contact form works
- [ ] "Enter Platform" button works
- [ ] Company information displayed
- [ ] Legal links visible

### Authentication UI

🔴 **CRITICAL**:
- [ ] Login form works
- [ ] Registration form works
- [ ] Forgot password works
- [ ] Error messages display
- [ ] Success messages display
- [ ] Validation works client-side

### Dashboard

🔴 **CRITICAL**:
- [ ] Dashboard loads after login
- [ ] Portfolio overview displays
- [ ] Market data visible
- [ ] Navigation works
- [ ] Can access all tabs

### Trading Interface

🔴 **CRITICAL**:
- [ ] Order book displays
- [ ] Can place buy orders
- [ ] Can place sell orders
- [ ] Can cancel orders
- [ ] Order status updates
- [ ] Real-time updates work (if applicable)

### Mobile Responsiveness

🟡 **IMPORTANT**:
- [ ] Site works on mobile (iPhone)
- [ ] Site works on mobile (Android)
- [ ] Site works on tablet
- [ ] Navigation accessible on mobile
- [ ] Forms usable on mobile

---

## Section 10: Monitoring & Alerting

### Error Tracking (Sentry)

🟡 **IMPORTANT** (See MONITORING_SETUP.md):
- [ ] Sentry integrated in backend
- [ ] Sentry integrated in frontend
- [ ] Test error captured in Sentry
- [ ] Alerts configured
- [ ] Team members invited
- [ ] Email notifications working

### Uptime Monitoring (Better Uptime)

🟡 **IMPORTANT**:
- [ ] Backend monitor configured
- [ ] Frontend monitor configured
- [ ] SSL monitor configured
- [ ] Alerts configured
- [ ] Status page created
- [ ] Test alert received

### Infrastructure Monitoring

🟡 **IMPORTANT**:
- [ ] Railway metrics visible
- [ ] MongoDB Atlas alerts configured
- [ ] Can view real-time logs
- [ ] Performance baseline established

---

## Section 11: Legal & Compliance

### Legal Documents

🔴 **CRITICAL**:
- [ ] Terms of Service live at /legal/terms-of-service.md
- [ ] Privacy Policy live at /legal/privacy-policy.md
- [ ] Trading Terms live at /legal/trading-terms.md
- [ ] Risk Disclaimer live at /legal/risk-disclaimer.md
- [ ] Documents linked in footer
- [ ] Documents reviewed by legal counsel (STRONGLY RECOMMENDED)

### Registration Acceptance

🟡 **IMPORTANT**:
- [ ] Users must accept ToS during registration
- [ ] Acceptance recorded in database
- [ ] Cannot proceed without acceptance
- [ ] Link to view terms before accepting

---

## Section 12: Performance & Load Testing

### Response Times

🟡 **IMPORTANT - Measure baselines**:
```bash
# Test API response times
time curl https://rectify-production.up.railway.app/api/health
# Should be < 500ms

# Test page load
# Use Chrome DevTools Network tab
# Landing page should load < 3 seconds
```

- [ ] API responds in < 500ms
- [ ] Frontend loads in < 3 seconds
- [ ] Database queries < 100ms
- [ ] No slow queries in MongoDB

### Load Testing

🟢 **NICE-TO-HAVE**:
```bash
# Install Artillery
npm install -g artillery

# Create test config artillery.yml
# Run load test
artillery run artillery.yml
```

- [ ] Can handle 50 concurrent users
- [ ] Can handle 100 requests/minute
- [ ] No errors under load
- [ ] Response times acceptable under load

---

## Section 13: Data & Backups

### Database Backup

🟡 **IMPORTANT**:
- [ ] Backup strategy documented
- [ ] Automated backups configured (Atlas)
- [ ] Manual backup tested
- [ ] Backup restoration tested
- [ ] Backup schedule: Daily minimum
- [ ] Retention: 7 days minimum

### Data Seeding

🟡 **IMPORTANT**:
- [ ] Demo data script works
- [ ] Can reset demo data
- [ ] Production data separate from demo
- [ ] Initial market data loaded (if applicable)

### Data Privacy

🔴 **CRITICAL**:
- [ ] Passwords are hashed (bcrypt)
- [ ] Sensitive data encrypted at rest
- [ ] TLS/SSL for data in transit
- [ ] No plaintext secrets in code
- [ ] API doesn't leak sensitive data

---

## Section 14: Documentation

### User Documentation

🟡 **IMPORTANT**:
- [ ] User onboarding guide created
- [ ] FAQ page created
- [ ] Help/support contact info visible
- [ ] Trading guide available
- [ ] Video tutorials (optional)

### Technical Documentation

🟡 **IMPORTANT**:
- [ ] README.md updated with production URLs
- [ ] Environment variables documented
- [ ] API documentation (if public)
- [ ] Deployment process documented
- [ ] Runbooks for common issues

### Support Processes

🟡 **IMPORTANT**:
- [ ] Support email monitored: support@rectifygo.com
- [ ] Expected response time communicated
- [ ] Escalation process defined
- [ ] FAQ covers common questions

---

## Section 15: Final Verification

### Pre-Launch Tests (48 hours before launch)

🔴 **CRITICAL - Complete end-to-end tests**:

**Test Scenario 1: New User Journey**
- [ ] Visit landing page
- [ ] Click "Enter Platform"
- [ ] Register new account
- [ ] Receive confirmation email (if applicable)
- [ ] Login
- [ ] View empty portfolio
- [ ] Navigate to trading
- [ ] View order book
- [ ] (Optional) Add funds
- [ ] Place buy order
- [ ] Verify order in order book
- [ ] Cancel order
- [ ] Logout

**Test Scenario 2: Trading Flow**
- [ ] Login as User A (seller)
- [ ] Verify has holdings
- [ ] Place sell order
- [ ] Logout
- [ ] Login as User B (buyer)
- [ ] Place matching buy order
- [ ] Verify transaction completes
- [ ] Check holdings updated
- [ ] Check balance updated
- [ ] View transaction history
- [ ] Logout

**Test Scenario 3: Password Reset**
- [ ] Click "Forgot Password"
- [ ] Enter email
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Set new password
- [ ] Login with new password
- [ ] Success

### Cross-Browser Testing

🟡 **IMPORTANT**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility

🟢 **NICE-TO-HAVE**:
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (basic)
- [ ] Color contrast sufficient
- [ ] Text scalable

---

## Section 16: Launch Day Preparation

### Communication Plan

🟡 **IMPORTANT**:
- [ ] Announcement email drafted
- [ ] Social media posts prepared
- [ ] Status page URL shared
- [ ] Support channels staffed

### Rollback Plan

🔴 **CRITICAL**:
- [ ] Can revert frontend deployment (Netlify)
- [ ] Can revert backend deployment (Railway)
- [ ] Database backup created before launch
- [ ] Rollback procedure documented
- [ ] Team knows how to rollback

### Launch Checklist

🔴 **ON LAUNCH DAY**:
- [ ] Final smoke test completed
- [ ] All team members available
- [ ] Monitoring dashboards open
- [ ] Alert channels confirmed working
- [ ] Status page set to "operational"
- [ ] Backup created immediately before launch

---

## Section 17: Post-Launch (First 24 Hours)

### Monitoring

🔴 **CRITICAL - Monitor closely**:
- [ ] Check Sentry for errors (every hour)
- [ ] Check Better Uptime (every hour)
- [ ] Review user registrations
- [ ] Review transactions
- [ ] Check email delivery rate
- [ ] Monitor response times
- [ ] Watch for anomalies

### Issue Response

🔴 **CRITICAL**:
- [ ] Team on standby for issues
- [ ] Response plan ready
- [ ] Communication templates ready
- [ ] Can deploy fixes quickly

---

## Section 18: Known Issues / Limitations

Document any known issues to manage expectations:

- [ ] List any features NOT included in soft launch
- [ ] List any known bugs (if non-critical)
- [ ] List any performance limitations
- [ ] List any capacity constraints

Example:
```
Known Limitations for Soft Launch:
- Blockchain recording disabled (will enable in Phase 2)
- Maximum 100 users during soft launch
- Email delivery may take up to 5 minutes
- Some reports may be slow with large portfolios
```

---

## Approval Sign-Off

**Before launch, obtain sign-off from:**

- [ ] **Technical Lead**: All technical items complete ✅
- [ ] **Security Review**: Security items verified ✅
- [ ] **Legal Review**: Legal documents reviewed ✅ (STRONGLY RECOMMENDED)
- [ ] **Business Owner**: Ready for launch ✅

**Signatures**:
- Technical Lead: _________________ Date: _______
- Business Owner: _________________ Date: _______

---

## Launch Decision

Based on this checklist:

**LAUNCH STATUS**: ⬜ GO / ⬜ NO-GO

**If NO-GO, blocking issues**:
1. _______________________________
2. _______________________________
3. _______________________________

**Target Resolution Date**: __________

---

## Post-Launch Checklist

After successful launch:

**Week 1**:
- [ ] Daily monitoring review
- [ ] Collect user feedback
- [ ] Document issues and resolutions
- [ ] Monitor key metrics

**Week 2-4**:
- [ ] Weekly retrospectives
- [ ] Prioritize feature requests
- [ ] Address critical bugs
- [ ] Plan next phase

---

**This checklist is comprehensive but not exhaustive. Use judgment and adapt as needed.**

**Questions? Issues? Contact technical team immediately.**

---

**Good luck with your launch! 🚀**

