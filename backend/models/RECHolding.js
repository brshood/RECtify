const mongoose = require('mongoose');

const recHoldingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facilityName: {
    type: String,
    required: true,
    trim: true
  },
  facilityId: {
    type: String,
    required: true,
    trim: true
  },
  energyType: {
    type: String,
    required: true,
    enum: ['solar', 'wind', 'hydro', 'biomass', 'geothermal', 'nuclear'],
    default: 'solar'
  },
  vintage: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear()
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  averagePurchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  emirate: {
    type: String,
    required: true,
    enum: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain']
  },
  certificationStandard: {
    type: String,
    enum: ['I-REC', 'TIGR', 'Green-e', 'EKOenergy'],
    default: 'I-REC'
  },
  isLocked: {
    type: Boolean,
    default: false // Locked RECs cannot be traded
  },
  lockedUntil: {
    type: Date,
    default: null
  },
  acquisitionDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
recHoldingSchema.index({ userId: 1, facilityId: 1 });
recHoldingSchema.index({ userId: 1, energyType: 1 });
recHoldingSchema.index({ facilityName: 1, vintage: 1 });

// Update lastUpdated on save
recHoldingSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  this.totalValue = this.quantity * this.averagePurchasePrice;
  next();
});

// Methods
recHoldingSchema.methods.canTrade = function() {
  return !this.isLocked && (!this.lockedUntil || this.lockedUntil < new Date());
};

recHoldingSchema.methods.lock = function(until) {
  this.isLocked = true;
  this.lockedUntil = until || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours
  return this.save();
};

recHoldingSchema.methods.unlock = function() {
  this.isLocked = false;
  this.lockedUntil = null;
  return this.save();
};

// Static methods
recHoldingSchema.statics.getUserTotalRECs = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { 
      $group: { 
        _id: null, 
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: '$totalValue' },
        uniqueFacilities: { $addToSet: '$facilityName' },
        energyTypes: { $addToSet: '$energyType' }
      } 
    }
  ]);
  
  return result[0] || { totalQuantity: 0, totalValue: 0, uniqueFacilities: [], energyTypes: [] };
};

recHoldingSchema.statics.getUserHoldingsByFacility = async function(userId) {
  return await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$facilityName',
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: '$totalValue' },
        averagePrice: { $avg: '$averagePurchasePrice' },
        energyType: { $first: '$energyType' },
        emirate: { $first: '$emirate' },
        vintage: { $first: '$vintage' }
      }
    },
    { $sort: { totalValue: -1 } }
  ]);
};

module.exports = mongoose.model('RECHolding', recHoldingSchema);
