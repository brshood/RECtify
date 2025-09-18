const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['trader', 'facility-owner', 'compliance-officer', 'admin'],
    default: 'trader'
  },
  tier: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  emirate: {
    type: String,
    required: true,
    enum: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain']
  },
  profileImage: {
    type: String,
    default: null
  },
  preferences: {
    currency: {
      type: String,
      enum: ['AED', 'USD'],
      default: 'AED'
    },
    language: {
      type: String,
      enum: ['en', 'ar'],
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    dashboardLayout: {
      type: String,
      enum: ['default', 'compact', 'detailed'],
      default: 'default'
    }
  },
  permissions: {
    canTrade: {
      type: Boolean,
      default: true
    },
    canRegisterFacilities: {
      type: Boolean,
      default: false
    },
    canViewAnalytics: {
      type: Boolean,
      default: false
    },
    canExportReports: {
      type: Boolean,
      default: false
    },
    canManageUsers: {
      type: Boolean,
      default: false
    }
  },
  portfolioValue: {
    type: Number,
    default: 0
  },
  totalRecs: {
    type: Number,
    default: 0
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Set permissions based on role before saving
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'trader':
        this.permissions = {
          canTrade: true,
          canRegisterFacilities: false,
          canViewAnalytics: this.tier !== 'basic',
          canExportReports: this.tier !== 'basic',
          canManageUsers: false
        };
        break;
      case 'facility-owner':
        this.permissions = {
          canTrade: true,
          canRegisterFacilities: true,
          canViewAnalytics: true,
          canExportReports: true,
          canManageUsers: false
        };
        break;
      case 'compliance-officer':
        this.permissions = {
          canTrade: false,
          canRegisterFacilities: false,
          canViewAnalytics: true,
          canExportReports: true,
          canManageUsers: true
        };
        break;
      case 'admin':
        this.permissions = {
          canTrade: true,
          canRegisterFacilities: true,
          canViewAnalytics: true,
          canExportReports: true,
          canManageUsers: true
        };
        break;
    }
  }
  next();
});

// Hash password before saving - Enhanced security
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Enhanced salt rounds for better security
    const saltRounds = process.env.NODE_ENV === 'production' ? 14 : 12;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Clear any password reset tokens when password is changed
    if (this.passwordResetToken) {
      this.passwordResetToken = undefined;
      this.passwordResetExpires = undefined;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Account lockout constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Account lockout methods
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Compare password method - Enhanced with lockout protection
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Check if account is locked
  if (this.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  // Reset login attempts on successful login
  if (isMatch && this.loginAttempts > 0) {
    await this.resetLoginAttempts();
  }
  
  return isMatch;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  // Generate a 6-character alphanumeric code
  const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Hash the token and save to database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expiration time (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Check if password reset token is valid
userSchema.methods.isPasswordResetTokenValid = function(token) {
  if (!this.passwordResetToken || !this.passwordResetExpires) {
    return false;
  }
  
  // Check if token has expired
  if (Date.now() > this.passwordResetExpires) {
    return false;
  }
  
  // Hash the provided token and compare
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  return this.passwordResetToken === hashedToken;
};

// Clear password reset token
userSchema.methods.clearPasswordResetToken = function() {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  return this.save();
};

// Transform output to match frontend interface
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  
  // Remove sensitive fields
  delete user.password;
  delete user.__v;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  
  // Transform _id to id and format dates
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    company: user.company,
    role: user.role,
    tier: user.tier,
    emirate: user.emirate,
    joinedDate: user.createdAt,
    lastLogin: user.lastLogin,
    profileImage: user.profileImage,
    preferences: user.preferences,
    permissions: user.permissions,
    portfolioValue: user.portfolioValue,
    totalRecs: user.totalRecs,
    verificationStatus: user.verificationStatus
  };
};

module.exports = mongoose.model('User', userSchema);
