const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction parties
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order references
  buyOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  sellOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // REC details
  facilityName: {
    type: String,
    required: true
  },
  facilityId: {
    type: String,
    required: true
  },
  energyType: {
    type: String,
    required: true,
    enum: ['solar', 'wind', 'hydro', 'biomass', 'geothermal', 'nuclear']
  },
  vintage: {
    type: Number,
    required: true
  },
  emirate: {
    type: String,
    required: true,
    enum: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain']
  },
  certificationStandard: {
    type: String,
    required: true,
    enum: ['I-REC', 'TIGR', 'Green-e', 'EKOenergy']
  },
  
  // Transaction details
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0.01
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Fees
  buyerPlatformFee: {
    type: Number,
    required: true,
    default: 0
  },
  sellerPlatformFee: {
    type: Number,
    required: true,
    default: 0
  },
  blockchainFee: {
    type: Number,
    required: true,
    default: 5.00
  },
  
  // Transaction status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'disputed'],
    default: 'pending'
  },
  
  // Settlement details
  settlementStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  settlementDate: {
    type: Date
  },
  
  // Blockchain/Registry details
  blockchainTxHash: {
    type: String,
    sparse: true
  },
  registryTransferRef: {
    type: String,
    sparse: true
  },
  
  // Metadata
  matchedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  
  // Notes and references
  notes: {
    type: String,
    maxlength: 500
  },
  internalRef: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ buyerId: 1, createdAt: -1 });
transactionSchema.index({ sellerId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, settlementStatus: 1 });
transactionSchema.index({ facilityName: 1, vintage: 1 });
transactionSchema.index({ matchedAt: -1 });

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Calculate total amount
  this.totalAmount = this.quantity * this.pricePerUnit;
  
  // Generate internal reference if not exists
  if (!this.internalRef && this.isNew) {
    this.internalRef = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  
  // Set completion date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Methods
transactionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.settlementStatus = 'completed';
  this.settlementDate = new Date();
  this.completedAt = new Date();
  return this.save();
};

transactionSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.settlementStatus = 'failed';
  if (reason) {
    this.notes = (this.notes || '') + ` Failed: ${reason}`;
  }
  return this.save();
};

// Static methods
transactionSchema.statics.getUserTransactions = async function(userId, limit = 50) {
  return await this.find({
    $or: [
      { buyerId: userId },
      { sellerId: userId }
    ]
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('buyerId', 'firstName lastName company')
  .populate('sellerId', 'firstName lastName company')
  .populate('buyOrderId')
  .populate('sellOrderId')
  .lean();
};

transactionSchema.statics.getMarketStats = async function(timeframe = '30d') {
  const startDate = new Date();
  switch(timeframe) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const stats = await this.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalVolume: { $sum: '$quantity' },
        totalValue: { $sum: '$totalAmount' },
        averagePrice: { $avg: '$pricePerUnit' },
        transactionCount: { $sum: 1 },
        minPrice: { $min: '$pricePerUnit' },
        maxPrice: { $max: '$pricePerUnit' }
      }
    }
  ]);

  return stats[0] || {
    totalVolume: 0,
    totalValue: 0,
    averagePrice: 0,
    transactionCount: 0,
    minPrice: 0,
    maxPrice: 0
  };
};

transactionSchema.statics.getPriceHistory = async function(facilityName, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        facilityName: facilityName,
        status: 'completed',
        completedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
        },
        averagePrice: { $avg: '$pricePerUnit' },
        volume: { $sum: '$quantity' },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
