const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform output to match frontend interface
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  
  // Remove sensitive fields
  delete user.password;
  delete user.__v;
  
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
