[![Netlify Status](https://api.netlify.com/api/v1/badges/071fb70c-3178-4d09-8cd1-cf3b5feef18d/deploy-status)](https://app.netlify.com/projects/rectifygo/deploys)
[![Frontend CI](https://github.com/brshood/RECtify/actions/workflows/frontend.yml/badge.svg)](https://github.com/brshood/RECtify/actions/workflows/frontend.yml)
[![Backend CI](https://github.com/brshood/RECtify/actions/workflows/backend.yml/badge.svg)](https://github.com/brshood/RECtify/actions/workflows/backend.yml)
# RECtify

https://rectifygo.com/

RECtify is a full‑stack Renewable Energy Certificates (REC) trading platform with user‑specific portfolios, a shared network order book, and optional blockchain-backed audit trails for compliance. It includes a secure Node.js/Express backend with MongoDB Atlas and a modern Vite/React TypeScript frontend.

## Overview
- Purpose: Enable organizations to trade and manage RECs with transparent market visibility, user‑specific holdings, and auditable transactions.
- Architecture: Node.js/Express API + MongoDB (backend) and Vite/React TS (frontend).
- Key Features:
  - User portfolios and holdings with facility/vintage metadata
  - Public network order book with real‑time style updates and statistics
  - Automatic order matching and transaction recording
  - Market stats and price history
  - Strong security hardening (rate limiting, sanitization, headers, auth)
  - Optional blockchain recording for immutable audit trails (no payments)

## Repository Structure
```
RECtify/
├─ backend/            # Express API, models, routes, services, scripts
└─ REC_Website/        # Vite + React TypeScript frontend
```

## Backend Highlights (Express + MongoDB)
- Models: `User`, `RECHolding`, `Order`, `Transaction`
- Routes: `auth`, `users`, `holdings`, `orders`, `transactions`, `recSecurity`
- Services:
  - `RECTradingService.js`: secure trade execution, order matching, portfolio updates
  - `RECSecurityService.js`: blockchain recording and verification for audit/compliance (no payments)
- Security: input sanitization, NoSQL injection prevention, HPP, strict CSP and security headers, JWT auth, rate limiting, account lockout, error‑handling without sensitive leakage

## Frontend Highlights (Vite + React TS)
- Components: dashboard, trading interface, order book, portfolio overview, emissions reporting, charts
- Network trading UI: “Network Order Book”, live indicators, connectivity badges, status chips, statistics (active orders, buy/sell counts, participants, timestamps)
- API integration via `services/api.ts`

## Environment Setup
- Backend `.env` (copy from `backend/env.sample`):
```
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```
- Frontend `.env` (copy from `REC_Website/env.sample`):
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=RECtify
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

## Local Development
```bash
# Terminal 1
cd backend
npm install
npm start

# Terminal 2
cd REC_Website
npm install
npm run dev
```
- Backend: http://localhost:5000 (or 5001 if configured)
- Frontend: http://localhost:5173

## Deployment
- Backend (Railway): push to main, configure env vars (DB, JWT, CORS, rate limits), verify `GET /api/health`.
- Frontend (Netlify): base `REC_Website`, build `npm run build`, publish `REC_Website/dist`, set `VITE_API_URL` to the deployed backend.
- Post‑deploy: update `FRONTEND_URL` in backend env; verify login, order book, and API.

Quick commands:
```bash
# Deploy (both platforms auto from main)
git add . && git commit -m "Production deployment" && git push origin main
```

## Security Posture
- Input: `xss`, `express-mongo-sanitize`, request size limits, length caps, strict validation with `express-validator`
- Auth: bcrypt hashing, JWT (HS256, jti, 1h expiry), account lockout after 5 attempts
- DoS: general and auth rate limiting, enhanced rate limiting for orders (10/min) and payments (5/min), speed limiting
- Headers: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- CORS: allowlisted origins, secure cookies config
- DB: TLS, least‑privileged users, schema validation
- Errors/Logs: no sensitive data, hidden stack traces in production
- **Audit Trail**: All critical operations (order creation, payments, trades) logged to AuditLog collection with user, IP, timestamp, and metadata
- **Error Monitoring**: Sentry integration for real-time error tracking and performance monitoring (optional, configure with `SENTRY_DSN`)

Recommended production checks:
- HTTPS/TLS enforced by platform
- Secure secret management (Railway/Netlify env vars)
- **Sentry monitoring enabled** for production error tracking
- **Review audit logs** regularly for suspicious activity
- Monitoring and alerts for auth failures and traffic spikes
- Regular dependency updates and audits

## Trading System Details
- Public order book shared across users with live‑style updates
- Buy/sell placement, automatic matching by facility, energy type, vintage, emirate, and price
- Status tracking: active/partial/filled; participant visibility
- Transactions recorded with fees (platform/blockchain) and price history

## Optional Blockchain Audit (No Payments)
- Purpose: immutable audit trail for REC ownership and compliance (no crypto transfers)
- Network: local/dev nets, testnets (e.g., Sepolia), or mainnet
- Core capabilities: record/verify transactions, retrieve audit trail, switch network
- Env (if enabled):
```
BLOCKCHAIN_NETWORK=sepolia
INFURA_API_KEY=<key>
INFURA_API_KEY_SECRET=<secret>
BLOCKCHAIN_GAS_LIMIT=100000
BLOCKCHAIN_CONFIRMATION_TIMEOUT=300000
BLOCKCHAIN_PURPOSE=REC_SECURITY_AND_AUDIT
```

## Testing

### Automated Tests
```bash
# Backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

Test coverage includes:
- **Authentication** (registration, login, password reset, JWT validation, XSS sanitization)
- **Order Management** (buy/sell creation, matching, cancellation, validation, authorization)
- **Trading Engine** (complete trade execution, overselling prevention, insufficient balance checks, fee calculations, partial fills, price-time priority)
- **Payment Integration** (deposits, balance operations, currency handling, rate limiting, validation, webhook processing)
- **Security** (XSS protection, rate limiting, NoSQL injection prevention, JWT security, CORS)

**Test Statistics:**
- 📊 **72+ tests** covering critical paths
- 🎯 **~35% code coverage** (sufficient for soft launch, targeting 60-70% for production)
- ✅ **CI/CD integrated** - tests run automatically on every push
- 🔐 **Security-focused** - 12 dedicated security tests

**Test Categories:**
- Critical path tests for trading engine (10 tests)
- Payment integration tests (18 tests)
- Authentication & authorization tests (10 tests)
- Security edge case tests (12 tests)
- Order management tests (11 tests)

### Demo Data
```bash
# Seed sample users/holdings/orders
cd backend
node scripts/seedDemoData.js
```
- Try placing buy/sell orders from different demo users to observe order matching, portfolio updates, and transactions.

## EmailJS (Contact Form, frontend)
- Set in Netlify/`.env`:
```
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

## Contributing
- Branch, PR, lint and type‑check, add tests where applicable.
- Observe security and env handling guidelines.

## Team & Contributors

### Core Team
- **Dr. Khaled Al Samri** - Lead Developer & Project Architect
- **Rashed Al Neyadi** - Co-Founder & System Design
- Additional contributors involved in backend, frontend, and security hardening

### Development Tags
- 🔒 **Security Hardened** - Enterprise-grade security implementation
- 🧪 **Test Coverage** - Comprehensive test suite with automated CI/CD
- 📦 **Production Ready** - Deployment-ready with CI/CD
- 🌐 **Network Trading** - Real-time order book and matching
- ⚡ **High Performance** - Optimized for scalability
- 📋 **Soft Launch Ready** - All systems verified and operational

## License
- Proprietary. All rights reserved (update if license changes).
