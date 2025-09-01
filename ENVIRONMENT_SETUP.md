# Environment Variables Setup Guide

## 📁 Environment Files Structure

```
RECtify/
├── backend/
│   ├── env.sample          # Development template
│   ├── env.production      # Production template
│   └── .env               # Your actual environment (DO NOT COMMIT)
└── REC_Website/
    ├── env.sample          # Development template  
    ├── env.production      # Production template
    └── .env               # Your actual environment (DO NOT COMMIT)
```

## 🔧 Development Setup

### Backend Development (.env)
Copy `backend/env.sample` to `backend/.env` and update with your values:

```env
MONGODB_URI=mongodb+srv://admin:password123123@cluster0.ph9pnjt.mongodb.net/rectify?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_development_jwt_secret_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend Development (.env)
Copy `REC_Website/env.sample` to `REC_Website/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Production Deployment

### Backend Production
Copy `backend/env.production` to `backend/.env` and update with:

```env
MONGODB_URI=mongodb+srv://rectify-prod-user:YOUR_SECURE_PASSWORD@cluster0.ph9pnjt.mongodb.net/rectify-production?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET_64_CHARS_LONG
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Production
Copy `REC_Website/env.production` to `REC_Website/.env` and update with:

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_NAME=RECtify
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

## 🔒 Security Notes

- **NEVER commit `.env` files** to version control
- **Use different credentials** for development and production
- **Generate new JWT secrets** for each environment
- **Use environment-specific database names** (rectify-dev, rectify-production)

## 🎯 Current Secure Credentials

### Production MongoDB User:
- Username: `rectify-prod-user`
- Password: `vL99vkCu6bvomMkp6hKL`

### Production JWT Secret:
```
0301bf995f8d99035bba14bbb1b3df7e7133ea2bece542d524e4613524f2de2472dc9fe664f2a3c594c2ee11dd2acf10409b2c6f3ee4f90aa269e7618488081c
```

**⚠️ Store these securely and update them in your actual .env files!**
