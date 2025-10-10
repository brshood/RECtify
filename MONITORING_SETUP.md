# Monitoring and Alerting Setup Guide

**Purpose**: Establish comprehensive monitoring and alerting for RECtify production deployment

---

## Overview

Production monitoring is essential for:
- Detecting issues before users report them
- Understanding system health and performance
- Tracking errors and their frequency
- Measuring uptime and response times
- Planning capacity and scaling

---

## Monitoring Stack Recommendation

### Quick Start (Free Tier)
1. **Sentry** - Error tracking
2. **Railway Metrics** - Infrastructure monitoring
3. **Better Uptime** - Uptime monitoring
4. **MongoDB Atlas** - Database monitoring

### Advanced (Paid)
1. **Datadog** or **New Relic** - Full observability
2. **PagerDuty** - Incident management
3. **LogDNA/Logtail** - Log aggregation

---

## 1. Error Tracking with Sentry

### Why Sentry?
- ✅ Real-time error tracking
- ✅ Stack traces and context
- ✅ Performance monitoring
- ✅ Free tier: 5K errors/month
- ✅ Easy integration

### Setup Steps

#### 1. Create Sentry Account
- Go to https://sentry.io/signup/
- Choose "Node.js" for backend, "React" for frontend
- Create organization: `RECtify`
- Create two projects:
  - `rectify-backend`
  - `rectify-frontend`

#### 2. Backend Integration

Install Sentry SDK:
```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

Create `backend/utils/sentry.js`:
```javascript
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

function initSentry(app) {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        // HTTP request tracking
        new Sentry.Integrations.Http({ tracing: true }),
        // Express integration
        new Sentry.Integrations.Express({ app }),
        // Performance profiling
        new ProfilingIntegration(),
      ],
      // Performance sampling
      tracesSampleRate: 0.1, // 10% of transactions
      profilesSampleRate: 0.1,
      
      // Filter sensitive data
      beforeSend(event) {
        // Remove sensitive data from errors
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers['authorization'];
          }
        }
        return event;
      },
    });
    
    console.log('✅ Sentry error tracking initialized');
  }
}

module.exports = { initSentry, Sentry };
```

Update `backend/server.js`:
```javascript
const { initSentry, Sentry } = require('./utils/sentry');

// ... after app creation
initSentry(app);

// Request handler must be first middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your routes ...

// Error handler must be after routes
app.use(Sentry.Handlers.errorHandler());
```

#### 3. Frontend Integration

Install Sentry:
```bash
cd REC_Website
npm install @sentry/react @sentry/browser
```

Update `REC_Website/src/main.tsx`:
```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_NODE_ENV || 'development',
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', import.meta.env.VITE_API_URL],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

#### 4. Environment Variables

**Railway (Backend)**:
```env
SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
NODE_ENV=production
```

**Netlify (Frontend)**:
```env
VITE_SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
VITE_NODE_ENV=production
```

#### 5. Configure Alerts

In Sentry dashboard:
- Go to Alerts → Create Alert Rule
- **Alert 1: High Error Rate**
  - Condition: Error count > 50 in 1 hour
  - Action: Email team
- **Alert 2: New Issue**
  - Condition: First seen error
  - Action: Slack notification (if configured)
- **Alert 3: Spike Detection**
  - Condition: 200% increase in errors
  - Action: Email + SMS

---

## 2. Infrastructure Monitoring with Railway

### Railway Built-in Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Deployment status

### Setup

#### 1. Enable Metrics
- Already enabled by default in Railway
- View in: Project → Service → Metrics tab

#### 2. Set Up Alerts

Railway doesn't have built-in alerting, so use **Better Uptime** for this.

---

## 3. Uptime Monitoring with Better Uptime

### Why Better Uptime?
- ✅ Free tier: 10 monitors
- ✅ 30-second check interval
- ✅ Status page included
- ✅ SMS/Email/Slack alerts
- ✅ SSL certificate monitoring

### Setup Steps

#### 1. Create Account
- Go to https://betteruptime.com
- Sign up for free account
- Create team: `RECtify`

#### 2. Create Monitors

**Monitor 1: Backend Health Check**
- Type: HTTP(S)
- URL: `https://rectify-production.up.railway.app/api/health`
- Name: `RECtify Backend`
- Check frequency: 30 seconds
- Expected HTTP status: 200
- Alert after: 1 failed check

**Monitor 2: Frontend**
- URL: `https://rectifygo.com`
- Name: `RECtify Frontend`
- Check frequency: 30 seconds
- Expected HTTP status: 200
- Check content: Contains "RECtify"

