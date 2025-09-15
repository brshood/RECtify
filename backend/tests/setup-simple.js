// Simple test setup without database connection
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32-chars';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_secret';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock mongoose for unit tests
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 1,
    close: jest.fn(),
    db: {
      dropDatabase: jest.fn()
    },
    collections: {}
  },
  Schema: jest.fn(() => ({
    pre: jest.fn(),
    methods: {},
    statics: {},
    virtual: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn()
  })),
  model: jest.fn(() => ({
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    updateOne: jest.fn(),
    aggregate: jest.fn()
  })),
  Types: {
    ObjectId: jest.fn(() => 'mock-object-id')
  }
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password, salt) => Promise.resolve('hashed-' + password)),
  compare: jest.fn((password, hash) => Promise.resolve(hash === 'hashed-' + password)),
  genSalt: jest.fn(() => Promise.resolve('mock-salt'))
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options) => 'mock-jwt-token'),
  verify: jest.fn((token, secret) => ({ userId: 'mock-user-id' }))
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({ toString: jest.fn(() => 'mock-random-hex') }))
}));

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(() => Promise.resolve({ id: 'mock-payment-intent' })),
      retrieve: jest.fn(() => Promise.resolve({ id: 'mock-payment-intent', status: 'succeeded' }))
    },
    webhooks: {
      constructEvent: jest.fn(() => ({ type: 'mock-event' }))
    }
  }));
});
