# Security Credentials Management Guide

## Overview

This guide documents proper credential management practices for the RECtify platform. Following these guidelines will help prevent security breaches and maintain the integrity of our systems.

---

## 🔐 Credential Types

### 1. API Keys (External Services)

#### Infura (Blockchain Access)
- **Environment Variables**: `INFURA_API_KEY`, `INFURA_API_KEY_SECRET`
- **Rotation Schedule**: Every 180 days
- **Access Level**: Backend only
- **Risk Level**: HIGH - Controls blockchain access

#### Sentry (Error Monitoring)
- **Environment Variables**: `SENTRY_DSN`, `VITE_SENTRY_DSN`
- **Rotation Schedule**: Every 180 days (or immediately if compromised)
- **Access Level**: Backend + Frontend
- **Risk Level**: MEDIUM - Can spam errors but cannot access data

#### Email Service
- **Environment Variables**: `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- **Rotation Schedule**: Every 180 days
- **Access Level**: Backend only
- **Risk Level**: MEDIUM - Can send emails on your behalf

### 2. Internal Secrets

#### JWT Secret
- **Environment Variable**: `JWT_SECRET`
- **Rotation Schedule**: Every 90 days
- **Access Level**: Backend only
- **Risk Level**: CRITICAL - Controls all user authentication

#### Database Credentials
- **Environment Variable**: `MONGODB_URI`
- **Rotation Schedule**: Every 90 days
- **Access Level**: Backend only
- **Risk Level**: CRITICAL - Full access to all data

---

## 🔄 Credential Rotation Procedures

### JWT Secret Rotation (Every 90 Days)

**Step 1: Generate New Secret**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Step 2: Update Environment Variables**
```bash
# Railway Dashboard
JWT_SECRET=<new_secret_here>

# Local .env files
backend/.env: JWT_SECRET=<new_secret_here>
```

**Step 3: Graceful Migration (Optional for Zero Downtime)**
- Add `JWT_SECRET_PREVIOUS` with old secret
- Accept tokens signed with either secret for 24 hours
- Remove `JWT_SECRET_PREVIOUS` after grace period

**Step 4: Notify Users**
- Users will need to re-login after secret changes
- Plan rotation during low-traffic periods

### Infura API Key Rotation (Every 180 Days)

**Step 1: Generate New Key**
1. Log into https://infura.io/dashboard
2. Go to your project
3. Click "Create New Key"
4. Copy new API Key and Secret

**Step 2: Update Environment Variables**
```bash
# Railway Dashboard
INFURA_API_KEY=<new_key>
INFURA_API_KEY_SECRET=<new_secret>

# Local .env files
backend/.env: Update both values
```

**Step 3: Deploy and Test**
1. Deploy to Railway
2. Test blockchain connectivity
3. Monitor for errors

**Step 4: Revoke Old Key**
1. Go back to Infura dashboard
2. Delete the old key
3. Verify production still works

### Sentry DSN Rotation (As Needed)

**Step 1: Generate New DSN**
1. Log into https://sentry.io
2. Go to Project Settings → Client Keys (DSN)
3. Click "Create New Key"
4. Copy new DSN

**Step 2: Update Environment Variables**
```bash
# Railway Dashboard
SENTRY_DSN=<new_dsn>
VITE_SENTRY_DSN=<new_dsn>