**Monitor 3: Database Connection** (via backend)
- URL: `https://rectify-production.up.railway.app/api/health`
- Check response: Contains `"database":"connected"`

**Monitor 4: SSL Certificate**
- URL: `https://rectifygo.com`
- SSL monitoring: Enabled
- Alert before expiry: 30 days

#### 3. Configure Notifications

- Email: Primary contact
- SMS: For critical alerts (requires paid plan)
- Slack: Create webhook if using Slack

#### 4. Create Status Page

- Go to Status Pages → Create
- Name: `RECtify Status`
- URL: `status.rectifygo.com` (configure CNAME)
- Add all monitors
- Customize branding

#### 5. DNS Configuration

Add CNAME record:
```
CNAME  status.rectifygo.com  →  [betteruptime-provided-value]
```

---

## 4. Database Monitoring with MongoDB Atlas

### Setup Steps

#### 1. Enable Alerts

In MongoDB Atlas:
- Go to Alerts → Alert Settings
- **Alert 1: Connections**
  - Metric: Connections
  - Condition: > 80% of max connections
  - Action: Email
- **Alert 2: Disk Usage**
  - Metric: Disk usage
  - Condition: > 80%
  - Action: Email
- **Alert 3: Replication Lag**
  - Metric: Replication lag
  - Condition: > 10 seconds
  - Action: Email

#### 2. Enable Performance Advisor
- Automatically suggests indexes
- Identifies slow queries
- Review weekly

#### 3. Enable Real-Time Performance Panel
- Monitor query performance
- View active connections
- Track operation times

---

## 5. Log Aggregation (Optional but Recommended)

### Option A: Railway Logs
- Built-in log viewing
- Limited search and filtering
- No long-term retention

### Option B: Logtail (Recommended)

**Setup**:
1. Sign up at https://betterstack.com/logtail
2. Create log source
3. Get source token
4. Add to Railway:
```env
LOGTAIL_SOURCE_TOKEN=xxxxx
```
5. Install Winston + Logtail transport:
```bash
npm install winston @logtail/node @logtail/winston
```

6. Configure logging in backend:
```javascript
const winston = require('winston');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new LogtailTransport(logtail),
  ],
});

module.exports = logger;
```

---

## 6. Performance Monitoring

### Backend Performance

**Key Metrics to Track**:
- Response time (p50, p95, p99)
- Requests per minute
- Error rate
- Database query time
- External API latency

**Tools**:
- **Sentry Performance**: Already configured
- **Express monitoring**: Use `express-status-monitor`

Install:
```bash
npm install express-status-monitor
```

Add to `server.js`:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(require('express-status-monitor')({
    path: '/api/internal/status',
    // Require authentication for this endpoint
  }));
}
```

### Frontend Performance

**Key Metrics**:
- Page load time
- Time to interactive
- Core Web Vitals (LCP, FID, CLS)
- API request latency

**Tools**:
- **Sentry Performance**: Already configured
- **Google Analytics 4**: Optional for user analytics

---

## 7. Security Monitoring

### Failed Login Attempts

Add monitoring in `backend/routes/auth.js`:
```javascript
const logger = require('../utils/logger');

