# 🚀 Quick Deploy Commands

## Backend (Railway)
```bash
# 1. Push to GitHub (Railway auto-deploys)
git add .
git commit -m "Deploy backend to production"
git push origin main

# 2. Set environment variables in Railway dashboard
# 3. Monitor deployment at https://railway.app
```

## Frontend (Netlify)
```bash
# Option 1: Netlify CLI
cd REC_Website
npm run build
npx netlify deploy --prod --dir=dist

# Option 2: GitHub Auto-Deploy
git add .
git commit -m "Deploy frontend to production"  
git push origin main
# Netlify auto-deploys from main branch
```

## Full Stack Deploy
```bash
# Deploy both frontend and backend
git add .
git commit -m "Production deployment"
git push origin main

# Both Railway and Netlify will auto-deploy
```

## Environment Variables Checklist

### Railway (Backend):
- [ ] MONGODB_URI
- [ ] JWT_SECRET  
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL
- [ ] RATE_LIMIT_WINDOW_MS
- [ ] RATE_LIMIT_MAX_REQUESTS

### Netlify (Frontend):
- [ ] VITE_API_URL
- [ ] VITE_APP_NAME=RECtify
- [ ] VITE_NODE_ENV=production

## Post-Deploy Testing
1. [ ] Backend health check: `https://your-app.railway.app/api/health`
2. [ ] Frontend loads: `https://your-app.netlify.app`
3. [ ] Login works with demo accounts
4. [ ] API calls successful (check browser network tab)

## Demo Accounts for Testing
- ahmed.alshamsi@adnoc.ae / demo123
- fatima.hassan@masdar.ae / demo123
- omar.khalil@dewa.gov.ae / demo123
- demo@rectify.ae / demo123
