# Backend Tests

This directory contains all automated tests for the RECtify backend API.

## Test Structure

```
__tests__/
├── setup.js              # Test environment configuration
├── helpers/
│   ├── testData.js       # Test data factories
│   └── apiHelper.js      # API testing utilities
├── auth.test.js          # Authentication tests
├── orders.test.js        # Order management tests
├── trading.test.js       # Trading service tests
└── security.test.js      # Security middleware tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Database

Tests use a separate MongoDB database (`rectify-test`). Configure via:
- `MONGODB_TEST_URI` environment variable
- Default: `mongodb://localhost:27017/rectify-test`

## Writing Tests

1. Use test data factories from `helpers/testData.js`
2. Clean database state is automatic (afterEach in setup.js)
3. Use `APIHelper` for authenticated requests
4. Follow existing test patterns

## Coverage Requirements

- Branches: 60%
- Functions: 60%
- Lines: 60%
- Statements: 60%

Coverage enforced in `jest.config.js`.