// On failed login
logger.warn('Failed login attempt', {
  email: email,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

// Alert if >10 failed attempts in 5 minutes from same IP
```

### API Rate Limiting

Monitor rate limit hits:
```javascript
// In rate limiting middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode === 429) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        endpoint: req.path
      });
    }
  });
  next();
});
```

---

## 8. Business Metrics Dashboard

### Key Business Metrics

Track these in your own dashboard:
- New user registrations (daily/weekly)
- Active users
- Total trading volume (AED)
- Number of transactions
- Average transaction size
- Order book depth
- User retention rate

### Implementation Options

**Option A: Custom Dashboard**
- Build with React + Recharts
- Data from MongoDB aggregations
- Admin-only access

**Option B: External Tool**
- Metabase (open source)
- Grafana + TimescaleDB
- Tableau

---

## 9. Alert Priority Matrix

### Critical (Immediate Response)
- 🚨 Backend completely down (5+ minutes)
- 🚨 Database unavailable
- 🚨 Security breach detected
- 🚨 Data corruption

**Response Time**: <5 minutes  
**Notification**: SMS + Email + Phone

### High (Urgent Response)
- ⚠️ Error rate >5%
- ⚠️ Response time >5 seconds
- ⚠️ 50% service degradation
- ⚠️ Payment processing failures

**Response Time**: <15 minutes  
**Notification**: SMS + Email

### Medium (Important)
- ℹ️ Error rate >1%
- ℹ️ Response time >2 seconds
- ℹ️ SSL certificate expiring <30 days
- ℹ️ Disk usage >80%

**Response Time**: <1 hour  
**Notification**: Email

### Low (Monitoring)
- 📊 New error type detected
- 📊 Unusual traffic patterns
- 📊 Performance degradation
- 📊 Security scan findings

**Response Time**: <24 hours  
**Notification**: Email digest

---

## 10. Incident Response Plan

### When Alert Fires

**Step 1: Acknowledge** (< 2 minutes)
- Acknowledge alert in monitoring tool
- Prevents alert fatigue
- Shows someone is responding

**Step 2: Assess** (< 5 minutes)
- Check Sentry for recent errors
- Review Railway logs
- Check Better Uptime dashboard
- Determine severity

**Step 3: Communicate** (if user-facing)
- Update status page
- Post on social media (if major)
- Email affected users (if needed)

**Step 4: Resolve**
- Fix issue
- Deploy fix
- Monitor for recurrence

**Step 5: Post-Mortem** (within 48 hours)
- Document what happened
- Root cause analysis
- Preventive measures
- Update runbooks

---

## 11. Monitoring Checklist

### Initial Setup
- [ ] Sentry account created
- [ ] Sentry integrated in backend
- [ ] Sentry integrated in frontend
- [ ] Better Uptime monitors configured
- [ ] Status page created
- [ ] MongoDB Atlas alerts enabled
- [ ] Railway metrics reviewed
- [ ] Alert recipients configured

### Testing
- [ ] Trigger test error in backend (verify Sentry catches it)
- [ ] Trigger test error in frontend (verify Sentry catches it)
- [ ] Stop backend temporarily (verify uptime alert fires)
- [ ] Test email delivery for alerts
- [ ] Verify status page updates correctly

### Documentation
- [ ] Alert priority matrix documented
- [ ] Incident response plan created
- [ ] Escalation contacts listed
- [ ] Runbooks for common issues created

### Ongoing
- [ ] Review Sentry errors daily
- [ ] Check uptime dashboard weekly
- [ ] Review performance metrics weekly
- [ ] Update alert thresholds as needed
- [ ] Conduct monthly post-mortem reviews

---

## 12. Monitoring Costs

### Free Tier Totals
- Sentry: Free (5K errors/month)
- Better Uptime: Free (10 monitors)
- MongoDB Atlas: Free (basic alerts)
- Railway: Included with hosting
- **Total: $0/month**

### Paid Tiers (When Needed)
- Sentry Team: $26/month (100K errors)
- Better Uptime Pro: $25/month (50 monitors, SMS alerts)
- Logtail: $10/month (basic plan)
- **Total: ~$60/month**

---

## 13. Key Performance Indicators (KPIs)

Track these metrics weekly:

### Reliability
- **Uptime**: Target >99.5%
- **Mean Time to Detect (MTTD)**: <5 minutes
- **Mean Time to Resolve (MTTR)**: <30 minutes
- **Error Rate**: <0.5%

### Performance
- **API Response Time**: <500ms (p95)
- **Page Load Time**: <3 seconds
- **Database Query Time**: <100ms (p95)

### Security
- **Failed Login Rate**: <5%
- **Rate Limit Hits**: <1% of requests
- **Security Alerts**: 0 per week

---

## 14. Recommended Dashboard Layout

Create a single dashboard view with:

**Row 1: System Health**
- Backend Status (green/red)
- Frontend Status (green/red)
- Database Status (green/red)
- Uptime % (30 days)

**Row 2: Performance**
- API Response Time (line chart)
- Error Rate (line chart)
- Active Users (current)
- Requests/min (current)

**Row 3: Business Metrics**
- Transactions Today
- Trading Volume (AED) Today
- New Users Today
- Active Orders

**Row 4: Recent Alerts**
- Last 10 alerts with timestamps
- Alert type and severity

---

## 15. Contact Information

**Monitoring Tools Support**:
- Sentry: https://sentry.io/support
- Better Uptime: support@betteruptime.com
- MongoDB Atlas: https://support.mongodb.com

**Emergency Escalation**:
1. Technical Lead: [Your contact]
2. CTO/Technical Co-founder: [Contact]
3. On-call rotation (set up after launch)

---

**Setup Time Estimate**: 3-4 hours

**Priority**: HIGH - Set up before soft launch

**Next Steps**:
1. Complete setup following this guide
2. Test all alerts
3. Document custom runbooks
4. Train team on alert response
5. Schedule weekly monitoring reviews

