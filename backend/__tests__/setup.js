// Test setup and global configuration
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// Increase timeout for database operations
jest.setTimeout(30000); // Increased to 30s for memory server startup

let mongoServer;

// Connect to test database before all tests
beforeAll(async () => {
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  // Use real MongoDB in CI (faster), Memory Server locally (no setup needed)
  if (process.env.MONGODB_TEST_URI) {
    // CI environment - use real MongoDB service
    console.log('Using CI MongoDB service');
    process.env.MONGODB_URI = process.env.MONGODB_TEST_URI; // Set for routes to use
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  } else {
    // Local development - use in-memory MongoDB
    console.log('Starting in-memory MongoDB for testing...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri; // Set for routes to use
    await mongoose.connect(mongoUri);
    console.log('In-memory MongoDB started');
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.connection.close();
  
  // Stop memory server if it was started
  if (mongoServer) {
    await mongoServer.stop();
    console.log('In-memory MongoDB stopped');
  }
});

// Suppress console output during tests (optional - keep log for MongoDB messages)
global.console = {
  ...console,
  // log: jest.fn(), // Keep logs for MongoDB startup messages
  debug: jest.fn(),
  info: jest.fn(),
  // warn: jest.fn(), // Keep warnings
  // error: jest.fn(), // Keep errors for debugging
};

