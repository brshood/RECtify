// Test data factories for consistent test data generation
const bcrypt = require('bcryptjs');

const createTestUser = async (overrides = {}) => {
  const User = require('../../models/User');
  
  const defaultUser = {
    email: `test-${Date.now()}@rectify.ae`,
    password: 'TestPassword123!', // Plain password - model will hash it
    firstName: 'Test',
    lastName: 'User',
    company: 'Test Company',
    role: 'trader',
    tier: 'basic',
    emirate: 'Abu Dhabi',
    verificationStatus: 'verified',
    emailVerified: true,
    isActive: true,
    cashBalance: 10000,
    cashCurrency: 'AED',
    ...overrides
  };
  
  return await User.create(defaultUser);
};

const createTestHolding = async (userId, overrides = {}) => {
  const RECHolding = require('../../models/RECHolding');
  
  const defaultHolding = {
    userId,
    facilityName: 'Test Solar Farm',
    facilityId: `FAC-${Date.now()}`,
    energyType: 'solar', // lowercase
    quantity: 1000,
    vintage: 2024,
    averagePurchasePrice: 50, // required
    totalValue: 50000, // required (quantity * price)
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC',
    acquisitionDate: new Date(),
    ...overrides
  };
  
  return await RECHolding.create(defaultHolding);
};

const createTestOrder = async (userId, overrides = {}) => {
  const Order = require('../../models/Order');
  const User = require('../../models/User');
  
  // Get user's name for createdBy field
  const user = await User.findById(userId);
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Test User';
  
  const defaultOrder = {
    userId,
    orderType: 'buy', // not 'type'
    facilityName: 'Test Solar Farm',
    facilityId: `FAC-${Date.now()}`,
    energyType: 'solar', // lowercase
    quantity: 100,
    remainingQuantity: 100, // required
    price: 50,
    totalValue: 5000,
    vintage: 2024,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC',
    status: 'pending', // not 'active'
    createdBy: userName, // required
    purpose: 'compliance', // required for buy orders
    ...overrides
  };
  
  return await Order.create(defaultOrder);
};

const createTestTransaction = async (buyerId, sellerId, overrides = {}) => {
  const Transaction = require('../../models/Transaction');
  
  const defaultTransaction = {
    buyerId,
    sellerId,
    facilityName: 'Test Solar Farm',
    facilityId: `FAC-${Date.now()}`,
    energyType: 'solar', // lowercase
    quantity: 100,
    pricePerUnit: 50,
    totalAmount: 5000,
    buyerPlatformFee: 100,
    sellerPlatformFee: 100,
    blockchainFee: 5,
    vintage: 2024,
    emirate: 'Abu Dhabi',
    certificationStandard: 'I-REC',
    status: 'completed',
    settlementStatus: 'completed',
    ...overrides
  };
  
  return await Transaction.create(defaultTransaction);
};

const generateJWT = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, jti: require('crypto').randomBytes(16).toString('hex') },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = {
  createTestUser,
  createTestHolding,
  createTestOrder,
  createTestTransaction,
  generateJWT
};

