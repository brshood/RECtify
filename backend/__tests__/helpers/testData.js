// Test data factories for consistent test data generation
const bcrypt = require('bcryptjs');

const createTestUser = async (overrides = {}) => {
  const User = require('../../models/User');
  
  const defaultUser = {
    email: `test-${Date.now()}@rectify.ae`,
    password: await bcrypt.hash('TestPassword123!', 10),
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
    energyType: 'Solar',
    quantity: 1000,
    vintage: 2024,
    emirate: 'Abu Dhabi',
    acquisitionDate: new Date(),
    acquisitionPrice: 50,
    currentPrice: 55,
    status: 'active',
    ...overrides
  };
  
  return await RECHolding.create(defaultHolding);
};

const createTestOrder = async (userId, overrides = {}) => {
  const Order = require('../../models/Order');
  
  const defaultOrder = {
    userId,
    type: 'buy',
    facilityName: 'Test Solar Farm',
    energyType: 'Solar',
    quantity: 100,
    price: 50,
    totalValue: 5000,
    vintage: 2024,
    emirate: 'Abu Dhabi',
    status: 'active',
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
    energyType: 'Solar',
    quantity: 100,
    price: 50,
    totalValue: 5000,
    vintage: 2024,
    emirate: 'Abu Dhabi',
    platformFee: 25,
    status: 'completed',
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

