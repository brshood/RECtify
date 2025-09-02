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
MONGODB_URI=<YOUR_DEV_MONGODB_URI>
JWT_SECRET=<YOUR_DEV_JWT_SECRET>
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
Set these keys in your platform (Railway) variables dashboard:

```env
MONGODB_URI=<SET_IN_PLATFORM_DASHBOARD>
JWT_SECRET=<SET_IN_PLATFORM_DASHBOARD>
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

## 🎯 Security

- Do not store live credentials in docs or code.
- Keep `.env` files out of git; use platform variables for production.
