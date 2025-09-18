const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderType: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'cancelled', 'expired'],
    default: 'pending'
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
    enum: ['solar', 'wind', 'hydro', 'biomass', 'geothermal', 'nuclear']
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
    min: 1
  },
  remainingQuantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0.01
  },
  totalValue: {
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
    enum: ['I-REC', 'TIGR', 'Green-e', 'EKOenergy'],
    default: 'I-REC'
  },
  // For buy orders - purpose of purchase
  purpose: {
    type: String,
    enum: ['compliance', 'voluntary', 'resale', 'offset'],
    required: function() { return this.orderType === 'buy'; }
  },
  // For sell orders - holding reference
  holdingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RECHolding',
    required: function() { return this.orderType === 'sell'; }
  },
  // Order validity
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default to 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  // Trading fees
  platformFeeRate: {
    type: Number,
    default: 0.02 // 2%
  },
  blockchainFee: {
    type: Number,
    default: 5.00 // AED 5.00
  },
  // Buyer reservation (in fils)
  buyerReservedFils: {
    type: Number,
    default: 0
  },
  // Order visibility
  isPublic: {
    type: Boolean,
    default: true // Public orders appear in order book
  },
  // Matching preferences
  allowPartialFill: {
    type: Boolean,
    default: true
  },
  minFillQuantity: {
    type: Number,
    min: 1,
    default: 1
  },
  // Order metadata
  createdBy: {
    type: String,
    required: true // User's name for order book display
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
orderSchema.index({ orderType: 1, status: 1, isPublic: 1 });
orderSchema.index({ facilityName: 1, energyType: 1, vintage: 1 });
orderSchema.index({ price: 1, orderType: 1 });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ expiresAt: 1 });

// Pre-save middleware
orderSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  this.totalValue = this.quantity * this.price;
  
  // Set remaining quantity on first save
  if (this.isNew) {
    this.remainingQuantity = this.quantity;
  }
  
  // Update status based on remaining quantity
  if (this.remainingQuantity === 0) {
    this.status = 'completed';
  } else if (this.remainingQuantity < this.quantity && this.remainingQuantity > 0) {
    this.status = 'partial';
  }
  
  next();
});

// Methods
orderSchema.methods.canMatch = function() {
  return this.status === 'pending' || (this.status === 'partial' && this.allowPartialFill);
};

orderSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

orderSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

orderSchema.methods.fillPartial = function(fillQuantity) {
  if (fillQuantity > this.remainingQuantity) {
    throw new Error('Fill quantity exceeds remaining quantity');
  }
  
  this.remainingQuantity -= fillQuantity;
  
  if (this.remainingQuantity === 0) {
    this.status = 'completed';
  } else {
    this.status = 'partial';
  }
  
  return this.save();
};

// Static methods
orderSchema.statics.getOrderBook = async function(limit = 50) {
  const buyOrders = await this.find({
    orderType: 'buy',
    status: { $in: ['pending', 'partial'] },
    isPublic: true,
    expiresAt: { $gt: new Date() }
  })
  .sort({ price: -1, createdAt: 1 }) // Highest price first for buy orders
  .limit(limit)
  .populate('userId', 'firstName lastName company')
  .lean();

  const allSellOrders = await this.find({
    orderType: 'sell',
    status: { $in: ['pending', 'partial'] },
    isPublic: true,
    expiresAt: { $gt: new Date() }
  })
  .sort({ price: 1, createdAt: 1 }) // Lowest price first for sell orders
  .populate('userId', 'firstName lastName company')
  .lean();

  // Deduplicate sell orders: keep only the lowest price for each unique facility/product combination
  const sellOrderMap = new Map();
  
  allSellOrders.forEach(order => {
    // Create a unique key for each facility/product combination
    const key = `${order.facilityName}-${order.energyType}-${order.emirate}-${order.vintage}-${order.certificationStandard}`;
    
    // If this is the first order for this combination, or if this order has a lower price
    if (!sellOrderMap.has(key) || order.price < sellOrderMap.get(key).price) {
      sellOrderMap.set(key, order);
    }
  });
  
  // Convert map back to array and limit results
  const sellOrders = Array.from(sellOrderMap.values())
    .sort((a, b) => a.price - b.price) // Sort by price ascending
    .slice(0, limit);

  return { buyOrders, sellOrders };
};

orderSchema.statics.getUserOrders = async function(userId, status = null) {
  const query = { userId: new mongoose.Types.ObjectId(userId) };
  if (status) {
    query.status = status;
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .populate('holdingId')
    .lean();
};

orderSchema.statics.findMatchingOrders = async function(order) {
  const oppositeType = order.orderType === 'buy' ? 'sell' : 'buy';
  const priceCondition = order.orderType === 'buy' 
    ? { price: { $lte: order.price } } // Buy order matches sell orders at or below buy price
    : { price: { $gte: order.price } }; // Sell order matches buy orders at or above sell price

  // For network trading, we match based on energy type, vintage, emirate, and certification standard
  // Users can buy from any facility that meets their criteria, not just the exact same facility
  return await this.find({
    orderType: oppositeType,
    status: { $in: ['pending', 'partial'] },
    energyType: order.energyType,
    vintage: order.vintage,
    emirate: order.emirate,
    certificationStandard: order.certificationStandard,
    isPublic: true,
    expiresAt: { $gt: new Date() },
    userId: { $ne: order.userId }, // Don't match with own orders
    ...priceCondition
  })
  .sort(order.orderType === 'buy' ? { price: 1 } : { price: -1 }) // Best price first
  .populate('userId', 'firstName lastName company');
};

orderSchema.statics.expireOldOrders = async function() {
  return await this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      status: { $in: ['pending', 'partial'] }
    },
    { 
      status: 'expired',
      lastUpdated: new Date()
    }
  );
};

module.exports = mongoose.model('Order', orderSchema);