# Local .env files
backend/.env: SENTRY_DSN=<new_dsn>
REC_Website/.env: VITE_SENTRY_DSN=<new_dsn>
```

**Step 3: Deploy and Test**
1. Deploy to Railway
2. Trigger a test error
3. Verify it appears in Sentry

**Step 4: Revoke Old DSN**
1. Go back to Sentry project
2. Delete old Client Key
3. Verify production still reports errors

---

## 🚨 Emergency Rotation (Credential Compromise)

If you suspect a credential has been compromised:

### Immediate Actions (Within 1 Hour)

1. **Revoke the compromised credential immediately**
   - Don't wait to generate a replacement
   - Revoke first, fix later

2. **Generate new credential**
   - Follow standard rotation procedure
   - Use strong, random values

3. **Update all environments**
   - Production (Railway)
   - Local development
   - Team members

4. **Monitor for abuse**
   - Check service logs for unusual activity
   - Review recent transactions
   - Look for unauthorized access

### Post-Incident Actions (Within 24 Hours)

1. **Audit git history**
   - Search for exposed credentials
   - Consider git history rewrite if necessary

2. **Review access logs**
   - Identify if credential was used by attacker
   - Document any unauthorized activity

3. **Update security procedures**
   - Add pre-commit hooks
   - Implement secret scanning
   - Train team on secure practices

4. **Notify stakeholders**
   - Inform team of the incident
   - Update security documentation
   - Plan preventive measures

---

## 📋 Credential Rotation Schedule

| Credential | Rotation Frequency | Last Rotated | Next Rotation Due |
|------------|-------------------|--------------|-------------------|
| JWT Secret | 90 days | [Date] | [Date + 90] |
| Infura API Key | 180 days | [Date] | [Date + 180] |
| Sentry DSN | 180 days or as needed | [Date] | [Date + 180] |
| Database Password | 90 days | [Date] | [Date + 90] |
| Email Service | 180 days | [Date] | [Date + 180] |

**Note:** Update the "Last Rotated" column every time you rotate a credential.

---

## ✅ Security Best Practices

### Do's

✅ **Always use environment variables** for secrets
✅ **Never commit credentials** to git
✅ **Use .env files** for local development
✅ **Rotate credentials regularly** according to schedule
✅ **Use strong, random secrets** (64+ characters)
✅ **Document rotation dates** in this guide
✅ **Test after rotation** to ensure everything works
✅ **Monitor for unauthorized use** after rotation

### Don'ts

❌ **Never hardcode credentials** in source code
❌ **Never commit .env files** to git
❌ **Never share credentials** via email or chat
❌ **Never use the same credential** across environments
❌ **Never skip rotation** because "it's working fine"
❌ **Never leave old credentials active** after rotation
❌ **Never store credentials** in documentation
❌ **Never log credentials** to console or files

---

## 🔍 Credential Audit Checklist

Use this checklist quarterly to audit credential security:

### Code Audit
- [ ] No hardcoded credentials in source code
- [ ] No credentials in documentation files
- [ ] No credentials in git commit history
- [ ] All credentials use environment variables
- [ ] .env files are properly gitignored

### Environment Audit
- [ ] Production credentials different from development
- [ ] All team members have separate credentials
- [ ] Unused credentials have been revoked
- [ ] Railway environment variables are up to date
- [ ] Local .env files match documentation

### Rotation Audit
- [ ] JWT secret rotated within 90 days
- [ ] Infura keys rotated within 180 days
- [ ] Database password rotated within 90 days
- [ ] Sentry DSN checked for compromises
- [ ] Email credentials rotated within 180 days

### Access Audit
- [ ] Review who has access to Railway dashboard
- [ ] Review who has access to Infura account
- [ ] Review who has access to Sentry account
- [ ] Review who has access to database
- [ ] Remove access for departed team members

---

## 🛠️ Tools and Resources

### Credential Generation
```bash
# Generate JWT Secret (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate random password (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Secret Scanning Tools
- **git-secrets**: Scan repository for secrets
- **TruffleHog**: Find secrets in git history
- **GitHub Secret Scanning**: Automatic detection (if using GitHub)

### Pre-commit Hook Setup
```bash
# Install git-secrets
npm install -g git-secrets

# Initialize in repository
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'INFURA_API_KEY=.*'
git secrets --add 'JWT_SECRET=.*'
git secrets --add 'mongodb\+srv://.*'
```

---

## 📞 Incident Response Contacts

### In Case of Security Breach

1. **Technical Team Lead**: [Contact]
2. **Security Officer**: [Contact]
3. **Platform Owner**: [Contact]

### Service Provider Support

- **Infura Support**: https://infura.io/support
- **Sentry Support**: https://sentry.io/support
- **Railway Support**: https://railway.app/help
- **MongoDB Atlas Support**: https://www.mongodb.com/support

---

## 📝 Change Log

Document all credential rotations here:

| Date | Credential | Reason | Performed By |
|------|------------|--------|--------------|
| [YYYY-MM-DD] | JWT Secret | Scheduled rotation | [Name] |
| [YYYY-MM-DD] | Infura API Key | Emergency - exposed in repo | [Name] |
| [YYYY-MM-DD] | Sentry DSN | Scheduled rotation | [Name] |

---

## 🎯 Quick Reference

### Environment Variables Checklist

**Backend (.env)**
```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64+ character hex string>
INFURA_API_KEY=<32 character hex string>
INFURA_API_KEY_SECRET=<base64 string>
SENTRY_DSN=https://...@sentry.io/...
EMAIL_USER=<email address>
EMAIL_PASS=<app password>
EMAIL_FROM=<from email>
```

**Frontend (.env)**
```bash
VITE_API_URL=<backend URL>
VITE_SENTRY_DSN=https://...@sentry.io/...
```

**Railway Environment Variables**
- All backend variables above
- VITE_SENTRY_DSN for frontend builds

---

**Last Updated**: [Current Date]  
**Document Owner**: Security Team  
**Review Schedule**: Quarterly


