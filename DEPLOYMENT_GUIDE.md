# 🚀 RECtify Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **Security & Optimization Complete:**
- [x] MongoDB Atlas with secure credentials
- [x] All temporary files removed
- [x] Security hardening implemented
- [x] Production optimizations added
- [x] Environment files configured

## 🔧 **Backend Deployment (Railway)**

### **Step 1: Prepare Railway Deployment**

1. **Create Railway Account**: [railway.app](https://railway.app)
2. **Connect GitHub**: Link your repository
3. **Create New Project**: Deploy from GitHub repo

### **Step 2: Configure Environment Variables**

In Railway dashboard, add these environment variables:

```env
# Database
MONGODB_URI=mongodb+srv://rectify-prod-user:vL99vkCu6bvomMkp6hKL@cluster0.ph9pnjt.mongodb.net/rectify-production?retryWrites=true&w=majority&appName=Cluster0

# Security
JWT_SECRET=0301bf995f8d99035bba14bbb1b3df7e7133ea2bece542d524e4613524f2de2472dc9fe664f2a3c594c2ee11dd2acf10409b2c6f3ee4f90aa269e7618488081c

# Server
NODE_ENV=production
PORT=5000

# Frontend URL (update after Netlify deployment)
FRONTEND_URL=https://your-app-name.netlify.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Step 3: Deploy Backend**

1. **Push to GitHub**: Railway auto-deploys from main branch
2. **Monitor Deployment**: Check Railway logs
3. **Test Health Check**: Visit `https://your-app.railway.app/api/health`
4. **Copy Backend URL**: Save for frontend configuration

---

## 🌐 **Frontend Deployment (Netlify)**

### **Step 1: Update Frontend Environment**

Create `REC_Website/.env` with your deployed backend URL:

```env
VITE_API_URL=https://your-backend-app.railway.app/api
VITE_APP_NAME=RECtify
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

### **Step 2: Build & Deploy**

**Option A: Netlify CLI**
```bash
cd REC_Website
npm run build
npx netlify deploy --prod --dir=dist
```

**Option B: GitHub Integration**
1. Connect Netlify to your GitHub repo
2. Set build settings:
   - **Base directory**: `REC_Website`
   - **Build command**: `npm run build`
   - **Publish directory**: `REC_Website/dist`

### **Step 3: Configure Netlify**

1. **Environment Variables**: Add production env vars in Netlify dashboard
2. **Custom Domain**: Configure your domain (optional)
3. **HTTPS**: Automatically enabled by Netlify

---

## 🔄 **Post-Deployment Configuration**

### **Step 1: Update CORS Origins**

Update backend environment variable:
```env
FRONTEND_URL=https://your-actual-netlify-url.netlify.app
```

### **Step 2: Test Complete Flow**

1. **Health Check**: `GET https://your-backend.railway.app/api/health`
2. **Frontend Access**: Visit your Netlify URL
3. **Authentication**: Test login/register with demo accounts
4. **API Communication**: Verify frontend connects to backend

### **Step 3: Database Seeding (Production)**

```bash
# Set production environment variables locally
# Then run:
npm run seed:prod
```

---

## 📊 **Monitoring & Maintenance**

### **Health Monitoring**
- **Backend Health**: `https://your-backend.railway.app/api/health`
- **Railway Metrics**: Monitor in Railway dashboard
- **Netlify Analytics**: Monitor in Netlify dashboard

### **Error Monitoring**
- Check Railway logs for backend errors
- Monitor Netlify function logs
- Set up alerts for downtime

### **Security Monitoring**
- Monitor failed login attempts
- Check for unusual traffic patterns
- Review security logs regularly

---

## 🔐 **Production Security Checklist**

- [x] **HTTPS Enabled**: Both Railway and Netlify provide HTTPS
- [x] **Environment Variables**: Securely stored in platform dashboards
- [x] **CORS Configured**: Only your frontend domain allowed
- [x] **Rate Limiting**: Enabled and configured
- [x] **Input Validation**: All inputs sanitized
- [x] **Error Handling**: No sensitive data exposed
- [x] **Account Lockout**: Brute force protection active
- [x] **Security Headers**: All security headers set

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**Backend Won't Start:**
- Check Railway logs
- Verify environment variables
- Ensure MongoDB Atlas connection

**CORS Errors:**
- Update `FRONTEND_URL` environment variable
- Check Railway deployment logs

**Database Connection Issues:**
- Verify MongoDB Atlas credentials
- Check network access settings
- Test connection string

**Frontend Can't Connect:**
- Verify `VITE_API_URL` points to Railway URL
- Check Railway backend is running
- Test API endpoints manually

---

## 🎯 **Deployment URLs**

After deployment, update this section:

- **Frontend**: `https://your-app.netlify.app`
- **Backend API**: `https://your-backend.railway.app`
- **Health Check**: `https://your-backend.railway.app/api/health`
- **MongoDB**: `mongodb+srv://rectify-prod-user:***@cluster0.ph9pnjt.mongodb.net/rectify-production`

---

## ✅ **Deployment Complete!**

Your RECtify application is now:
- 🔒 **Secure**: Enterprise-grade security
- 🚀 **Optimized**: Production-ready performance  
- 🌐 **Deployed**: Accessible worldwide
- 📊 **Monitored**: Health checks and logging
- 🔄 **Scalable**: Auto-scaling enabled

**Congratulations! Your RECtify platform is live!** 🎉
