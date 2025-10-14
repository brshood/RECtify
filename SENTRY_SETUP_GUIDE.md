# Sentry Setup for RECtify

## Why Sentry for Soft Launch

With 30-35% test coverage, Sentry is your **safety net** for production bugs:
- Real-time error alerts
- Performance monitoring
- User context (which user hit which bug)
- Stack traces for debugging

## Setup (30 minutes)

### Step 1: Create Sentry Account

1. Go to: https://sentry.io/signup/
2. Create free account (5,000 errors/month free)
3. Create new project: **RECtify Backend**
4. Copy your DSN (looks like: `https://abc123@o123.ingest.sentry.io/456`)

### Step 2: Install Backend SDK

```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

### Step 3: Configure Backend

**File**: `backend/server.js` (add at the TOP, before other imports)

```javascript
// Sentry must be imported first!
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  
  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,
  
  // Capture 100% of errors
  sampleRate: 1.0,
  
  // Profile 10% of transactions
  profilesSampleRate: 0.1,
  
  integrations: [
    new ProfilingIntegration(),
  ],
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove password from error logs
    if (event.request?.data) {
      delete event.request.data.password;
    }
    return event;
  },
});
```

**Add request handler** (after express.json(), before routes):

```javascript
// After: app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Your routes here...
```

**Add error handler** (at the END, after all routes):

```javascript
// After all routes, before app.listen()
app.use(Sentry.Handlers.errorHandler());

// Optional: Custom error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
```

### Step 4: Add Environment Variable

**Railway**:
1. Go to natural-prosperity → Settings → Variables
2. Add: `SENTRY_DSN` = `your-sentry-dsn-here`

**Local (.env)**:
```env
SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
```

### Step 5: Test Sentry

Add a test endpoint to verify it works:

```javascript
// backend/server.js
app.get('/debug-sentry', (req, res) => {
  throw new Error('Test Sentry error!');
});
```

Visit: `http://localhost:5000/debug-sentry`

Check Sentry dashboard - you should see the error!

**Remove this endpoint after testing.**

## Step 6: Set Up Alerts

In Sentry dashboard:
1. **Alerts** → **Create Alert**
2. **When**: Any error occurs
3. **Then**: Email you immediately
4. Create alerts for:
   - Any error in production
   - >10 errors per hour
   - 500 status codes
   - Slow API calls (>5 seconds)

## Frontend Setup (Optional - 15 mins)

```bash
cd REC_Website
npm install @sentry/react
```

**File**: `REC_Website/src/main.tsx`

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## What Sentry Will Catch

With 30% test coverage, Sentry fills the gaps:

**Untested Trading Engine Bugs**:
- Order matching failures
- REC transfer errors
- Fee calculation mistakes
- Race conditions

**Integration Issues**:
- Stripe webhook failures
- Email delivery problems
- MongoDB connection drops
- Railway deployment issues

**Production-Only Issues**:
- Memory leaks
- Slow database queries
- Third-party API failures
- Network timeouts

## Monitoring During Soft Launch

**Daily checks** (5 mins):
1. Sentry dashboard → Check for new errors
2. Fix critical bugs immediately
3. Add tests for bugs you find

**Weekly review** (30 mins):
1. Most common errors
2. Slowest API endpoints
3. User-facing issues
4. Plan fixes for next sprint

## Cost

- **Soft Launch (0-50 users)**: FREE (5,000 errors/month)
- **Growth (50-500 users)**: ~$26/month
- **Scale (500+ users)**: ~$80/month

## ROI

**Without Sentry**: 
- Bug reported by user → investigate → reproduce → fix = **4-8 hours**

**With Sentry**:
- Instant alert → see stack trace → fix = **30 mins - 2 hours**

**Time saved per bug**: 3-6 hours
**Critical bugs in first month**: 10-20 expected
**Total time saved**: 30-120 hours

**Verdict**: Sentry pays for itself in the first bug! 🎯

