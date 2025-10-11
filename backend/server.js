// Initialize Sentry FIRST - before all other imports
let Sentry = null;
let sentryEnabled = false;

// Load environment variables
require('dotenv').config();

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  try {
    Sentry = require('@sentry/node');
    
    // Try to load profiling (optional, may not be available in all environments)
    let integrations = [];
    try {
      const { ProfilingIntegration } = require('@sentry/profiling-node');
      integrations.push(new ProfilingIntegration());
      console.log('✅ Sentry profiling enabled');
    } catch (err) {
      console.log('⚠️  Sentry profiling not available, skipping');
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event) {
        // Strip sensitive data from error reports
        if (event.request) {
          if (event.request.data) {
            // Remove sensitive fields
            delete event.request.data.password;
            delete event.request.data.token;
            delete event.request.data.resetCode;
          }
          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
          }
        }
        return event;
      }
    });
    
    // Verify Handlers exist
    if (Sentry && Sentry.Handlers) {
      sentryEnabled = true;
      console.log('✅ Sentry monitoring initialized');
    } else {
      console.log('⚠️  Sentry initialized but handlers not available');
    }
  } catch (err) {
    console.log('⚠️  Sentry initialization failed:', err.message);
    Sentry = null;
  }
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const morgan = require('morgan');
const payments = require('./routes/payments');
const Order = require('./models/Order');
const User = require('./models/User');
const RECHolding = require('./models/RECHolding');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const holdingsRoutes = require('./routes/holdings');
const ordersRoutes = require('./routes/orders');
const transactionsRoutes = require('./routes/transactions');
const recSecurityRoutes = require('./routes/recSecurity');
const contactRoutes = require('./routes/contact');
const { xssProtection, validateRequestSize, securityHeaders } = require('./middleware/security');
const RECSecurityService = require('./services/RECSecurityService');
const MongoAtlasIPManager = require('./utils/mongoAtlasIP');

const app = express();
// Mount Stripe webhook BEFORE any body parsers or limiters
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), payments.webhookHandler);
const PORT = process.env.PORT || 5000;

// Security middleware - Enhanced
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://rectifygo.com", "https://rectifygo.netlify.app", "https://rectify-production.up.railway.app", "https://api.stripe.com", "https://checkout.stripe.com", "https://fonts.gstatic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://checkout.stripe.com"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://rectifygo.netlify.app',
      'https://rectifygo.com',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Prevent NoSQL injection attacks
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['role', 'tier', 'emirate'] // Allow these fields to have multiple values
}));
// Rate limiting - Enhanced for production
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    error: 'Too many requests from this IP',
    retryAfter: Math.ceil((process.env.RATE_LIMIT_WINDOW_MS || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 auth requests per windowMs (increased for testing)
  message: {
    error: 'Too many authentication attempts',
    retryAfter: 900
  }
});

// Very strict rate limiting for password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts. Please try again in 1 hour.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: 500 // add 500ms of delay per request after delayAfter
});
app.use(speedLimiter);
// Logging - Enhanced for security
app.use(morgan('combined', {
  skip: function (req, res) {
    // Don't log successful requests in production to reduce noise
    return process.env.NODE_ENV === 'production' && res.statusCode < 400;
  }
}));

// Body parsing middleware - Secured
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb for security
  verify: (req, res, buf, encoding) => {
    // Add request body validation if needed
    if (buf && buf.length > 1024 * 1024) { // 1MB limit
      throw new Error('Request body too large');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 20 // Limit number of parameters
}));

// Additional security middleware
app.use(securityHeaders);
app.use(validateRequestSize);
app.use(xssProtection);

// Sentry request tracking (if enabled)
if (sentryEnabled && Sentry && Sentry.Handlers) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Performance monitoring middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  
  // Log slow requests in production
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    if (duration > 1000 && process.env.NODE_ENV === 'production') {
      console.warn('Slow Request:', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
  });
  
  next();
});

// MongoDB Atlas connection
if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '') {
  mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    // Log the outbound IP for Railway IP identification
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => console.log('🌐 Railway connecting from IP:', data.ip))
      .catch(err => console.log('Could not determine outbound IP:', err.message));
  })
  .catch((error) => {
    console.error('❌ MongoDB Atlas connection error:', error);
    // Exit process in production if DB connection fails
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
} else {
  console.log('⚠️ MongoDB URI not configured - running in development mode without database');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/rec-security', recSecurityRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payments', payments.router);

// Health check endpoint - Enhanced for production monitoring
app.get('/api/health', async (req, res) => {
  try {
    // Basic health check
    const healthCheck = {
      status: 'OK',
      message: 'RECtify API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    // Database connectivity check
    if (mongoose.connection.readyState === 1) {
      healthCheck.database = 'Connected';
    } else {
      healthCheck.database = 'Disconnected';
      healthCheck.status = 'WARNING';
    }

    // System resources check
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };
    
    healthCheck.memory = memoryUsageMB;

    // Response time check
    healthCheck.responseTime = Date.now() - req.startTime;

    res.json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
    });
  }
});

// Sentry error handler (must be before other error handlers)
if (sentryEnabled && Sentry && Sentry.Handlers) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handling middleware - Production optimized
app.use((error, req, res, next) => {
  // Log error details (but not to client in production)
  if (process.env.NODE_ENV === 'production') {
    console.error('Production Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('Development Error:', error);
  }

  // Send appropriate response
  const statusCode = error.status || error.statusCode || 500;
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    const prodErrorMessages = {
      400: 'Bad Request',
      401: 'Unauthorized', 
      403: 'Forbidden',
      404: 'Not Found',
      413: 'Payload Too Large',
      423: 'Locked',
      429: 'Too Many Requests',
      500: 'Internal Server Error'
    };
    
    res.status(statusCode).json({
      success: false,
      message: prodErrorMessages[statusCode] || 'An error occurred',
      code: statusCode
    });
  } else {
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Internal server error',
      stack: error.stack,
      code: statusCode
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 RECtify API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Starting graceful shutdown...');
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ HTTP server closed');
    
    // Close database connection
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Starting graceful shutdown...');
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ HTTP server closed');
    
    // Close database connection
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
