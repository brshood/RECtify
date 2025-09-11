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
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const holdingsRoutes = require('./routes/holdings');
const ordersRoutes = require('./routes/orders');
const transactionsRoutes = require('./routes/transactions');
const recSecurityRoutes = require('./routes/recSecurity');
const { xssProtection, validateRequestSize, securityHeaders } = require('./middleware/security');
const RECSecurityService = require('./services/RECSecurityService');
const MongoAtlasIPManager = require('./utils/mongoAtlasIP');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - Enhanced
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://rectifygo.com", "https://rectifygo.netlify.app", "https://rectify-production.up.railway.app"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
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
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    retryAfter: 900
  }
});
app.use('/api/auth', authLimiter);

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

// Stripe webhook needs raw body; mount BEFORE JSON parser
const paymentsWebhook = require('./routes/paymentsWebhook');
app.use('/api/webhooks', paymentsWebhook);

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

// MongoDB Atlas connection with automatic IP management
async function connectToMongoDB() {
  const ipManager = new MongoAtlasIPManager();
  
  try {
    // Update IP whitelist before attempting connection
    if (ipManager.isConfigured()) {
      console.log('🔄 Managing MongoDB Atlas IP whitelist...');
      const ipUpdateSuccess = await ipManager.updateRailwayIP();
      
      if (!ipUpdateSuccess) {
        console.log('⚠️ IP whitelist update failed, but continuing with connection attempt...');
      } else {
        // Wait a moment for Atlas to propagate the changes
        console.log('⏳ Waiting for Atlas to propagate IP changes...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    // Attempt MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Log the outbound IP for verification
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => console.log('🌐 Railway connecting from IP:', data.ip))
      .catch(err => console.log('Could not determine outbound IP:', err.message));
      
    // Set up periodic IP monitoring (every 30 minutes)
    if (ipManager.isConfigured()) {
      setInterval(async () => {
        try {
          await ipManager.checkAndUpdateIP();
        } catch (error) {
          console.error('❌ Periodic IP check failed:', error.message);
        }
      }, 30 * 60 * 1000); // 30 minutes
      console.log('🕐 Periodic IP monitoring started (every 30 minutes)');
    }
      
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error);
    
    // If connection fails due to IP issues, try updating IP and retry once
    if (error.message.includes('IP') || error.message.includes('not authorized') || error.message.includes('authentication failed')) {
      console.log('🔄 Connection failed, attempting IP update and retry...');
      try {
        await ipManager.updateRailwayIP();
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait longer for propagation
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas after IP update');
      } catch (retryError) {
        console.error('❌ Retry connection failed:', retryError.message);
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    } else if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// Initialize MongoDB connection
connectToMongoDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/holdings', holdingsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/rec-security', recSecurityRoutes);
const paymentsRoutes = require('./routes/payments');
app.use('/api/payments', paymentsRoutes);

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

const server = app.listen(PORT, async () => {
  console.log(`🚀 RECtify API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize blockchain service for REC security
  try {
    console.log('🔒 Initializing REC Security Service...');
    const blockchainInit = await RECSecurityService.initialize();
    if (blockchainInit.success) {
      console.log(`✅ REC Security Service initialized: ${blockchainInit.message}`);
      console.log(`🌐 Network: ${blockchainInit.network}`);
      console.log(`🎯 Purpose: ${blockchainInit.purpose}`);
    } else {
      console.log(`⚠️ REC Security Service initialization failed: ${blockchainInit.message}`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize REC Security Service:', error.message);
  }
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
